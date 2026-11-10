import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getLesson,
  getModule,
  getAdjacentLessons,
  getLessonResources,
  courseData
} from '@/lib/curriculum';
import { getLessonEnrichment } from '@/data/lessonEnrichment';
import LessonClientView from './LessonClientView';

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

// Generate static params for all 253 lessons
export async function generateStaticParams() {
  return courseData.lessons.map((lesson) => ({
    lessonId: lesson.id
  }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  const currentModule = getModule(lesson.module_id);
  const { prevLesson, nextLesson } = getAdjacentLessons(lessonId);
  const resources = getLessonResources(lesson.resource_ids);
  const enrichment = getLessonEnrichment(lesson.id, lesson.title);

  return (
    <LessonClientView
      lesson={lesson}
      module={currentModule}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
      resources={resources}
      enrichment={enrichment}
    />
  );
}
