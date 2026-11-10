'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  GitBranch,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { courseData, modulesMap, lessonsMap } from '@/lib/curriculum';
import { useMastery } from '@/lib/masteryStore';

export default function ModulesPage() {
  const { completedLessonIds, isUnlocked } = useMastery();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const levels = [
    { id: 'all', label: 'All Modules' },
    { id: 'foundation', label: 'Foundation' },
    { id: 'core', label: 'Core' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'systems', label: 'Systems' },
    { id: 'research', label: 'Research' }
  ];

  const filteredModules = courseData.modules.filter((m) => {
    const matchesLevel = selectedLevel === 'all' || m.level === selectedLevel;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="h-4 w-4" />
            <span>Complete Curriculum Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Course Modules & Roadmap
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            28 modules, 253 comprehensive lessons spanning mathematical rigor, autograd, Transformer architectures, parameter-efficient adaptation, multimodal engineering, and distributed inference systems.
          </p>

          {/* Filters & Search */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                    selectedLevel === lvl.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filter modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const lessons = mod.lesson_ids
              .map((id) => lessonsMap.get(id))
              .filter(Boolean);
            const masteredCount = lessons.filter((l) => l && completedLessonIds.has(l.id)).length;
            const pct = Math.round((masteredCount / Math.max(lessons.length, 1)) * 100);

            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-cyan-400 font-bold">
                      {mod.id}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                        mod.level === 'foundation'
                          ? 'border-blue-800/60 bg-blue-950/60 text-blue-300'
                          : mod.level === 'core'
                          ? 'border-emerald-800/60 bg-emerald-950/60 text-emerald-300'
                          : mod.level === 'advanced'
                          ? 'border-purple-800/60 bg-purple-950/60 text-purple-300'
                          : mod.level === 'systems'
                          ? 'border-amber-800/60 bg-amber-950/60 text-amber-300'
                          : 'border-rose-800/60 bg-rose-950/60 text-rose-300'
                      }`}
                    >
                      {mod.level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    <Link href={`/modules/${mod.id}`}>
                      {mod.title}
                    </Link>
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{lessons.length} Lessons</span>
                    <span className="font-mono font-medium text-emerald-400">{pct}% Mastered</span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>

                  {/* Prerequisites info */}
                  {mod.prerequisite_modules.length > 0 && (
                    <div className="mt-3 text-[11px] text-slate-500 truncate">
                      Prereqs: {mod.prerequisite_modules.join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/modules/${mod.id}`}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View Lessons</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {mod.capstone && (
                    <span className="rounded bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                      Capstone: {mod.capstone}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
