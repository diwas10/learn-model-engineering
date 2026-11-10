from typing import List, Dict, Any
from fastapi import APIRouter
from app.models.mastery import MasteryGateSubmission, OverallProgress, CompetencyScores
from app.services.curriculum_service import curriculum_service

router = APIRouter(prefix="/mastery", tags=["Mastery & Progress"])

# In-memory storage for progress (persisted across sessions via client localStorage sync)
_completed_gates: Dict[str, MasteryGateSubmission] = {}

@router.post("/submit-gate")
def submit_mastery_gate(sub: MasteryGateSubmission):
    lesson = curriculum_service.get_lesson(sub.lesson_id)
    if not lesson:
        return {"success": False, "error": "Lesson not found"}

    reqs = lesson.mastery_gate.required
    completed_count = sum([
        1 if sub.derivation_completed and "derive_or_trace" in reqs else 0,
        1 if sub.implementation_passed and "implement_or_reproduce" in reqs else 0,
        1 if sub.failure_case_explained and "explain_failure_case" in reqs else 0,
        1 if sub.transfer_passed and "pass_unseen_transfer_question" in reqs else 0
    ])

    passed = (completed_count / max(len(reqs), 1)) >= lesson.mastery_gate.minimum_score_fraction
    _completed_gates[sub.lesson_id] = sub
    
    return {
        "success": True,
        "lesson_id": sub.lesson_id,
        "passed_mastery_gate": passed,
        "completed_count": completed_count,
        "total_required": len(reqs),
        "score_fraction": completed_count / max(len(reqs), 1)
    }

@router.get("/progress", response_model=OverallProgress)
def get_progress():
    total_lessons = len(curriculum_service.lessons_by_id)
    completed_ids = set(_completed_gates.keys())
    unlocked = curriculum_service.get_unlocked_lessons(completed_ids)
    
    # Calculate competency scores based on completed modules
    math_done = sum(1 for lid in completed_ids if lid.startswith("math_"))
    nn_done = sum(1 for lid in completed_ids if lid.startswith("nn_"))
    trans_done = sum(1 for lid in completed_ids if lid.startswith("transformer_"))
    adapt_done = sum(1 for lid in completed_ids if lid.startswith("adaptation_"))
    sys_done = sum(1 for lid in completed_ids if any(lid.startswith(p) for p in ["inference_", "gpu_", "data_", "architecture", "agents"]))

    return OverallProgress(
        total_lessons=total_lessons,
        unlocked_lessons=len(unlocked),
        completed_lessons=len(completed_ids),
        mastered_lessons=len(completed_ids),
        completion_percentage=round((len(completed_ids) / max(total_lessons, 1)) * 100.0, 1),
        competency_scores=CompetencyScores(
            conceptual=min(100.0, (math_done + nn_done) * 4.0),
            mathematical=min(100.0, math_done * 3.5),
            implementation=min(100.0, (nn_done + trans_done) * 4.5),
            experimental=min(100.0, (adapt_done) * 5.0),
            systems=min(100.0, sys_done * 3.0)
        ),
        weak_concepts=["gradient flow in deep networks", "KV cache memory bandwidth limits"] if not completed_ids else [],
        recommended_revisions=["math_linear.L02", "nn_autograd.L04", "transformer_core.L03"] if not completed_ids else []
    )
