import pytest
from app.services.curriculum_service import curriculum_service
from app.core.sandbox import execute_sandboxed_code
from app.services.lab_service import lab_service
from app.models.lab_models import (
    AttentionComputeRequest,
    LoRAMemoryRequest,
    KVCacheRequest,
    QuantizationSimRequest
)
from app.models.execution import GradCheckRequest

def test_curriculum_loaded():
    assert len(curriculum_service.modules_by_id) == 28
    assert len(curriculum_service.lessons_by_id) == 253
    assert len(curriculum_service.capstones_by_id) == 6
    assert len(curriculum_service.labs_by_id) == 6

    # Test sample lessons
    l1 = curriculum_service.get_lesson("math_linear.L01")
    assert l1 is not None
    assert l1.title == "vectors and geometry"
    assert len(l1.visualizations) == 2

    l_attn = curriculum_service.get_lesson("transformer_core.L03")
    assert l_attn is not None
    assert "scaled dot product" in l_attn.title

def test_unlocked_lessons():
    unlocked_start = curriculum_service.get_unlocked_lessons(set())
    # Should contain root lessons with no prerequisites
    assert "math_linear.L01" in unlocked_start
    assert len(unlocked_start) > 0

def test_code_sandbox_execution():
    code = """
import numpy as np
import torch

a = 10
b = 20
c = a + b
x = torch.tensor([1.0, 2.0, 3.0])
norm = float(torch.norm(x))
print(f"c={c}, norm={norm:.2f}")
"""
    assertions = [
        "assert c == 30",
        "assert norm > 3.7"
    ]
    res = execute_sandboxed_code(code, assertions, timeout_seconds=4.0)
    assert res["success"] is True
    assert "c=30" in res["stdout"]
    assert res["all_tests_passed"] is True
    assert len(res["test_results"]) == 2

def test_code_sandbox_timeout():
    code = """
import time
while True:
    pass
"""
    res = execute_sandboxed_code(code, timeout_seconds=1.0)
    assert res["success"] is False
    assert "timed out" in res["stderr"]

def test_attention_computation():
    req = AttentionComputeRequest(
        query_vectors=[[1.0, 0.0], [0.0, 1.0]],
        key_vectors=[[1.0, 0.0], [0.0, 1.0]],
        value_vectors=[[10.0, 20.0], [30.0, 40.0]],
        causal_mask=False,
        temperature=1.0
    )
    res = lab_service.compute_attention(req)
    assert len(res.attention_weights) == 2
    assert len(res.output_context) == 2
    # Verify probability distribution (rows sum to 1)
    for row in res.attention_weights:
        assert abs(sum(row) - 1.0) < 1e-4

def test_lora_memory_calculation():
    req = LoRAMemoryRequest(
        base_hidden_size=4096,
        num_layers=32,
        lora_rank=16,
        apply_to_qkv=True,
        apply_to_ffn=True
    )
    res = lab_service.calculate_lora_memory(req)
    assert res.base_model_params > 1_000_000_000 # >1B params
    assert res.trainable_lora_params > 0
    assert res.trainable_percentage < 1.0 # LoRA is < 1% of base model
    assert res.memory_savings_ratio > 1.5

def test_kv_cache_calculation():
    req = KVCacheRequest(
        num_layers=32,
        num_heads=32,
        num_kv_heads=8, # GQA
        head_dim=128,
        batch_size=4,
        seq_len=4096,
        precision_bytes=2
    )
    res = lab_service.calculate_kv_cache(req)
    assert res.bytes_per_token > 0
    assert res.total_kv_memory_gb > 0
    assert res.gqa_compression_ratio == 4.0

def test_quantization_simulation():
    req = QuantizationSimRequest(
        weights=[-2.5, -1.0, 0.0, 1.2, 2.5],
        target_bits=4,
        symmetric=True
    )
    res = lab_service.simulate_quantization(req)
    assert len(res.quantized_values) == 5
    assert len(res.dequantized_values) == 5
    assert res.mean_squared_error >= 0.0

def test_numerical_gradients():
    # f(x) = x^3 - 2x + 1, df(x) = 3x^2 - 2
    code = """
def f(x):
    return x**3 - 2.0*x + 1.0

def df(x):
    return 3.0*(x**2) - 2.0
"""
    req = GradCheckRequest(
        function_code=code,
        input_values=[-2.0, -0.5, 0.0, 1.0, 3.0],
        epsilon=1e-5,
        tolerance=1e-3
    )
    res = lab_service.check_numerical_gradients(req)
    assert res.success is True
    assert res.passed is True
