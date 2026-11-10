from fastapi import APIRouter
from app.models.tutor import TutorQuery, TutorResponse
from app.services.tutor_service import tutor_service

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

@router.post("/query", response_model=TutorResponse)
def ask_tutor(req: TutorQuery):
    return tutor_service.answer_query(req)
