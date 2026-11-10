from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class TutorQuery(BaseModel):
    lesson_id: str
    learner_query: str
    current_code: Optional[str] = None
    identified_misconceptions: List[str] = []
    depth_level: str = "deep" # "intuitive", "mathematical", "deep", "debugging"

class TutorHint(BaseModel):
    step: int
    hint_text: str
    is_solution: bool = False

class TutorResponse(BaseModel):
    lesson_id: str
    explanation: str
    mathematical_derivation: Optional[str] = None
    numerical_example: Optional[str] = None
    progressive_hints: List[TutorHint] = []
    suggested_visualizations: List[str] = []
    architectural_comparison: Optional[str] = None
    code_review: Optional[str] = None
