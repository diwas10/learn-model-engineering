'use client';

import React, { useState } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Layers, Sliders, CheckCircle2, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export default function TensorShapesLabPage() {
  const [batchSize, setBatchSize] = useState(2);
  const [seqLen, setSeqLen] = useState(16);
  const [numHeads, setNumHeads] = useState(8);
  const [headDim, setHeadDim] = useState(64);

  const dModel = numHeads * headDim;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Layers className="h-4 w-4" />
            <span>Cross-Cutting Laboratory: lab_shapes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tensor Shape Debugger & Einsum Algebra
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Trace dimensions [B, T, H, D] across forward and backward Transformer passes, validate broadcasting compatibility, and verify Einstein summation tensor contractions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Controls */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-bold text-white mb-4">Transformer Dimension Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">Batch ($B$): {batchSize}</span>
              <input
                type="range"
                min={1}
                max={16}
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Sequence ($T$): {seqLen}</span>
              <input
                type="range"
                min={4}
                max={128}
                step={4}
                value={seqLen}
                onChange={(e) => setSeqLen(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Heads ($H$): {numHeads}</span>
              <input
                type="range"
                min={1}
                max={32}
                value={numHeads}
                onChange={(e) => setNumHeads(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Head Dim ($D$): {headDim}</span>
              <input
                type="range"
                min={32}
                max={128}
                step={16}
                value={headDim}
                onChange={(e) => setHeadDim(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-cyan-400">
            {'Hidden Dimension d_model = H × D = '}{numHeads} × {headDim} = {dModel}
          </div>
        </div>

        {/* Step-by-Step Forward Pass Shapes */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="h-4 w-4 text-cyan-400" />
            Forward Pass Tensor Shape Trace
          </h3>

          <div className="space-y-3">
            {[
              {
                op: 'Input Token IDs',
                shape: `[B, T] = [${batchSize}, ${seqLen}]`,
                type: 'torch.int64',
                desc: 'Raw discrete vocabulary indices'
              },
              {
                op: 'Embedding Lookup (W_embed)',
                shape: `[B, T, d_model] = [${batchSize}, ${seqLen}, ${dModel}]`,
                type: 'torch.float32',
                desc: 'Token vectors projected into continuous vector space'
              },
              {
                op: 'Q, K, V Projections & Head Split',
                shape: `[B, H, T, D] = [${batchSize}, ${numHeads}, ${seqLen}, ${headDim}]`,
                type: 'torch.float32',
                desc: 'view(B, T, H, D).transpose(1, 2) for multi-head parallelism'
              },
              {
                op: 'Attention Scores (Q @ K.T)',
                shape: `[B, H, T, T] = [${batchSize}, ${numHeads}, ${seqLen}, ${seqLen}]`,
                type: 'torch.float32',
                desc: 'torch.einsum("b h i d, b h j d -> b h i j", Q, K)'
              },
              {
                op: 'Context Output (Attn @ V)',
                shape: `[B, H, T, D] = [${batchSize}, ${numHeads}, ${seqLen}, ${headDim}]`,
                type: 'torch.float32',
                desc: 'torch.einsum("b h i j, b h j d -> b h i d", Attn, V)'
              },
              {
                op: 'Concatenate Heads & Out Projection',
                shape: `[B, T, d_model] = [${batchSize}, ${seqLen}, ${dModel}]`,
                type: 'torch.float32',
                desc: 'transpose(1, 2).contiguous().view(B, T, d_model) @ W_out'
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 gap-2"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{step.op}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{step.desc}</div>
                </div>
                <div className="text-right">
                  <span className="rounded-lg bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
                    {step.shape}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">{step.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
