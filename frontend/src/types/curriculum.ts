export interface VisualizationSpec {
  id: string;
  format: 'interactive_2d' | 'interactive_3d' | '3b1b_style_animation' | string;
  concept: string;
  storyboard?: string[];
  controls?: string[];
  implementation_hint?: string;
  acceptance?: string[];
  rendering?: string;
  duration_policy?: string;
}

export interface Exercise {
  type: string;
  prompt: string;
  deliverables: string[];
}

export interface Assessment {
  type: string;
  rubric: string;
}

export interface MasteryGate {
  required: string[];
  minimum_score_fraction: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  order: number;
  title: string;
  prerequisite_lessons: string[];
  learning_objectives: string[];
  math_connections: string[];
  visualizations: VisualizationSpec[];
  exercises: Exercise[];
  assessments: Assessment[];
  mastery_gate: MasteryGate;
  estimated_difficulty: 'foundation' | 'core' | 'advanced' | 'systems' | 'research' | string;
  resource_ids: string[];
  source_policy?: string;
}

export interface Module {
  id: string;
  title: string;
  level: 'foundation' | 'core' | 'advanced' | 'systems' | 'research' | string;
  sequence: number;
  prerequisite_modules: string[];
  lesson_ids: string[];
  capstone?: string;
  mastery_evidence?: string[] | string;
}

export interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  relevant_modules: string[];
  link_status?: string;
  usage?: string;
}

export interface CapstoneProject {
  id: string;
  title: string;
  related_modules: string[];
  required_deliverables: string[];
  acceptance_criteria: string[];
  hardware_policy?: string;
}

export interface CrossCuttingLab {
  id: string;
  name: string;
  requirements: string[];
}

export interface LearningPaths {
  recommended_core: string[];
  parallel_tracks: string[][];
  rule?: string;
}

export interface CourseData {
  schema_version: string;
  course_id: string;
  title: string;
  language: string;
  status: string;
  learner_profile: Record<string, any>;
  course_contract: Record<string, any>;
  agent_build_spec: Record<string, any>;
  learning_paths: LearningPaths;
  modules: Module[];
  lessons: Lesson[];
  resources: Resource[];
  capstone_projects: CapstoneProject[];
  cross_cutting_labs: CrossCuttingLab[];
  quality_bar: Record<string, any>;
  metadata: Record<string, any>;
}

export interface LessonMasteryStatus {
  lessonId: string;
  derivationCompleted: boolean;
  implementationPassed: boolean;
  failureCaseExplained: boolean;
  transferPassed: boolean;
  score: number;
  unlocked: boolean;
  mastered: boolean;
}
