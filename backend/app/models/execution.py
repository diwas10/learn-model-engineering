from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class TestCase(BaseModel):
    name: str
    assertion_code: str
    description: Optional[str] = None

class ExecutionRequest(BaseModel):
    code: str
    test_cases: List[TestCase] = []
    timeout_seconds: Optional[float] = 5.0

class TestCaseResult(BaseModel):
    name: str
    passed: bool
    error_message: Optional[str] = None
    duration_ms: float = 0.0

class ExecutionResponse(BaseModel):
    success: bool
    stdout: str = ""
    stderr: str = ""
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    test_results: List[TestCaseResult] = []
    all_tests_passed: bool = True
    variables: Dict[str, str] = {}

class ShapeCheckRequest(BaseModel):
    expression_or_code: str
    input_shapes: Dict[str, List[int]]

class ShapeCheckResponse(BaseModel):
    success: bool
    shapes: Dict[str, List[int]] = {}
    error: Optional[str] = None

class GradCheckRequest(BaseModel):
    function_code: str
    input_values: List[float]
    epsilon: float = 1e-5
    tolerance: float = 1e-4

class GradCheckResponse(BaseModel):
    success: bool
    analytical_grads: List[float] = []
    numerical_grads: List[float] = []
    max_relative_error: float = 0.0
    passed: bool = False
    details: str = ""
