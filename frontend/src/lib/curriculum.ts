import courseDataJson from '@/data/courseData.json';
import { CourseData, Module, Lesson, Resource, CapstoneProject, CrossCuttingLab } from '@/types/curriculum';

export const courseData: CourseData = courseDataJson as unknown as CourseData;

export const modulesMap = new Map<string, Module>(
  courseData.modules.map((m) => [m.id, m])
);

export const lessonsMap = new Map<string, Lesson>(
  courseData.lessons.map((l) => [l.id, l])
);

export const resourcesMap = new Map<string, Resource>(
  courseData.resources.map((r) => [r.id, r])
);

export const capstonesMap = new Map<string, CapstoneProject>(
  courseData.capstone_projects.map((c) => [c.id, c])
);

export const labsMap = new Map<string, CrossCuttingLab>(
  courseData.cross_cutting_labs.map((lab) => [lab.id, lab])
);

// Map lessons to their dependent lessons (lessons that require this lesson as a prerequisite)
export const lessonDependentsMap = new Map<string, string[]>();
courseData.lessons.forEach((l) => {
  l.prerequisite_lessons.forEach((prereq) => {
    const arr = lessonDependentsMap.get(prereq) || [];
    arr.push(l.id);
    lessonDependentsMap.set(prereq, arr);
  });
});

export function getModule(moduleId: string): Module | undefined {
  return modulesMap.get(moduleId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return lessonsMap.get(lessonId);
}

export function getModuleLessons(moduleId: string): Lesson[] {
  const mod = modulesMap.get(moduleId);
  if (!mod) return [];
  return mod.lesson_ids
    .map((lid) => lessonsMap.get(lid))
    .filter((l): l is Lesson => Boolean(l));
}

export function getLessonResources(resourceIds: string[]): Resource[] {
  return resourceIds
    .map((id) => resourcesMap.get(id))
    .filter((r): r is Resource => Boolean(r));
}

export function isLessonUnlocked(lessonId: string, completedLessonIds: Set<string>): boolean {
  const lesson = lessonsMap.get(lessonId);
  if (!lesson) return false;
  if (lesson.prerequisite_lessons.length === 0) return true;
  return lesson.prerequisite_lessons.every((prereq) => completedLessonIds.has(prereq));
}

export function getAdjacentLessons(lessonId: string): { prevLesson?: Lesson; nextLesson?: Lesson } {
  const lesson = lessonsMap.get(lessonId);
  if (!lesson) return {};
  const modLessons = getModuleLessons(lesson.module_id);
  const idx = modLessons.findIndex((l) => l.id === lessonId);
  return {
    prevLesson: idx > 0 ? modLessons[idx - 1] : undefined,
    nextLesson: idx < modLessons.length - 1 ? modLessons[idx + 1] : undefined
  };
}

export function searchCurriculum(query: string): { lesson: Lesson; module: Module; score: number }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: { lesson: Lesson; module: Module; score: number }[] = [];

  courseData.lessons.forEach((lesson) => {
    let score = 0;
    if (lesson.title.toLowerCase().includes(q)) score += 10;
    if (lesson.id.toLowerCase().includes(q)) score += 8;
    if (lesson.learning_objectives.some((obj) => obj.toLowerCase().includes(q))) score += 5;
    if (lesson.math_connections.some((mc) => mc.toLowerCase().includes(q))) score += 4;

    if (score > 0) {
      const mod = modulesMap.get(lesson.module_id);
      if (mod) {
        results.push({ lesson, module: mod, score });
      }
    }
  });

  return results.sort((a, b) => b.score - a.score);
}
