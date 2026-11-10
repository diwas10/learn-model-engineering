'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Terminal,
  Activity,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Lesson, Module, Resource } from '@/types/curriculum';
import { LessonEnrichment } from '@/data/lessonEnrichment';
import { MathView, MathBlock } from '@/components/MathView';
import { ManimAnimationPlayer } from '@/components/ManimAnimationPlayer';
import { CodeEditorPlayground } from '@/components/CodeEditorPlayground';
import { MasteryGateTracker } from '@/components/MasteryGateTracker';
import { AITutorDrawer } from '@/components/AITutorDrawer';
import { useMastery } from '@/lib/masteryStore';

interface LessonClientViewProps {
  lesson: Lesson;
  module?: Module;
  prevLesson?: Lesson;
  nextLesson?: Lesson;
  resources: Resource[];
  enrichment: LessonEnrichment;
}

export default function LessonClientView({
  lesson,
  module,
  prevLesson,
  nextLesson,
  resources,
  enrichment
}: LessonClientViewProps) {
  const [tutorOpen, setTutorOpen] = useState(false);
  const { isUnlocked, state, updateGate } = useMastery();

  const unlocked = isUnlocked(lesson.id);
  const isMastered = state.completedGates[lesson.id]?.mastered;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Breadcrumb & Nav Bar */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs">
            <Link href="/modules" className="text-slate-400 hover:text-white transition-colors">
              Modules
            </Link>
            <span className="text-slate-600">/</span>
            {module && (
              <Link
                href={`/modules/${module.id}`}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {module.title}
              </Link>
            )}
            <span className="text-slate-600">/</span>
            <span className="font-mono text-cyan-400 font-semibold">{lesson.id}</span>
          </div>

          {/* Quick Actions & AI Tutor Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setTutorOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-indigo-700/60 bg-gradient-to-r from-indigo-950 to-purple-950 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:border-indigo-500 shadow-sm transition-all"
            >
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </button>

            {/* Prev/Next buttons */}
            <div className="flex items-center space-x-1">
              {prevLesson ? (
                <Link
                  href={`/lessons/${prevLesson.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  title={`Previous: ${prevLesson.title}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/40 text-slate-700 cursor-not-allowed">
                  <ChevronLeft className="h-4 w-4" />
                </span>
              )}

              {nextLesson ? (
                <Link
                  href={`/lessons/${nextLesson.id}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  title={`Next: ${nextLesson.title}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800/40 text-slate-700 cursor-not-allowed">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-400 border border-cyan-800/60">
                  {lesson.id}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-400">
                  {lesson.estimated_difficulty}
                </span>
                {isMastered && (
                  <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Mastered
                  </span>
                )}
                {!unlocked && (
                  <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-800/60 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Prerequisites Pending
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white capitalize">
                {lesson.title}
              </h1>
            </div>

            {/* Jump to Mastery Gate */}
            <a
              href="#mastery-gate"
              className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 hover:text-white transition-all"
            >
              <Award className="h-4 w-4 text-amber-400" />
              <span>Mastery Verification</span>
            </a>
          </div>

          {/* Learning Objectives Pill List */}
          <div className="mt-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Learning Objectives & Behavioral Outcomes
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {lesson.learning_objectives.map((obj, i) => (
                <div key={i} className="flex items-start space-x-2 rounded-lg bg-slate-900/60 p-2.5 border border-slate-800/80">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Instructional Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 1. What problem does this solve? */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[10px]">1</span>
            <span>Problem Formulation</span>
          </div>
          <h2 className="text-xl font-bold text-white">What problem does this concept solve?</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-300 leading-relaxed">
            {enrichment.problemSolved}
          </div>
        </section>

        {/* 2. Intuitive Explanation */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-indigo-800 text-[10px]">2</span>
            <span>Intuitive Explanation</span>
          </div>
          <h2 className="text-xl font-bold text-white">High-Level Intuition & Geometric Meaning</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-300 leading-relaxed">
            {enrichment.intuitiveExplanation}
          </div>
        </section>

        {/* 3. Visual Explanation (Manim Vector Animation) */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-950 border border-purple-800 text-[10px]">3</span>
            <span>Interactive Visual Explanation</span>
          </div>
          <h2 className="text-xl font-bold text-white">Mathematical Animation & Dynamics</h2>
          <ManimAnimationPlayer
            concept={lesson.title}
            equation={enrichment.animationEquation}
            storyboard={lesson.visualizations[1]?.storyboard || lesson.visualizations[0]?.storyboard}
          />
        </section>

        {/* 4 & 5. Mathematical Formulation & Step-by-Step Derivation */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 border border-blue-800 text-[10px]">4 & 5</span>
            <span>Mathematical Derivation</span>
          </div>
          <h2 className="text-xl font-bold text-white">Mathematical Formulation & Step-by-Step Derivation</h2>
          <MathBlock
            label="Analytical Derivation & Gradient Equations"
            math={enrichment.mathDerivation}
          />
        </section>

        {/* 6. Numerical Example */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800 text-[10px]">6</span>
            <span>Concrete Numerical Example</span>
          </div>
          <h2 className="text-xl font-bold text-white">Step-by-Step Numerical Walkthrough</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-300 leading-relaxed">
            <MathView math={enrichment.numericalExample} block={false} />
          </div>
        </section>

        {/* 7. Tensor Shapes & Shape Algebra */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[10px]">7</span>
            <span>Tensor Shape Algebra</span>
          </div>
          <h2 className="text-xl font-bold text-white">Intermediate Tensor Dimensions & Invariants</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {enrichment.tensorShapes.map((ts, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-semibold uppercase text-slate-400">{ts.name}</span>
                <div className="mt-1 font-mono text-sm font-bold text-cyan-300">{ts.shape}</div>
                <div className="mt-1 text-xs text-slate-400">{ts.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Implementation from Scratch */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800 text-[10px]">8</span>
            <span>Scratch Implementation Laboratory</span>
          </div>
          <h2 className="text-xl font-bold text-white">Implementation from Scratch with Automated Verification</h2>
          <CodeEditorPlayground
            initialCode={enrichment.scratchCode}
            testCases={enrichment.testCases}
            lessonId={lesson.id}
            onAllTestsPassed={() => {
              updateGate(lesson.id, { implementationPassed: true });
            }}
          />
        </section>

        {/* 9 & 10. Misconceptions & Practical Applications */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Misconceptions */}
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle className="h-4 w-4" />
              <span>Common Misconceptions & Failure Modes</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {enrichment.commonMisconceptions.map((m, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practical Applications */}
          <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-6 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Lightbulb className="h-4 w-4" />
              <span>Production Systems & Research Implications</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {enrichment.practicalImplications.map((app, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 11. External Resources & Real Video/Reading Provenance */}
        {resources.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <BookOpen className="h-4 w-4" />
              <span>Verified External Reading & Primary Sources</span>
            </div>
            <h3 className="text-lg font-bold text-white">Source Provenance & Curated References</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-cyan-400">{res.type}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white group-hover:text-cyan-300">
                    {res.title}
                  </div>
                  {res.usage && (
                    <div className="mt-2 text-xs text-slate-400 line-clamp-2">{res.usage}</div>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 12. Knowledge Assessment & Mastery Gate */}
        <section id="mastery-gate" className="space-y-4 pt-6">
          <MasteryGateTracker lesson={lesson} />
        </section>

        {/* Bottom Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          {prevLesson ? (
            <Link
              href={`/lessons/${prevLesson.id}`}
              className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous: {prevLesson.title}</span>
            </Link>
          ) : <div />}

          {nextLesson ? (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all"
            >
              <span>Next: {nextLesson.title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : <div />}
        </div>
      </div>

      {/* AI Tutor Drawer */}
      <AITutorDrawer
        lesson={lesson}
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
      />
    </div>
  );
}
