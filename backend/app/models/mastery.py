from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class MasteryGateSubmission(BaseModel):
    lesson_id: str
    derivation_completed: bool = False
    implementation_passed: bool = False
    failure_case_explained: bool = False
    transfer_passed: bool = False
    score: float = 0.0
    notes: Optional[str] = None

class AssessmentAnswer(BaseModel):
    lesson_id: str
    assessment_index: int
    learner_response: str

class MasteryGateStatus(BaseModel):
    lesson_id: str
    unlocked: bool
    mastered: bool
    score: float
    completed_requirements: List[str]

class CompetencyScores(BaseModel):
    conceptual: float = 0.0
    mathematical: float = 0.0
    implementation: float = 0.0
    experimental: float = 0.0
    systems: float = 0.0

class OverallProgress(BaseModel):
    total_lessons: int
    unlocked_lessons: int
    completed_lessons: int
    mastered_lessons: int
    completion_percentage: float
    competency_scores: CompetencyScores
    weak_concepts: List[str] = []
    recommended_revisions: List[str] = []
    completed_capstones: List[str] = []
