from fastapi import APIRouter
from app.models.lab_models import (
    AttentionComputeRequest, AttentionComputeResponse,
    LoRAMemoryRequest, LoRAMemoryResponse,
    KVCacheRequest, KVCacheResponse,
    QuantizationSimRequest, QuantizationSimResponse
)
from app.services.lab_service import lab_service

router = APIRouter(prefix="/labs", tags=["Labs"])

@router.post("/attention/compute", response_model=AttentionComputeResponse)
def compute_attention(req: AttentionComputeRequest):
    return lab_service.compute_attention(req)

@router.post("/lora/memory", response_model=LoRAMemoryResponse)
def calculate_lora_memory(req: LoRAMemoryRequest):
    return lab_service.calculate_lora_memory(req)

@router.post("/kv-cache/memory", response_model=KVCacheResponse)
def calculate_kv_cache(req: KVCacheRequest):
    return lab_service.calculate_kv_cache(req)

@router.post("/quantization/simulate", response_model=QuantizationSimResponse)
def simulate_quantization(req: QuantizationSimRequest):
    return lab_service.simulate_quantization(req)
