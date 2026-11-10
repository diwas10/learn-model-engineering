import math
from typing import List, Dict, Any, Tuple
import numpy as np
import torch
import torch.nn.functional as F

from app.models.lab_models import (
    AttentionComputeRequest, AttentionComputeResponse,
    LoRAMemoryRequest, LoRAMemoryResponse,
    KVCacheRequest, KVCacheResponse,
    QuantizationSimRequest, QuantizationSimResponse
)
from app.models.execution import GradCheckRequest, GradCheckResponse

class LabService:
    @staticmethod
    def compute_attention(req: AttentionComputeRequest) -> AttentionComputeResponse:
        Q = torch.tensor(req.query_vectors, dtype=torch.float32) # (seq_q, d_k)
        K = torch.tensor(req.key_vectors, dtype=torch.float32)   # (seq_k, d_k)
        V = torch.tensor(req.value_vectors, dtype=torch.float32) # (seq_k, d_v)
        
        d_k = Q.size(-1)
        raw_scores = torch.matmul(Q, K.transpose(-2, -1)) # (seq_q, seq_k)
        scaled_scores = raw_scores / (math.sqrt(d_k) * max(req.temperature, 1e-4))
        
        if req.causal_mask:
            seq_q, seq_k = raw_scores.size()
            mask = torch.triu(torch.full((seq_q, seq_k), float('-inf')), diagonal=1)
            masked_scores = scaled_scores + mask
        else:
            masked_scores = scaled_scores
            
        attn_weights = F.softmax(masked_scores, dim=-1)
        # Handle nan in softmax for fully masked rows
        attn_weights = torch.nan_to_num(attn_weights, nan=0.0)
        
        output_context = torch.matmul(attn_weights, V)
        
        # Calculate entropy per token row: - sum(p * log(p))
        eps = 1e-12
        p_safe = torch.clamp(attn_weights, min=eps)
        entropy = -torch.sum(attn_weights * torch.log(p_safe), dim=-1)
        
        return AttentionComputeResponse(
            raw_scores=raw_scores.tolist(),
            scaled_scores=scaled_scores.tolist(),
            attention_weights=attn_weights.tolist(),
            output_context=output_context.tolist(),
            entropy_per_token=entropy.tolist()
        )

    @staticmethod
    def calculate_lora_memory(req: LoRAMemoryRequest) -> LoRAMemoryResponse:
        # Base model estimation: typical LLaMA-like architecture
        # d_model = base_hidden_size, d_ffn = 8/3 * d_model or 4 * d_model
        d = req.base_hidden_size
        d_ff = int(8/3 * d)
        layers = req.num_layers
        r = req.lora_rank
        
        # Base model parameter count
        # Self-attention: Q, K, V, O projections: 4 * d * d
        # FFN (SwiGLU): gate_proj (d*d_ff), up_proj (d*d_ff), down_proj (d_ff*d) = 3 * d * d_ff
        # Norms: 2 * d
        params_per_layer = (4 * d * d) + (3 * d * d_ff) + (2 * d)
        embedding_params = 32000 * d # vocab_size ~ 32k
        base_params = layers * params_per_layer + embedding_params
        
        bytes_per_param = {"fp32": 4, "fp16": 2, "bf16": 2, "int8": 1, "int4": 0.5}.get(req.precision, 2)
        base_model_mem_gb = (base_params * bytes_per_param) / (1024**3)
        
        # Trainable LoRA parameters
        # For a linear layer d -> d, LoRA adds A: (d x r) and B: (r x d) = 2 * d * r
        lora_params_per_qkv = (2 * d * r) * 3 if req.apply_to_qkv else 0
        lora_params_per_o = (2 * d * r) if req.apply_to_qkv else 0
        lora_params_per_ffn = (2 * d * r + 2 * d_ff * r) * 2 if req.apply_to_ffn else 0
        
        trainable_per_layer = lora_params_per_qkv + lora_params_per_o + lora_params_per_ffn
        total_trainable = layers * trainable_per_layer
        
        # Trainable LoRA parameter weights memory in FP32/BF16
        trainable_mem_mb = (total_trainable * 2) / (1024**2)
        trainable_pct = (total_trainable / max(base_params, 1)) * 100.0
        
        # AdamW optimizer states for trainable params:
        # AdamW stores 1st moment (float32: 4 bytes) + 2nd moment (float32: 4 bytes) + master weights (4 bytes) = 12-16 bytes/param
        optimizer_mem_mb = (total_trainable * 12) / (1024**2)
        
        # Activation memory estimate: B * S * H * layers * overhead
        B, S, H = req.batch_size, req.sequence_length, d
        # Activations for backward pass with gradient checkpointing
        act_mem_gb = (B * S * H * 2 * 4) / (1024**3) # rough estimate with checkpointing
        
        total_training_gb = base_model_mem_gb + (optimizer_mem_mb / 1024) + act_mem_gb
        
        # Full finetune memory: base params + optimizer (12 bytes/param) + gradients (2 bytes/param)
        full_opt_gb = (base_params * 16) / (1024**3)
        full_act_gb = (B * S * H * layers * 16) / (1024**3)
        full_finetune_gb = base_model_mem_gb + full_opt_gb + full_act_gb
        
        savings = full_finetune_gb / max(total_training_gb, 0.1)
        
        return LoRAMemoryResponse(
            base_model_params=base_params,
            base_model_memory_gb=round(base_model_mem_gb, 2),
            trainable_lora_params=total_trainable,
            trainable_lora_memory_mb=round(trainable_mem_mb, 2),
            trainable_percentage=round(trainable_pct, 4),
            optimizer_memory_adamw_mb=round(optimizer_mem_mb, 2),
            activation_memory_gb=round(act_mem_gb, 2),
            total_training_memory_gb=round(total_training_gb, 2),
            full_finetune_memory_gb=round(full_finetune_gb, 2),
            memory_savings_ratio=round(savings, 1)
        )

    @staticmethod
    def calculate_kv_cache(req: KVCacheRequest) -> KVCacheResponse:
        # KV Cache memory formula:
        # 2 (for K and V) * num_layers * num_kv_heads * head_dim * precision_bytes * seq_len * batch_size
        bytes_per_token = int(2 * req.num_layers * req.num_kv_heads * req.head_dim * req.precision_bytes)
        mem_per_seq_bytes = bytes_per_token * req.seq_len
        mem_per_seq_mb = mem_per_seq_bytes / (1024**2)
        total_gb = (mem_per_seq_bytes * req.batch_size) / (1024**3)
        
        # Max concurrent sequences that fit into 24GB (e.g. RTX 4090) and 80GB (A100/H100)
        # assuming 14GB / 40GB dedicated to KV cache after model weights
        max_24gb = int((14 * (1024**3)) / max(mem_per_seq_bytes, 1))
        max_80gb = int((50 * (1024**3)) / max(mem_per_seq_bytes, 1))
        
        gqa_ratio = req.num_heads / max(req.num_kv_heads, 1)
        
        return KVCacheResponse(
            bytes_per_token=bytes_per_token,
            memory_per_sequence_mb=round(mem_per_seq_mb, 2),
            total_kv_memory_gb=round(total_gb, 3),
            max_concurrent_sequences_in_24gb=max_24gb,
            max_concurrent_sequences_in_80gb=max_80gb,
            gqa_compression_ratio=round(gqa_ratio, 1)
        )

    @staticmethod
    def simulate_quantization(req: QuantizationSimRequest) -> QuantizationSimResponse:
        arr = np.array(req.weights, dtype=np.float32)
        min_val = float(np.min(arr))
        max_val = float(np.max(arr))
        
        bits = req.target_bits
        q_max = (2 ** (bits - 1)) - 1
        q_min = -(2 ** (bits - 1))
        
        if req.symmetric:
            abs_max = max(abs(min_val), abs(max_val), 1e-6)
            scale = abs_max / q_max
            zero_point = 0
            quantized = np.clip(np.round(arr / scale), q_min, q_max).astype(int)
            dequantized = quantized.astype(np.float32) * scale
        else:
            scale = (max_val - min_val) / (2**bits - 1) if (max_val - min_val) > 1e-6 else 1.0
            zero_point = int(np.round(-min_val / scale))
            quantized = np.clip(np.round(arr / scale) + zero_point, 0, (2**bits) - 1).astype(int)
            dequantized = (quantized.astype(np.float32) - zero_point) * scale
            
        mse = float(np.mean((arr - dequantized) ** 2))
        signal_pwr = float(np.mean(arr ** 2))
        snr_db = 10.0 * math.log10(signal_pwr / max(mse, 1e-10)) if signal_pwr > 1e-10 else 0.0
        
        return QuantizationSimResponse(
            original_min=round(min_val, 4),
            original_max=round(max_val, 4),
            scale=round(float(scale), 6),
            zero_point=zero_point,
            quantized_values=quantized.tolist(),
            dequantized_values=[round(float(x), 4) for x in dequantized.tolist()],
            mean_squared_error=round(mse, 6),
            signal_to_quantization_noise_ratio_db=round(snr_db, 2)
        )

    @staticmethod
    def check_numerical_gradients(req: GradCheckRequest) -> GradCheckResponse:
        """Compares analytical gradients against two-sided finite difference numerical gradients."""
        eps = req.epsilon
        x_vals = req.input_values
        
        # We execute the function code which must define `f(x)` and `df(x)`
        local_scope: Dict[str, Any] = {'np': np, 'math': math}
        try:
            exec(req.function_code, {'__builtins__': __builtins__}, local_scope)
            if 'f' not in local_scope or 'df' not in local_scope:
                return GradCheckResponse(
                    success=False,
                    details="Code must define both f(x) and analytical derivative df(x)"
                )
            f = local_scope['f']
            df = local_scope['df']
            
            analytical = []
            numerical = []
            rel_errors = []
            
            for x in x_vals:
                # Two-sided numerical gradient: (f(x + eps) - f(x - eps)) / (2 * eps)
                num_g = (f(x + eps) - f(x - eps)) / (2.0 * eps)
                ana_g = df(x)
                
                denom = max(abs(ana_g), abs(num_g), 1e-6)
                rel_err = abs(ana_g - num_g) / denom
                
                analytical.append(round(float(ana_g), 6))
                numerical.append(round(float(num_g), 6))
                rel_errors.append(float(rel_err))
                
            max_err = max(rel_errors)
            passed = max_err < req.tolerance
            
            return GradCheckResponse(
                success=True,
                analytical_grads=analytical,
                numerical_grads=numerical,
                max_relative_error=round(max_err, 8),
                passed=passed,
                details=f"Gradient check {'PASSED' if passed else 'FAILED'}. Max relative error: {max_err:.2e} (tolerance: {req.tolerance:.2e})"
            )
        except Exception as e:
            return GradCheckResponse(
                success=False,
                details=f"Error evaluating gradient function: {str(e)}"
            )

lab_service = LabService()
