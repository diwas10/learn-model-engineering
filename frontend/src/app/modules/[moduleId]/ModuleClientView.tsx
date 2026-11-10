'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';
import { Module, Lesson, CapstoneProject } from '@/types/curriculum';
import { useMastery } from '@/lib/masteryStore';

interface ModuleClientViewProps {
  module: Module;
  lessons: Lesson[];
  capstone?: CapstoneProject;
}

export default function ModuleClientView({
  module,
  lessons,
  capstone
}: ModuleClientViewProps) {
  const { completedLessonIds, isUnlocked } = useMastery();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-xs">
          <Link href="/modules" className="text-slate-400 hover:text-white flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <span>All Modules</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-cyan-400 font-semibold">{module.id}</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  Module {module.sequence}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                  {module.level}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white capitalize">
                {module.title}
              </h1>
            </div>

            {capstone && (
              <Link
                href="/capstones"
                className="flex items-center space-x-2 rounded-xl border border-indigo-700/60 bg-indigo-950/40 p-3 hover:border-indigo-500 transition-colors"
              >
                <Award className="h-5 w-5 text-indigo-400" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-indigo-300">Capstone Project</div>
                  <div className="text-xs font-bold text-white">{capstone.title}</div>
                </div>
              </Link>
            )}
          </div>

          {module.prerequisite_modules.length > 0 && (
            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Prerequisite Modules:</span>
              <div className="flex gap-2">
                {module.prerequisite_modules.map((pm) => (
                  <Link
                    key={pm}
                    href={`/modules/${pm}`}
                    className="font-mono text-cyan-400 hover:underline bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                  >
                    {pm}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <h2 className="text-lg font-bold text-white mb-4">
          Module Lessons ({lessons.length})
        </h2>

        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const unlocked = isUnlocked(lesson.id);
            const mastered = completedLessonIds.has(lesson.id);

            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className={`block rounded-2xl border p-5 transition-all group ${
                  mastered
                    ? 'border-emerald-800/40 bg-emerald-950/10 hover:border-emerald-700'
                    : unlocked
                    ? 'border-slate-800 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-900'
                    : 'border-slate-800/60 bg-slate-950/40 opacity-70 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-slate-400 group-hover:text-cyan-400">
                      {lesson.order}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-cyan-400 font-semibold">
                          {lesson.id}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500">
                          {lesson.estimated_difficulty}
                        </span>
                        {mastered && (
                          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Mastered
                          </span>
                        )}
                        {!unlocked && (
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 text-base font-bold text-white capitalize group-hover:text-cyan-300 transition-colors">
                        {lesson.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                        {lesson.learning_objectives[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-500 group-hover:text-cyan-400">
                    <span className="text-xs font-semibold hidden sm:inline">Explore</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
