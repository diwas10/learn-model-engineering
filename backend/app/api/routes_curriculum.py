from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.curriculum_service import curriculum_service
from app.models.curriculum import Module, Lesson, Resource, CapstoneProject, CrossCuttingLab

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])

@router.get("/summary")
def get_summary():
    return curriculum_service.get_course_summary()

@router.get("/modules", response_model=List[Module])
def list_modules():
    return curriculum_service.get_all_modules()

@router.get("/modules/{module_id}")
def get_module(module_id: str):
    m = curriculum_service.get_module(module_id)
    if not m:
        raise HTTPException(status_code=404, detail="Module not found")
    lessons = curriculum_service.get_module_lessons(module_id)
    return {
        "module": m,
        "lessons": lessons
    }

@router.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: str):
    lesson = curriculum_service.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    resources = curriculum_service.get_lesson_resources(lesson_id)
    module = curriculum_service.get_module(lesson.module_id)
    return {
        "lesson": lesson,
        "module": module,
        "resources": resources,
        "dependents": curriculum_service.lesson_dependents.get(lesson_id, [])
    }

@router.get("/dag")
def get_dag():
    nodes = []
    edges = []
    for lid, l in curriculum_service.lessons_by_id.items():
        nodes.append({
            "id": lid,
            "title": l.title,
            "module_id": l.module_id,
            "difficulty": l.estimated_difficulty,
            "order": l.order
        })
        for prereq in l.prerequisite_lessons:
            edges.append({
                "source": prereq,
                "target": lid
            })
    return {
        "nodes": nodes,
        "edges": edges,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "level": m.level,
                "sequence": m.sequence,
                "lesson_count": len(m.lesson_ids),
                "prerequisites": m.prerequisite_modules
            }
            for m in curriculum_service.get_all_modules()
        ]
    }

@router.get("/search")
def search(q: str = Query(..., min_length=2)):
    return curriculum_service.search_lessons(q)

@router.get("/capstones")
def list_capstones():
    return list(curriculum_service.capstones_by_id.values())

@router.get("/labs")
def list_labs():
    return list(curriculum_service.labs_by_id.values())
