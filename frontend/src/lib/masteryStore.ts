'use client';

import { useState, useEffect } from 'react';
import { courseData, lessonsMap } from './curriculum';
import { LessonMasteryStatus } from '@/types/curriculum';

const STORAGE_KEY = 'ai_mastery_learning_progress_v1';

export interface CompetencyRadar {
  conceptual: number;
  mathematical: number;
  implementation: number;
  experimental: number;
  systems: number;
}

export interface MasteryState {
  completedGates: Record<string, LessonMasteryStatus>;
  notes: Record<string, string>;
  savedCode: Record<string, string>;
  completedCapstones: string[];
}

const defaultState: MasteryState = {
  completedGates: {},
  notes: {},
  savedCode: {},
  completedCapstones: []
};

export function loadMasteryState(): MasteryState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as MasteryState;
  } catch (e) {
    console.error('Failed to parse saved mastery state', e);
    return defaultState;
  }
}

export function saveMasteryState(state: MasteryState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('mastery_state_changed'));
  } catch (e) {
    console.error('Failed to save mastery state', e);
  }
}

export function useMastery() {
  const [state, setState] = useState<MasteryState>(loadMasteryState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onUpdate = () => {
      setState(loadMasteryState());
    };
    window.addEventListener('mastery_state_changed', onUpdate);
    return () => window.removeEventListener('mastery_state_changed', onUpdate);
  }, []);

  const completedLessonIds = new Set(
    Object.keys(state.completedGates).filter((id) => state.completedGates[id]?.mastered)
  );

  const isUnlocked = (lessonId: string): boolean => {
    const lesson = lessonsMap.get(lessonId);
    if (!lesson) return false;
    if (lesson.prerequisite_lessons.length === 0) return true;
    return lesson.prerequisite_lessons.every((prereq) => completedLessonIds.has(prereq));
  };

  const updateGate = (
    lessonId: string,
    update: Partial<Omit<LessonMasteryStatus, 'lessonId'>>
  ) => {
    const current = state.completedGates[lessonId] || {
      lessonId,
      derivationCompleted: false,
      implementationPassed: false,
      failureCaseExplained: false,
      transferPassed: false,
      score: 0,
      unlocked: isUnlocked(lessonId),
      mastered: false
    };

    const next: LessonMasteryStatus = {
      ...current,
      ...update,
      lessonId
    };

    // Calculate score & mastery based on required gates
    const lesson = lessonsMap.get(lessonId);
    if (lesson) {
      const reqs = lesson.mastery_gate.required;
      let matched = 0;
      if (next.derivationCompleted && reqs.includes('derive_or_trace')) matched++;
      if (next.implementationPassed && reqs.includes('implement_or_reproduce')) matched++;
      if (next.failureCaseExplained && reqs.includes('explain_failure_case')) matched++;
      if (next.transferPassed && reqs.includes('pass_unseen_transfer_question')) matched++;

      const fraction = matched / Math.max(reqs.length, 1);
      next.score = Math.round(fraction * 100);
      next.mastered = fraction >= lesson.mastery_gate.minimum_score_fraction;
    }

    const nextState = {
      ...state,
      completedGates: {
        ...state.completedGates,
        [lessonId]: next
      }
    };
    setState(nextState);
    saveMasteryState(nextState);
  };

  const saveCode = (lessonId: string, code: string) => {
    const nextState = {
      ...state,
      savedCode: { ...state.savedCode, [lessonId]: code }
    };
    setState(nextState);
    saveMasteryState(nextState);
  };

  const saveNote = (lessonId: string, note: string) => {
    const nextState = {
      ...state,
      notes: { ...state.notes, [lessonId]: note }
    };
    setState(nextState);
    saveMasteryState(nextState);
  };

  // Compute competencies
  const totalLessons = courseData.lessons.length;
  const masteredCount = completedLessonIds.size;
  
  let mathScore = 0;
  let nnScore = 0;
  let transformerScore = 0;
  let adaptationScore = 0;
  let systemsScore = 0;

  completedLessonIds.forEach((id) => {
    if (id.startsWith('math_')) mathScore += 1;
    if (id.startsWith('nn_')) nnScore += 1;
    if (id.startsWith('transformer_')) transformerScore += 1;
    if (id.startsWith('adaptation_')) adaptationScore += 1;
    if (
      id.startsWith('inference_') ||
      id.startsWith('gpu_') ||
      id.startsWith('data_') ||
      id.startsWith('agents') ||
      id.startsWith('architecture')
    ) {
      systemsScore += 1;
    }
  });

  const competencies: CompetencyRadar = {
    conceptual: Math.min(100, Math.round(((mathScore + nnScore + transformerScore) / 40) * 100)),
    mathematical: Math.min(100, Math.round((mathScore / 32) * 100)),
    implementation: Math.min(100, Math.round(((nnScore + transformerScore) / 34) * 100)),
    experimental: Math.min(100, Math.round((adaptationScore / 30) * 100)),
    systems: Math.min(100, Math.round((systemsScore / 48) * 100))
  };

  return {
    mounted,
    state,
    completedLessonIds,
    isUnlocked,
    updateGate,
    saveCode,
    saveNote,
    totalLessons,
    masteredCount,
    completionPercentage: Math.round((masteredCount / Math.max(totalLessons, 1)) * 100),
    competencies
  };
}
