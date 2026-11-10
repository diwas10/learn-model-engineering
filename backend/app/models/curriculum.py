from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field

class VisualizationSpec(BaseModel):
    id: str
    format: str
    concept: str
    storyboard: Optional[List[str]] = None
    controls: Optional[List[str]] = None
    implementation_hint: Optional[str] = None
    acceptance: Optional[List[str]] = None
    rendering: Optional[str] = None
    duration_policy: Optional[str] = None

class Exercise(BaseModel):
    type: str
    prompt: str
    deliverables: List[str] = []

class Assessment(BaseModel):
    type: str
    rubric: str

class MasteryGate(BaseModel):
    required: List[str]
    minimum_score_fraction: float

class Lesson(BaseModel):
    id: str
    module_id: str
    order: int
    title: str
    prerequisite_lessons: List[str] = []
    learning_objectives: List[str] = []
    math_connections: List[str] = []
    visualizations: List[VisualizationSpec] = []
    exercises: List[Exercise] = []
    assessments: List[Assessment] = []
    mastery_gate: MasteryGate
    estimated_difficulty: str
    resource_ids: List[str] = []
    source_policy: Optional[str] = None

class Module(BaseModel):
    id: str
    title: str
    level: str
    sequence: int
    prerequisite_modules: List[str] = []
    lesson_ids: List[str] = []
    capstone: Optional[str] = None
    mastery_evidence: Optional[Union[List[str], str]] = None

class Resource(BaseModel):
    id: str
    title: str
    type: str
    url: str
    relevant_modules: List[str] = []
    link_status: Optional[str] = None
    usage: Optional[str] = None

class CapstoneProject(BaseModel):
    id: str
    title: str
    related_modules: List[str] = []
    required_deliverables: List[str] = []
    acceptance_criteria: List[str] = []
    hardware_policy: Optional[str] = None

class CrossCuttingLab(BaseModel):
    id: str
    name: str
    requirements: List[str] = []

class LearningPaths(BaseModel):
    recommended_core: List[str] = []
    parallel_tracks: List[List[str]] = []
    rule: Optional[str] = None

class CourseData(BaseModel):
    schema_version: str
    course_id: str
    title: str
    language: str
    status: str
    learner_profile: Dict[str, Any]
    course_contract: Dict[str, Any]
    agent_build_spec: Dict[str, Any]
    learning_paths: LearningPaths
    modules: List[Module]
    lessons: List[Lesson]
    resources: List[Resource]
    capstone_projects: List[CapstoneProject]
    cross_cutting_labs: List[CrossCuttingLab]
    quality_bar: Dict[str, Any]
    metadata: Dict[str, Any]
