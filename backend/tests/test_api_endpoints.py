import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    res_h = client.get("/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"

def test_curriculum_api():
    # Summary
    res = client.get("/api/curriculum/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_modules"] == 28
    assert data["total_lessons"] == 253

    # Modules
    res_m = client.get("/api/curriculum/modules")
    assert res_m.status_code == 200
    assert len(res_m.json()) == 28

    # Specific lesson
    res_l = client.get("/api/curriculum/lessons/transformer_core.L03")
    assert res_l.status_code == 200
    l_data = res_l.json()
    assert l_data["lesson"]["id"] == "transformer_core.L03"
    assert "scaled dot product" in l_data["lesson"]["title"]

def test_execution_api():
    req = {
        "code": "a = 42\nb = 8\nc = a + b",
        "test_cases": [
            {"name": "Check sum", "assertion_code": "assert c == 50"}
        ]
    }
    res = client.post("/api/execution/run", json=req)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["success"] is True
    assert res_data["all_tests_passed"] is True
    assert res_data["test_results"][0]["passed"] is True

def test_attention_lab_api():
    req = {
        "query_vectors": [[1.0, 0.0], [0.0, 1.0]],
        "key_vectors": [[1.0, 0.0], [0.0, 1.0]],
        "value_vectors": [[10.0, 20.0], [30.0, 40.0]],
        "causal_mask": True,
        "temperature": 1.0
    }
    res = client.post("/api/labs/attention/compute", json=req)
    assert res.status_code == 200
    data = res.json()
    assert len(data["attention_weights"]) == 2
    # In causal mask, first token can only attend to first token -> weight == 1.0
    assert abs(data["attention_weights"][0][0] - 1.0) < 1e-4

def test_lora_lab_api():
    req = {
        "base_hidden_size": 4096,
        "num_layers": 32,
        "lora_rank": 16,
        "apply_to_qkv": True,
        "apply_to_ffn": True
    }
    res = client.post("/api/labs/lora/memory", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["trainable_percentage"] < 1.0
    assert data["memory_savings_ratio"] > 1.5

def test_kv_cache_lab_api():
    req = {
        "num_layers": 32,
        "num_heads": 32,
        "num_kv_heads": 8,
        "head_dim": 128,
        "batch_size": 4,
        "seq_len": 4096,
        "precision_bytes": 2
    }
    res = client.post("/api/labs/kv-cache/memory", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["total_kv_memory_gb"] > 0
    assert data["gqa_compression_ratio"] == 4.0

def test_mastery_gate_submission_api():
    sub = {
        "lesson_id": "math_linear.L01",
        "derivation_completed": True,
        "implementation_passed": True,
        "failure_case_explained": True,
        "transfer_passed": True
    }
    res = client.post("/api/mastery/submit-gate", json=sub)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["passed_mastery_gate"] is True
