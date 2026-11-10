from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class AttentionComputeRequest(BaseModel):
    query_vectors: List[List[float]]
    key_vectors: List[List[float]]
    value_vectors: List[List[float]]
    causal_mask: bool = True
    temperature: float = 1.0

class AttentionComputeResponse(BaseModel):
    raw_scores: List[List[float]]
    scaled_scores: List[List[float]]
    attention_weights: List[List[float]]
    output_context: List[List[float]]
    entropy_per_token: List[float]

class LoRAMemoryRequest(BaseModel):
    base_hidden_size: int = 4096
    num_layers: int = 32
    lora_rank: int = 16
    lora_alpha: float = 32.0
    apply_to_qkv: bool = True
    apply_to_ffn: bool = True
    batch_size: int = 4
    sequence_length: int = 2048
    precision: str = "bf16" # "fp32", "fp16", "bf16", "int8", "int4"

class LoRAMemoryResponse(BaseModel):
    base_model_params: int
    base_model_memory_gb: float
    trainable_lora_params: int
    trainable_lora_memory_mb: float
    trainable_percentage: float
    optimizer_memory_adamw_mb: float
    activation_memory_gb: float
    total_training_memory_gb: float
    full_finetune_memory_gb: float
    memory_savings_ratio: float

class KVCacheRequest(BaseModel):
    num_layers: int = 32
    num_heads: int = 32
    num_kv_heads: int = 8 # GQA: 8, MHA: 32, MQA: 1
    head_dim: int = 128
    batch_size: int = 1
    seq_len: int = 4096
    precision_bytes: int = 2 # 2 for FP16/BF16, 1 for INT8, 0.5 for INT4

class KVCacheResponse(BaseModel):
    bytes_per_token: int
    memory_per_sequence_mb: float
    total_kv_memory_gb: float
    max_concurrent_sequences_in_24gb: int
    max_concurrent_sequences_in_80gb: int
    gqa_compression_ratio: float

class QuantizationSimRequest(BaseModel):
    weights: List[float]
    target_bits: int = 4 # 8 or 4
    symmetric: bool = True

class QuantizationSimResponse(BaseModel):
    original_min: float
    original_max: float
    scale: float
    zero_point: int
    quantized_values: List[int]
    dequantized_values: List[float]
    mean_squared_error: float
    signal_to_quantization_noise_ratio_db: float
