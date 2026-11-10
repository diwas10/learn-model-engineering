'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  Terminal,
  BarChart2,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import { useMastery } from '@/lib/masteryStore';
import { courseData, modulesMap } from '@/lib/curriculum';

export default function DashboardPage() {
  const {
    masteredCount,
    totalLessons,
    completionPercentage,
    completedLessonIds,
    competencies
  } = useMastery();

  const coreModules = courseData.learning_paths.recommended_core
    .map((id) => modulesMap.get(id))
    .filter(Boolean);

  const parallelTracks = courseData.learning_paths.parallel_tracks;

  const quickStartLessons = [
    { id: 'math_linear.L02', title: 'Matrix Multiplication & Contractions', module: 'Linear Algebra' },
    { id: 'math_calculus.L03', title: 'Chain Rule & Computational Graphs', module: 'Calculus' },
    { id: 'transformer_core.L03', title: 'Scaled Dot-Product Attention', module: 'Transformer Implementation' },
    { id: 'transformer_core.L05', title: 'Multi-Head Attention Tensor Reshaping', module: 'Transformer Implementation' },
    { id: 'adaptation_peft.L03', title: 'LoRA Low-Rank Adaptation', module: 'PEFT' },
    { id: 'inference_foundations.L03', title: 'KV Cache Mechanics & Shapes', module: 'Inference Foundations' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Postgraduate AI Model Engineering Platform</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Understand, Implement & Optimize Modern AI Systems
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
                Non-linear, research-grade engineering laboratory. Study linear algebra, autograd, modern Transformers, parameter-efficient adaptation, and distributed inference in parallel with verified derivations and execution sandboxes.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Total Lessons</span>
                <div className="mt-1 text-2xl font-black font-mono text-cyan-400">{totalLessons}</div>
                <div className="text-[11px] text-slate-500">Across 28 Modules</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Mastery Gates</span>
                <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
                  {masteredCount} <span className="text-xs text-slate-500 font-normal">/ {totalLessons}</span>
                </div>
                <div className="text-[11px] text-emerald-400/80">{completionPercentage}% Verified</div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-semibold uppercase text-slate-400">Capstones</span>
                <div className="mt-1 text-2xl font-black font-mono text-purple-400">6</div>
                <div className="text-[11px] text-slate-500">Autonomous Labs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Competency Radar & Weak Concepts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Competency Dimensions */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Engineering Competency Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-dimensional mastery tracked across 5 rigorous criteria.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">Active Profile</span>
            </div>

            <div className="space-y-4">
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

          {/* Weak Concepts & Recommended Revisions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Targeted Revisions
              </h3>
              <p className="text-xs text-slate-400">
                Recommended focus based on prerequisites and failure analysis.
              </p>

              <div className="mt-4 space-y-2.5">
                {[
                  {
                    id: 'math_linear.L02',
                    title: 'Matrix Contractions & Einsum',
                    reason: 'Prerequisite for Multi-Head Attention'
                  },
                  {
                    id: 'nn_autograd.L04',
                    title: 'Reverse-Mode Autograd Engine',
                    reason: 'Prerequisite for custom backprop passes'
                  },
                  {
                    id: 'transformer_core.L03',
                    title: 'Scaled Dot-Product Attention',
                    reason: 'Flagship Core Architecture'
                  }
                ].map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/lessons/${rec.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                      {rec.title}
                    </div>
                    <div className="text-[10px] text-amber-400/90 mt-0.5">{rec.reason}</div>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/coverage"
              className="mt-4 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between pt-3 border-t border-slate-800"
            >
              <span>View Full Coverage Audit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Flagship Reference Slice Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
                <Flame className="h-4 w-4" />
                <span>Reference Vertical Slice</span>
              </div>
              <h2 className="text-xl font-bold text-white">Representative Mastery Lessons</h2>
            </div>
            <Link
              href="/modules"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Explore All 253 Lessons</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartLessons.map((l) => (
              <Link
                key={l.id}
                href={`/lessons/${l.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
                  <span>{l.id}</span>
                  <span className="text-slate-500 font-sans">{l.module}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {l.title}
                </h3>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-500">12 Structured Sections</span>
                  <span className="text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Start <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Interactive Flagship Laboratories Hub */}
        <section className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider mb-1">
              <Zap className="h-4 w-4" />
              <span>Interactive Simulators</span>
            </div>
            <h2 className="text-xl font-bold text-white">Flagship Engineering Laboratories</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Transformer Architecture Lab',
                desc: 'Attention scores, RoPE phase rotations, MHA/GQA, SwiGLU, and autoregressive generation with live KV caching.',
                href: '/labs/transformer',
                accent: 'border-cyan-800/60 hover:border-cyan-500 text-cyan-400'
              },
              {
                title: 'Model Surgery & PEFT Lab',
                desc: 'Parameter-efficient fine-tuning, LoRA rank/alpha weight merge, vocabulary expansion, and SLERP model merging.',
                href: '/labs/model-surgery',
                accent: 'border-purple-800/60 hover:border-purple-500 text-purple-400'
              },
              {
                title: 'AI Inference Profiler Lab',
                desc: 'Prefill vs decode phases, KV Cache memory sizing, quantization error analysis, and speculative decoding speedup.',
                href: '/labs/inference',
                accent: 'border-amber-800/60 hover:border-amber-500 text-amber-400'
              },
              {
                title: 'Mathematical Geometry Lab',
                desc: 'Linear transformations, eigenvalues, eigenspaces, SVD low-rank approximations, and loss landscapes.',
                href: '/labs/mathematics',
                accent: 'border-blue-800/60 hover:border-blue-500 text-blue-400'
              },
              {
                title: 'Neural Dynamics Lab',
                desc: 'Activation functions (ReLU, GELU, SiLU), weight initialization variance, and residual gradient highways.',
                href: '/labs/neural-networks',
                accent: 'border-emerald-800/60 hover:border-emerald-500 text-emerald-400'
              },
              {
                title: 'Tensor Shape Debugger',
                desc: 'Cross-cutting lab: Trace B, T, H, D dimensions, validate broadcasting, and inspect einsum contractions.',
                href: '/labs/shapes',
                accent: 'border-teal-800/60 hover:border-teal-500 text-teal-400'
              }
            ].map((lab) => (
              <Link
                key={lab.href}
                href={lab.href}
                className={`rounded-2xl border bg-slate-900/50 p-6 flex flex-col justify-between transition-all group ${lab.accent}`}
              >
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {lab.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {lab.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center space-x-1 text-xs font-semibold">
                  <span>Open Laboratory</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Parallel Study Tracks */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              Non-Linear Parallel Study Tracks
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {courseData.learning_paths.rule}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {parallelTracks.map((track, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800/80 bg-slate-950 p-4">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
                  Parallel Track {idx + 1}
                </span>
                <div className="space-y-1.5">
                  {track.map((modId) => {
                    const m = modulesMap.get(modId);
                    return (
                      <Link
                        key={modId}
                        href={`/modules/${modId}`}
                        className="block rounded-lg bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
                      >
                        {m ? m.title : modId}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
