import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getModule,
  getModuleLessons,
  courseData,
  capstonesMap
} from '@/lib/curriculum';
import {
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Award,
  ChevronLeft
} from 'lucide-react';
import ModuleClientView from './ModuleClientView';

interface ModulePageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export async function generateStaticParams() {
  return courseData.modules.map((m) => ({
    moduleId: m.id
  }));
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const currentModule = getModule(moduleId);

  if (!currentModule) {
    notFound();
  }

  const lessons = getModuleLessons(moduleId);
  const capstone = currentModule.capstone ? capstonesMap.get(currentModule.capstone) : undefined;

  return (
    <ModuleClientView
      module={currentModule}
      lessons={lessons}
      capstone={capstone}
    />
  );
}
