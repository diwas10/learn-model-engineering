'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Award,
  Zap,
  Code2,
  Sparkles,
  Search,
  MessageSquareCode,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Layers,
  Cpu,
  Compass,
  Menu,
  X,
  Filter,
  Terminal,
  Activity,
  Check,
  ArrowRight,
  Play
} from 'lucide-react';
import { courseData, modulesMap, lessonsMap, getModuleLessons } from '@/lib/curriculum';
import { CourseData, Module, Lesson, CapstoneProject } from '@/types/curriculum';
import { getLessonEnrichment } from '@/data/lessonEnrichment';
import { MathView, MathBlock, FormattedMathText } from '@/components/MathView';
import { ManimAnimationPlayer } from '@/components/ManimAnimationPlayer';
import { CodeEditorPlayground } from '@/components/CodeEditorPlayground';
import { MasteryGateTracker } from '@/components/MasteryGateTracker';
import { AITutorDrawer } from '@/components/AITutorDrawer';
import { useMastery } from '@/lib/masteryStore';

// Embedded Flagship Laboratories
import TransformerLabView from '@/app/labs/transformer/page';
import ModelSurgeryLabView from '@/app/labs/model-surgery/page';
import InferenceLabView from '@/app/labs/inference/page';
import MathLabView from '@/app/labs/mathematics/page';
import NeuralNetLabView from '@/app/labs/neural-networks/page';
import ShapesLabView from '@/app/labs/shapes/page';

type TabView = 'masterclass' | 'labs' | 'capstones' | 'dashboard';
type LabId = 'transformer' | 'model-surgery' | 'inference' | 'mathematics' | 'neural-networks' | 'shapes';

export default function SinglePageMasteryPlatform() {
  const {
    completedLessonIds,
    masteredCount,
    totalLessons,
    completionPercentage,
    updateGate,
    competencies
  } = useMastery();

  // Active Navigation & Content State
  const [selectedModuleId, setSelectedModuleId] = useState<string>('math_linear');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('math_linear.L01');
  const [activeTab, setActiveTab] = useState<TabView>('masterclass');
  const [activeLabId, setActiveLabId] = useState<LabId>('transformer');

  // UI Drawer / Responsive States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    math_linear: true,
    transformer_core: true
  });

  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Sync with URL Hash on Mount or Hash Change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && lessonsMap.has(hash)) {
        const lesson = lessonsMap.get(hash)!;
        setSelectedLessonId(lesson.id);
        setSelectedModuleId(lesson.module_id);
        setActiveTab('masterclass');
        setExpandedModules((prev) => ({ ...prev, [lesson.module_id]: true }));
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Current Active Objects
  const currentModule: Module = useMemo(() => {
    return modulesMap.get(selectedModuleId) || courseData.modules[0];
  }, [selectedModuleId]);

  const currentLesson: Lesson = useMemo(() => {
    return lessonsMap.get(selectedLessonId) || courseData.lessons[0];
  }, [selectedLessonId]);

  const currentEnrichment = useMemo(() => {
    return getLessonEnrichment(currentLesson.id, currentLesson.title);
  }, [currentLesson]);

  // All Lessons Array for Prev/Next
  const allLessons: Lesson[] = courseData.lessons;

  const currentIndex = useMemo(() => {
    return allLessons.findIndex((l) => l.id === currentLesson.id);
  }, [allLessons, currentLesson]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Filtered Modules & Lessons for Real-Time Search in Sidebar
  const filteredModules = useMemo(() => {
    if (!moduleFilter.trim()) return courseData.modules;
    const q = moduleFilter.toLowerCase();
    return courseData.modules
      .map((mod) => {
        const lessons = getModuleLessons(mod.id);
        const matchesModule = mod.title.toLowerCase().includes(q) || mod.id.toLowerCase().includes(q);
        const matchingLessons = lessons.filter(
          (les) =>
            les.title.toLowerCase().includes(q) ||
            les.id.toLowerCase().includes(q) ||
            les.learning_objectives.some((obj) => obj.toLowerCase().includes(q))
        );
        if (matchesModule || matchingLessons.length > 0) {
          return mod;
        }
        return null;
      })
      .filter(Boolean) as Module[];
  }, [moduleFilter]);

  // Handle Lesson Selection
  const selectLesson = (lesson: Lesson, moduleId: string) => {
    setSelectedLessonId(lesson.id);
    setSelectedModuleId(moduleId);
    setActiveTab('masterclass');
    setSidebarOpen(false); // Auto-close drawer on mobile
    window.location.hash = lesson.id;
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const currentResources = useMemo(() => {
    return courseData.resources.filter((r) => r.relevant_modules.includes(selectedModuleId));
  }, [selectedModuleId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* LEFT SIDEBAR: Real-time Navigable Curriculum Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col border-r border-slate-800 bg-slate-950/98 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:w-80 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header & Search */}
        <div className="flex flex-col border-b border-slate-800 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Course Curriculum
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                28 Modules • 253 Lessons
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Real-time Filter */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter 253 lessons..."
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            {moduleFilter && (
              <button
                onClick={() => setModuleFilter('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredModules.map((mod) => {
            const isExpanded = expandedModules[mod.id] || !!moduleFilter.trim();
            const isCurrentModule = mod.id === selectedModuleId;
            const moduleLessons = getModuleLessons(mod.id);
            const completedInModule = moduleLessons.filter((l) => completedLessonIds.has(l.id)).length;

            return (
              <div
                key={mod.id}
                className={`rounded-xl border transition-colors ${
                  isCurrentModule
                    ? 'border-cyan-800/40 bg-slate-900/40'
                    : 'border-slate-800/60 bg-slate-900/10 hover:border-slate-800 hover:bg-slate-900/30'
                }`}
              >
                {/* Module Header Toggle */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between p-2.5 text-left text-xs font-semibold text-slate-200"
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        completedInModule === moduleLessons.length && moduleLessons.length > 0
                          ? 'bg-emerald-400'
                          : completedInModule > 0
                          ? 'bg-amber-400'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className="truncate text-white font-medium text-[11px] sm:text-xs">
                      {mod.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {completedInModule}/{moduleLessons.length}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Lessons inside Module */}
                {isExpanded && (
                  <div className="space-y-0.5 border-t border-slate-800/60 p-1.5 bg-slate-950/60">
                    {moduleLessons.map((les) => {
                      const isSelected = les.id === selectedLessonId;
                      const isMastered = completedLessonIds.has(les.id);

                      return (
                        <button
                          key={les.id}
                          onClick={() => selectLesson(les, mod.id)}
                          className={`flex w-full items-start space-x-2 rounded-lg p-2 text-left text-[11px] transition-all ${
                            isSelected
                              ? 'bg-cyan-950/70 text-cyan-300 font-semibold ring-1 ring-cyan-500/50 shadow-sm'
                              : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isMastered ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full border text-[9px] text-center leading-[13px] ${
                                  isSelected
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-slate-700 text-slate-600'
                                }`}
                              >
                                •
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate leading-snug">{les.title}</div>
                            <span className="text-[9px] font-mono opacity-60 block mt-0.5">
                              {les.id}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Links */}
        <div className="border-t border-slate-800 p-2.5 bg-slate-950 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              setActiveTab('labs');
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold text-[11px]">Flagship Labs</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('capstones');
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-purple-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Award className="h-3.5 w-3.5 text-purple-400" />
            <span className="font-semibold text-[11px]">6 Capstones</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar: Mobile Drawer Toggle + View Tabs + AI Tutor Trigger */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 sm:px-6 backdrop-blur-md">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* Mobile Open Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
              aria-label="Open Curriculum Drawer"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Current Lesson Breadcrumb */}
            <div className="truncate">
              <span className="hidden sm:inline-block text-[11px] font-mono text-cyan-400 uppercase font-semibold mr-2">
                {currentModule.title}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {currentLesson.title}
              </span>
            </div>
          </div>

          {/* View Mode Tabs & AI Tutor Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-[11px] sm:text-xs font-semibold">
              <button
                onClick={() => setActiveTab('masterclass')}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === 'masterclass'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masterclass
              </button>
              <button
                onClick={() => setActiveTab('labs')}
                className={`rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === 'labs'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Labs
              </button>
              <button
                onClick={() => setActiveTab('capstones')}
                className={`hidden xs:block rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === 'capstones'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Capstones
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`hidden md:block rounded-lg px-2.5 py-1 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            </div>

            <button
              onClick={() => setTutorOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-indigo-700/50 bg-indigo-950/40 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/60 transition-colors"
            >
              <MessageSquareCode className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto min-w-0">
          {/* TAB 1: MASTERCLASS INSTRUCTIONAL VIEW */}
          {activeTab === 'masterclass' && (
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-10">
              {/* Lesson Hero Banner */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-4 sm:p-6 shadow-xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-full">
                    {currentLesson.id}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-purple-400 bg-purple-950/80 border border-purple-800/80 px-2.5 py-0.5 rounded-full capitalize">
                    Difficulty: {currentLesson.estimated_difficulty || 'core'}
                  </span>
                  {completedLessonIds.has(currentLesson.id) && (
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" /> Mastered
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {currentLesson.title}
                </h1>

                {/* Behavioral Outcomes */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Learning Objectives & Behavioral Outcomes
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {currentLesson.learning_objectives.map((obj: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <FormattedMathText text={obj} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. What problem does this solve? */}
              <section className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[10px]">
                    1
                  </span>
                  <span>Problem Formulation</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  What problem does this concept solve?
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
                  <FormattedMathText text={currentEnrichment.problemSolved} />
                </div>
              </section>

              {/* 2. Intuitive Geometric Meaning */}
              <section className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-indigo-800 text-[10px]">
                    2
                  </span>
                  <span>Intuitive Explanation</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  High-Level Intuition & Geometric Meaning
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
                  <FormattedMathText text={currentEnrichment.intuitiveExplanation} />
                </div>
              </section>

              {/* 3. Mathematical Animation (Manim) */}
              <section className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-950 border border-purple-800 text-[10px]">
                    3
                  </span>
                  <span>Interactive Mathematical Animation</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Dynamic Visual Derivation
                </h2>
                <div className="overflow-hidden rounded-2xl border border-slate-800">
                  <ManimAnimationPlayer
                    concept={currentLesson.title}
                    equation={currentEnrichment.animationEquation}
                    storyboard={
                      currentLesson.visualizations[1]?.storyboard ||
                      currentLesson.visualizations[0]?.storyboard
                    }
                  />
                </div>
              </section>

              {/* 4 & 5. Mathematical Formulation & Derivation */}
              <section className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 border border-blue-800 text-[10px]">
                    4 & 5
                  </span>
                  <span>Mathematical Derivation</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Mathematical Formulation & Analytical Derivation
                </h2>
                <div className="overflow-x-auto rounded-2xl">
                  <MathBlock
                    label="Analytical Equations & Gradient Propagation"
                    math={currentEnrichment.mathDerivation}
                  />
                </div>
              </section>

              {/* 6. Concrete Numerical Example */}
              <section className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800 text-[10px]">
                    6
                  </span>
                  <span>Concrete Numerical Example</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Step-by-Step Numerical Walkthrough
                </h2>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
                  <FormattedMathText text={currentEnrichment.numericalExample} />
                </div>
              </section>

              {/* 7. Tensor Shape Invariants */}
              <section className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-950 border border-teal-800 text-[10px]">
                    7
                  </span>
                  <span>Tensor Shape Algebra</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Intermediate Tensor Dimensions & Invariants
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentEnrichment.tensorShapes.map((ts, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
                    >
                      <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                        {ts.name}
                      </span>
                      <div className="mt-1 font-mono text-xs sm:text-sm font-bold text-cyan-300">
                        {ts.shape}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">{ts.description}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 8. Scratch Implementation Sandbox */}
              <section className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800 text-[10px]">
                    8
                  </span>
                  <span>Scratch Implementation Laboratory</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Implementation from Scratch with Automated Verification
                </h2>
                <CodeEditorPlayground
                  initialCode={currentEnrichment.scratchCode}
                  testCases={currentEnrichment.testCases}
                  lessonId={currentLesson.id}
                  onAllTestsPassed={() => {
                    updateGate(currentLesson.id, { implementationPassed: true });
                  }}
                />
              </section>

              {/* 9 & 10. Misconceptions & Practical Implications */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Common Misconceptions</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {currentEnrichment.commonMisconceptions.map((m, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <FormattedMathText text={m} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Production Systems & Scale</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {currentEnrichment.practicalImplications.map((app, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <FormattedMathText text={app} />
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 11. Primary References */}
              {currentResources.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    <span>Verified Primary Sources & References</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentResources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-cyan-400">
                            {res.type}
                          </span>
                          <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400" />
                        </div>
                        <div className="mt-1 text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 truncate">
                          {res.title}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* 12. Knowledge Assessment & Mastery Gate */}
              <section id="mastery-gate" className="space-y-4 pt-4 border-t border-slate-800">
                <MasteryGateTracker lesson={currentLesson} />
              </section>

              {/* Bottom In-Place Pagination */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                {prevLesson ? (
                  <button
                    onClick={() => selectLesson(prevLesson, prevLesson.module_id)}
                    className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden xs:inline truncate max-w-[150px]">
                      Previous: {prevLesson.title}
                    </span>
                    <span className="xs:hidden">Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <button
                    onClick={() => selectLesson(nextLesson, nextLesson.module_id)}
                    className="flex items-center space-x-2 rounded-xl bg-cyan-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all"
                  >
                    <span className="hidden xs:inline truncate max-w-[150px]">
                      Next: {nextLesson.title}
                    </span>
                    <span className="xs:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FLAGSHIP LABORATORIES VIEW */}
          {activeTab === 'labs' && (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
              {/* Lab Selector Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'transformer', label: 'Transformer Lab' },
                  { id: 'model-surgery', label: 'Model Surgery & PEFT' },
                  { id: 'inference', label: 'Inference Profiler' },
                  { id: 'mathematics', label: 'Math Geometry' },
                  { id: 'neural-networks', label: 'Neural Dynamics' },
                  { id: 'shapes', label: 'Tensor Shapes' }
                ].map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => setActiveLabId(lab.id as LabId)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                      activeLabId === lab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lab.label}
                  </button>
                ))}
              </div>

              {/* Embedded Lab Component */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-2 sm:p-4">
                {activeLabId === 'transformer' && <TransformerLabView />}
                {activeLabId === 'model-surgery' && <ModelSurgeryLabView />}
                {activeLabId === 'inference' && <InferenceLabView />}
                {activeLabId === 'mathematics' && <MathLabView />}
                {activeLabId === 'neural-networks' && <NeuralNetLabView />}
                {activeLabId === 'shapes' && <ShapesLabView />}
              </div>
            </div>
          )}

          {/* TAB 3: CAPSTONES VIEW */}
          {activeTab === 'capstones' && (
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800">
                  Capstone Engineering Specifications
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  6 Rigorous Systems Capstones
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  End-to-end production implementations with verifiable criteria and benchmarks.
                </p>
              </div>

              <div className="space-y-6">
                {courseData.capstone_projects.map((cap: CapstoneProject, idx: number) => (
                  <div
                    key={cap.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2.5 py-0.5 rounded-lg border border-cyan-800">
                        Capstone {idx + 1} • {cap.id}
                      </span>
                      <span className="text-xs font-mono text-purple-300">
                        Related Modules: {cap.related_modules?.length || 0}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white">{cap.title}</h2>
                    {cap.hardware_policy && (
                      <p className="text-xs sm:text-sm text-cyan-300/80 font-mono">
                        Hardware Policy: {cap.hardware_policy}
                      </p>
                    )}

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Required Deliverables
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        {cap.required_deliverables?.map((del: string, dIdx: number) => (
                          <div
                            key={dIdx}
                            className="flex items-start space-x-2 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80"
                          >
                            <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {cap.acceptance_criteria && cap.acceptance_criteria.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                          Acceptance Criteria
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-300">
                          {cap.acceptance_criteria.map((crit: string, cIdx: number) => (
                            <div key={cIdx} className="flex items-start space-x-2">
                              <span className="text-emerald-400 font-mono shrink-0">✓</span>
                              <span>{crit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OVERVIEW DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Total Lessons</span>
                  <div className="mt-1 text-2xl font-black font-mono text-cyan-400">{totalLessons}</div>
                  <div className="text-[11px] text-slate-500">Across 28 Modules</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Mastery Gates</span>
                  <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                    {masteredCount} <span className="text-xs text-slate-500 font-normal">/ {totalLessons}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400/80">{completionPercentage}% Verified</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Capstones</span>
                  <div className="mt-1 text-2xl font-black font-mono text-purple-400">6</div>
                  <div className="text-[11px] text-slate-500">Autonomous Labs</div>
                </div>
              </div>

              {/* Competency Matrix */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Engineering Competency Matrix
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '1. Conceptual & Architectural Intuition', val: competencies.conceptual, color: 'from-cyan-500 to-blue-500' },
                    { label: '2. Mathematical Rigor & Derivations', val: competencies.mathematical, color: 'from-blue-500 to-indigo-500' },
                    { label: '3. Scratch Implementation & Tensor Tracing', val: competencies.implementation, color: 'from-emerald-500 to-teal-500' },
                    { label: '4. Experimental Reasoning & Diagnostics', val: competencies.experimental, color: 'from-purple-500 to-pink-500' },
                    { label: '5. Systems & Distributed Inference Engineering', val: competencies.systems, color: 'from-amber-500 to-orange-500' }
                  ].map((comp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{comp.label}</span>
                        <span className="font-mono text-slate-400 font-bold">{comp.val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${comp.color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(comp.val, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Tutor Drawer */}
      <AITutorDrawer
        lesson={currentLesson}
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
      />
    </div>
  );
}
