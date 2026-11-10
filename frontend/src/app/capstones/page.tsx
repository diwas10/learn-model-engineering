'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { courseData, capstonesMap, modulesMap } from '@/lib/curriculum';
import { useMastery } from '@/lib/masteryStore';

export default function CapstonesPage() {
  const { state } = useMastery();
  const [completedProjects, setCompletedProjects] = useState<Record<string, boolean>>({});

  const toggleComplete = (id: string) => {
    setCompletedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Award className="h-4 w-4" />
            <span>Mastery Deliverables</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Capstone Engineering Projects
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Six comprehensive engineering capstones validating autonomous implementation, model surgery, multimodal alignment, and production AI system deployment.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseData.capstone_projects.map((proj) => {
            const isDone = completedProjects[proj.id];

            return (
              <div
                key={proj.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  isDone
                    ? 'border-emerald-800/60 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                      Capstone {proj.id}
                    </span>
                    <button
                      onClick={() => toggleComplete(proj.id)}
                      className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{isDone ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{proj.title}</h3>

                  {/* Related Modules */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.related_modules.map((mId) => {
                      const mod = modulesMap.get(mId);
                      return (
                        <Link
                          key={mId}
                          href={`/modules/${mId}`}
                          className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-cyan-400"
                        >
                          {mod ? mod.title : mId}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-3 border-t border-slate-800/80 pt-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Required Deliverables
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {proj.required_deliverables.map((del, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Acceptance Criteria
                      </span>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {proj.acceptance_criteria.map((crit, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {proj.hardware_policy && (
                  <div className="mt-6 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
                    Policy: {proj.hardware_policy}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
