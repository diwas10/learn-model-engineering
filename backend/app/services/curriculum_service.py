import json
import os
from typing import Dict, List, Optional, Any, Set
from collections import defaultdict
from app.core.config import settings
from app.models.curriculum import CourseData, Module, Lesson, Resource, CapstoneProject, CrossCuttingLab

class CurriculumService:
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path or settings.DATA_PATH
        self.raw_data: Dict[str, Any] = {}
        self.course_data: Optional[CourseData] = None
        self.modules_by_id: Dict[str, Module] = {}
        self.lessons_by_id: Dict[str, Lesson] = {}
        self.resources_by_id: Dict[str, Resource] = {}
        self.capstones_by_id: Dict[str, CapstoneProject] = {}
        self.labs_by_id: Dict[str, CrossCuttingLab] = {}
        self.lesson_dependents: Dict[str, List[str]] = defaultdict(list)
        self.module_dependents: Dict[str, List[str]] = defaultdict(list)
        self.load()

    def load(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Course data file not found at {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            self.raw_data = json.load(f)

        self.course_data = CourseData(**self.raw_data)
        
        self.modules_by_id = {m.id: m for m in self.course_data.modules}
        self.lessons_by_id = {l.id: l for l in self.course_data.lessons}
        self.resources_by_id = {r.id: r for r in self.course_data.resources}
        self.capstones_by_id = {c.id: c for c in self.course_data.capstone_projects}
        self.labs_by_id = {lab.id: lab for lab in self.course_data.cross_cutting_labs}

        # Build reverse dependency maps (dependents)
        for lid, l in self.lessons_by_id.items():
            for prereq in l.prerequisite_lessons:
                self.lesson_dependents[prereq].append(lid)

        for mid, m in self.modules_by_id.items():
            for prereq_m in m.prerequisite_modules:
                self.module_dependents[prereq_m].append(mid)

    def get_course_summary(self) -> Dict[str, Any]:
        return {
            "course_id": self.course_data.course_id,
            "title": self.course_data.title,
            "language": self.course_data.language,
            "total_modules": len(self.modules_by_id),
            "total_lessons": len(self.lessons_by_id),
            "total_resources": len(self.resources_by_id),
            "total_capstones": len(self.capstones_by_id),
            "total_cross_cutting_labs": len(self.labs_by_id),
            "learning_paths": self.course_data.learning_paths.model_dump(),
            "quality_bar": self.course_data.quality_bar,
            "metadata": self.course_data.metadata
        }

    def get_all_modules(self) -> List[Module]:
        return sorted(self.course_data.modules, key=lambda m: m.sequence)

    def get_module(self, module_id: str) -> Optional[Module]:
        return self.modules_by_id.get(module_id)

    def get_module_lessons(self, module_id: str) -> List[Lesson]:
        m = self.get_module(module_id)
        if not m:
            return []
        return [self.lessons_by_id[lid] for lid in m.lesson_ids if lid in self.lessons_by_id]

    def get_lesson(self, lesson_id: str) -> Optional[Lesson]:
        return self.lessons_by_id.get(lesson_id)

    def get_lesson_resources(self, lesson_id: str) -> List[Resource]:
        lesson = self.get_lesson(lesson_id)
        if not lesson:
            return []
        return [self.resources_by_id[rid] for rid in lesson.resource_ids if rid in self.resources_by_id]

    def get_unlocked_lessons(self, completed_lesson_ids: Set[str]) -> List[str]:
        """A lesson is unlocked if all its prerequisites are completed, or it has no prerequisites."""
        unlocked = []
        for lid, l in self.lessons_by_id.items():
            if not l.prerequisite_lessons:
                unlocked.append(lid)
            elif all(prereq in completed_lesson_ids for prereq in l.prerequisite_lessons):
                unlocked.append(lid)
        return unlocked

    def search_lessons(self, query: str) -> List[Dict[str, Any]]:
        query = query.lower()
        results = []
        for l in self.lessons_by_id.values():
            score = 0
            if query in l.title.lower():
                score += 10
            if any(query in obj.lower() for obj in l.learning_objectives):
                score += 5
            if any(query in mc.lower() for mc in l.math_connections):
                score += 4
            if query in l.id.lower():
                score += 8
            if score > 0:
                results.append({
                    "lesson_id": l.id,
                    "title": l.title,
                    "module_id": l.module_id,
                    "module_title": self.modules_by_id[l.module_id].title if l.module_id in self.modules_by_id else "",
                    "score": score
                })
        return sorted(results, key=lambda x: -x["score"])

curriculum_service = CurriculumService()
