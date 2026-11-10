'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle, Award, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Lesson } from '@/types/curriculum';
import { useMastery } from '@/lib/masteryStore';

interface MasteryGateTrackerProps {
  lesson: Lesson;
  className?: string;
}

export const MasteryGateTracker: React.FC<MasteryGateTrackerProps> = ({ lesson, className = '' }) => {
  const { state, updateGate } = useMastery();
  const current = state.completedGates[lesson.id] || {
    lessonId: lesson.id,
    derivationCompleted: false,
    implementationPassed: false,
    failureCaseExplained: false,
    transferPassed: false,
    score: 0,
    unlocked: true,
    mastered: false
  };

  const [failureExplanation, setFailureExplanation] = useState('');
  const [transferAnswer, setTransferAnswer] = useState('');
  const [transferSubmitted, setTransferSubmitted] = useState(false);

  const reqs = lesson.mastery_gate.required;

  const handleToggle = (gateKey: 'derivationCompleted' | 'implementationPassed' | 'failureCaseExplained' | 'transferPassed') => {
    const nextVal = !current[gateKey];
    updateGate(lesson.id, { [gateKey]: nextVal });

    // Check if newly mastered
    const willMaster = nextVal && (
      (gateKey === 'derivationCompleted' || current.derivationCompleted || !reqs.includes('derive_or_trace')) &&
      (gateKey === 'implementationPassed' || current.implementationPassed || !reqs.includes('implement_or_reproduce')) &&
      (gateKey === 'failureCaseExplained' || current.failureCaseExplained || !reqs.includes('explain_failure_case')) &&
      (gateKey === 'transferPassed' || current.transferPassed || !reqs.includes('pass_unseen_transfer_question'))
    );

    if (willMaster && !current.mastered) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveFailureCase = () => {
    if (failureExplanation.trim().length > 10) {
      updateGate(lesson.id, { failureCaseExplained: true });
    }
  };

  const handleSaveTransfer = () => {
    if (transferAnswer.trim().length > 10) {
      setTransferSubmitted(true);
      updateGate(lesson.id, { transferPassed: true });
      if (current.derivationCompleted && current.implementationPassed) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const gatesList = [
    {
      id: 'derive_or_trace',
      key: 'derivationCompleted' as const,
      title: 'Gate 1: Mathematical Derivation & Tensor Tracing',
      description: 'Derive the forward and backward equations, proving shape consistency.',
      completed: current.derivationCompleted
    },
    {
      id: 'implement_or_reproduce',
      key: 'implementationPassed' as const,
      title: 'Gate 2: Implementation & Unit Tests',
      description: 'Implement the operation from scratch and pass all automated assertions.',
      completed: current.implementationPassed
    },
    {
      id: 'explain_failure_case',
      key: 'failureCaseExplained' as const,
      title: 'Gate 3: Failure Mode & Edge Case Analysis',
      description: 'Identify numerical instability, saturation, or boundary failure conditions.',
      completed: current.failureCaseExplained
    },
    {
      id: 'pass_unseen_transfer_question',
      key: 'transferPassed' as const,
      title: 'Gate 4: Unseen Architecture Transfer Challenge',
      description: 'Generalize the concept to an unseen model configuration or modality.',
      completed: current.transferPassed
    }
  ].filter((g) => reqs.includes(g.id));

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            current.mastered
              ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400'
          }`}>
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Mastery Gate Verification
              {current.mastered && (
                <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60">
                  Mastered
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Threshold: {Math.round(lesson.mastery_gate.minimum_score_fraction * 100)}% verified evidence
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono text-cyan-400">
            {current.score}%
          </div>
          <div className="text-[10px] uppercase font-semibold text-slate-500">
            Mastery Score
          </div>
        </div>
      </div>

      {/* Gates Checklist */}
      <div className="space-y-4">
        {gatesList.map((g, idx) => (
          <div
            key={g.id}
            className={`rounded-xl border p-4 transition-all ${
              g.completed
                ? 'border-emerald-800/50 bg-emerald-950/20 shadow-sm'
                : 'border-slate-800/80 bg-slate-900/40'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleToggle(g.key)}
                  className="mt-0.5 rounded-full p-0.5 hover:scale-110 transition-transform"
                >
                  {g.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-600 hover:text-slate-400" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-semibold text-white">
                    {g.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {g.description}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggle(g.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  g.completed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {g.completed ? 'Completed' : 'Mark Verified'}
              </button>
            </div>

            {/* Interactive Failure Case Prompt */}
            {g.id === 'explain_failure_case' && !g.completed && (
              <div className="mt-3 pl-8">
                <textarea
                  placeholder="Analyze one edge case: e.g. What happens if inputs are unnormalized, sequence length is 1, or values approach FP16 saturation?"
                  value={failureExplanation}
                  onChange={(e) => setFailureExplanation(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  rows={2}
                />
                <button
                  onClick={handleSaveFailureCase}
                  disabled={failureExplanation.trim().length <= 10}
                  className="mt-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition-colors"
                >
                  Submit Failure Analysis
                </button>
              </div>
            )}

            {/* Interactive Transfer Challenge */}
            {g.id === 'pass_unseen_transfer_question' && !g.completed && (
              <div className="mt-3 pl-8">
                <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800/80 mb-2">
                  <span className="text-[10px] font-semibold uppercase text-cyan-400 block mb-0.5">
                    Transfer Question
                  </span>
                  <p className="text-xs text-slate-300">
                    If this architecture is scaled to a 128k context window with 8-bit KV caching, how do memory consumption and numerical gradient precision behave?
                  </p>
                </div>
                <textarea
                  placeholder="Formulate your architectural solution..."
                  value={transferAnswer}
                  onChange={(e) => setTransferAnswer(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  rows={2}
                />
                <button
                  onClick={handleSaveTransfer}
                  disabled={transferAnswer.trim().length <= 10}
                  className="mt-1.5 rounded-lg bg-cyan-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition-colors"
                >
                  Submit Transfer Solution
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
