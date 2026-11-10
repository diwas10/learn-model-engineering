from fastapi import APIRouter
from app.models.execution import (
    ExecutionRequest, ExecutionResponse,
    ShapeCheckRequest, ShapeCheckResponse,
    GradCheckRequest, GradCheckResponse
)
from app.core.sandbox import execute_sandboxed_code
from app.services.lab_service import lab_service

router = APIRouter(prefix="/execution", tags=["Execution"])

@router.post("/run", response_model=ExecutionResponse)
def run_code(req: ExecutionRequest):
    test_assertions = [tc.assertion_code for tc in req.test_cases]
    result = execute_sandboxed_code(
        code=req.code,
        test_assertions=test_assertions,
        timeout_seconds=req.timeout_seconds or 5.0
    )
    
    test_case_results = []
    for idx, tc in enumerate(req.test_cases):
        matched = next((r for r in result["test_results"] if r["index"] == idx), None)
        test_case_results.append({
            "name": tc.name,
            "passed": matched["passed"] if matched else False,
            "error_message": matched["error"] if matched else "Not executed",
            "duration_ms": matched["duration_ms"] if matched else 0.0
        })

    return ExecutionResponse(
        success=result["success"],
        stdout=result["stdout"],
        stderr=result["stderr"],
        error=result["error"],
        execution_time_ms=result["execution_time_ms"],
        test_results=test_case_results,
        all_tests_passed=result["all_tests_passed"],
        variables=result["variables"]
    )

@router.post("/check-gradients", response_model=GradCheckResponse)
def check_gradients(req: GradCheckRequest):
    return lab_service.check_numerical_gradients(req)
