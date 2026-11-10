'use client';

import React, { useState } from 'react';
import { Sparkles, X, Lightbulb, GitCompare, Code, BookOpen, Send, Bot } from 'lucide-react';
import { Lesson } from '@/types/curriculum';
import { MathView } from './MathView';

interface AITutorDrawerProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({ lesson, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'intuition' | 'hints' | 'compare' | 'chat'>('intuition');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'tutor'; text: string }[]>([
    {
      sender: 'tutor',
      text: `Hello! I am your AI Model Engineering Research Tutor. I can help you with deep mathematical derivations, tensor shape analysis, or debugging implementations for **${lesson.title}**. What would you like to explore?`
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/tutor/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lesson.id,
          learner_query: userMsg,
          depth_level: 'deep'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory((prev) => [
          ...prev,
          { sender: 'tutor', text: data.explanation }
        ]);
      } else {
        throw new Error('Backend offline');
      }
    } catch {
      // Pedagogical contextual fallback
      let reply = `Regarding "${userMsg}" in the context of **${lesson.title}**:\n\n`;
      reply += `1. **Computational Mechanism**: The forward pass relies on ${lesson.learning_objectives[0] || 'matrix transformations'}.\n`;
      reply += `2. **Gradient Flow**: When backpropagating through this layer, monitor the Jacobian determinant. If eigenvalues are < 1, vanishing gradients can occur across deep blocks.\n`;
      reply += `3. **Production Recommendation**: Ensure numeric stability under BF16 by keeping layer normalizations in FP32 before residual addition.`;

      setChatHistory((prev) => [...prev, { sender: 'tutor', text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              AI Engineering Research Tutor
              <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 border border-indigo-800/40">
                Context-Aware
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
              {lesson.id}: {lesson.title}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
        {[
          { id: 'intuition', label: 'Intuition', icon: BookOpen },
          { id: 'hints', label: 'Progressive Hints', icon: Lightbulb },
          { id: 'compare', label: 'Tradeoffs', icon: GitCompare },
          { id: 'chat', label: 'Tutor Chat', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'intuition' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-3">
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] block mb-1">
                Core Problem Solved
              </span>
              <p className="leading-relaxed">
                {lesson.learning_objectives[0] || 'Provides fundamental computational building block.'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-white block mb-1 text-xs">
                Key Mathematical Connection
              </span>
              <p className="text-slate-400 leading-relaxed">
                {lesson.math_connections[0] || 'Tied to multivariable calculus, matrix projections, and numerical stability.'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="font-semibold text-indigo-300 block mb-1 text-[10px] uppercase tracking-wider">
                Derivation Anchor
              </span>
              <MathView
                math={"\\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{W}} = \\mathbf{x}^T \\cdot \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{y}}"}
                block={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: 'Shape Analysis',
                text: 'Write out the input and output tensor dimensions explicitly before touching implementation.'
              },
              {
                step: 2,
                title: 'Numerical Safeguard',
                text: 'Always check if any denominator or exponent could overflow in FP16/BF16. Use log-sum-exp or epsilon terms.'
              },
              {
                step: 3,
                title: 'Vectorized Einsum',
                text: 'Verify if loop contractions can be expressed with torch.einsum for IO memory efficiency.'
              },
              {
                step: 4,
                title: 'Edge Case Verification',
                text: 'Test behavior with zero-length padding tokens, single-element batches, or sequence length = 1.'
              }
            ].map((h) => (
              <div key={h.step} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                    {h.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{h.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-7">{h.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="space-y-3 text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="font-semibold text-amber-400 mb-1">Time vs Memory Complexity</div>
              <p className="text-slate-400">
                Consider whether the operation is compute-bound (GEMM matrix multiply) or memory-bandwidth bound (elementwise activations, LayerNorm, Softmax).
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="font-semibold text-emerald-400 mb-1">Architectural Alternatives</div>
              <p className="text-slate-400">
                Compare vanilla implementation against modern fused kernels (FlashAttention, Triton kernels) which keep tensors in fast SRAM rather than HBM.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-3">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 text-xs ${
                  msg.sender === 'user'
                    ? 'ml-6 bg-cyan-950/60 text-cyan-200 border border-cyan-800/40'
                    : 'mr-6 bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {msg.sender === 'user' ? 'Learner' : 'Research Tutor'}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="rounded-xl p-3 text-xs bg-slate-950 border border-slate-800 text-slate-400 animate-pulse">
                Thinking and deriving response...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      {activeTab === 'chat' && (
        <div className="border-t border-slate-800 p-3 bg-slate-950 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask anything about this concept..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !chatInput.trim()}
            className="rounded-xl bg-cyan-600 p-2 text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
