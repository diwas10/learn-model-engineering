'use client';

import React, { useState, useMemo } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Cpu, GitFork, Sliders, Database, Layers, ArrowRight, ShieldCheck, Scale } from 'lucide-react';

export default function ModelSurgeryLabPage() {
  const [activeTab, setActiveTab] = useState<'lora' | 'methods' | 'vocab' | 'merging'>('lora');

  // LoRA interactive params
  const [loraRank, setLoraRank] = useState(16);
  const [loraAlpha, setLoraAlpha] = useState(32);
  const [baseDim, setBaseDim] = useState(4096);
  const [numLayers, setNumLayers] = useState(32);
  const [quantization, setQuantization] = useState<'fp16' | 'int8' | 'nf4'>('fp16');

  // Vocabulary expansion params
  const [baseVocab, setBaseVocab] = useState(32000);
  const [addedTokens, setAddedTokens] = useState(1280);

  // Model Merging params
  const [mergeMethod, setMergeMethod] = useState<'slerp' | 'ties' | 'dare'>('slerp');
  const [mergeT, setMergeT] = useState(0.5);

  // Compute memory and parameter statistics
  const stats = useMemo(() => {
    // 7B model approximation
    const d = baseDim;
    const layers = numLayers;
    const r = loraRank;
    const alpha = loraAlpha;

    // Base parameters (approx 6.7B)
    const baseParams = layers * (4 * d * d + 3 * d * (8/3 * d)) + baseVocab * d;
    
    // Trainable LoRA params in Q, K, V, O and FFN
    // 4 attn projections * (2 * d * r) + 3 ffn * (2 * d * r)
    const loraParamsPerLayer = (4 * 2 * d * r) + (3 * 2 * d * r);
    const totalLoraParams = layers * loraParamsPerLayer;

    const bytesPerParam = quantization === 'fp16' ? 2 : quantization === 'int8' ? 1 : 0.5;
    const baseVramGb = (baseParams * bytesPerParam) / (1024**3);

    // LoRA weights + AdamW states (12 bytes/param)
    const loraVramMb = (totalLoraParams * 2) / (1024**2);
    const optimizerVramMb = (totalLoraParams * 12) / (1024**2);

    const fullFtVramGb = (baseParams * 16) / (1024**3);
    const loraTotalVramGb = baseVramGb + (optimizerVramMb / 1024) + 2.5; // +2.5GB activations

    const savingsFactor = fullFtVramGb / Math.max(loraTotalVramGb, 0.5);

    return {
      baseParams,
      totalLoraParams,
      pctTrainable: ((totalLoraParams / baseParams) * 100).toFixed(3),
      baseVramGb: baseVramGb.toFixed(1),
      loraVramMb: loraVramMb.toFixed(1),
      optimizerVramMb: optimizerVramMb.toFixed(1),
      loraTotalVramGb: loraTotalVramGb.toFixed(1),
      fullFtVramGb: fullFtVramGb.toFixed(1),
      savingsFactor: savingsFactor.toFixed(1),
      scalingFactor: (alpha / r).toFixed(2)
    };
  }, [loraRank, loraAlpha, baseDim, numLayers, quantization, baseVocab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <GitFork className="h-4 w-4" />
                <span>Flagship Laboratory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Model Surgery & Fine-Tuning Laboratory
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
                Explore parameter-efficient fine-tuning (LoRA, QLoRA), low-rank adaptation, parameter freezing vs trainable gradients, vocabulary expansion, layer widening, and non-destructive model merging.
              </p>
            </div>

            <div className="flex items-center space-x-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
              <span className="text-xs font-mono text-purple-300">
                {'Formula: W = W₀ + (α/r)(B × A)'}
              </span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'lora', label: '1. LoRA & QLoRA Mechanics' },
              { id: 'methods', label: '2. PEFT Methods Comparator' },
              { id: 'vocab', label: '3. Vocabulary Expansion' },
              { id: 'merging', label: '4. Model Merging (SLERP / TIES)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: LORA & QLORA */}
        {activeTab === 'lora' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-400" />
                    LoRA Hyperparameters
                  </h3>

                  {/* Rank slider */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>LoRA Rank ($r$):</span>
                      <span className="font-mono text-purple-400 font-bold">{loraRank}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={64}
                      step={2}
                      value={loraRank}
                      onChange={(e) => setLoraRank(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>2 (minimal)</span>
                      <span>16 (standard)</span>
                      <span>64 (high rank)</span>
                    </div>
                  </div>

                  {/* Alpha slider */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>LoRA Alpha ($\alpha$):</span>
                      <span className="font-mono text-purple-400 font-bold">{loraAlpha}</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={128}
                      step={8}
                      value={loraAlpha}
                      onChange={(e) => setLoraAlpha(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">
                      Scaling coefficient $\Delta W \times (\alpha / r) = {stats.scalingFactor}$
                    </div>
                  </div>

                  {/* Base Precision */}
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-300 font-medium block mb-2">Base Model Precision:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'fp16', label: 'FP16 (LoRA)' },
                        { id: 'int8', label: 'INT8 (LLM.int8())' },
                        { id: 'nf4', label: 'NF4 (QLoRA)' }
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setQuantization(p.id as any)}
                          className={`rounded-lg py-1.5 text-[11px] font-semibold transition-colors ${
                            quantization === p.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <MathBlock
                  label="LoRA Matrix Decomposition"
                  math={"W = W_0 + \frac{\alpha}{r} \cdot \mathbf{B}\mathbf{A}, \quad \mathbf{B} \in \mathbb{R}^{d \times r}, \, \mathbf{A} \in \mathbb{R}^{r \times k}"}
                />
              </div>

              {/* VRAM & Parameter Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Trainable Params</div>
                    <div className="mt-1 text-xl font-bold font-mono text-purple-400">
                      {(stats.totalLoraParams / 1e6).toFixed(1)} M
                    </div>
                    <div className="text-[11px] text-slate-400">{stats.pctTrainable}% of total</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">LoRA VRAM</div>
                    <div className="mt-1 text-xl font-bold font-mono text-cyan-400">
                      {stats.loraTotalVramGb} GB
                    </div>
                    <div className="text-[11px] text-emerald-400">Fits in single 24GB GPU</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Full Fine-Tune VRAM</div>
                    <div className="mt-1 text-xl font-bold font-mono text-rose-400">
                      {stats.fullFtVramGb} GB
                    </div>
                    <div className="text-[11px] text-slate-400">Requires multi-GPU cluster</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">VRAM Savings</div>
                    <div className="mt-1 text-xl font-bold font-mono text-emerald-400">
                      {stats.savingsFactor}x
                    </div>
                    <div className="text-[11px] text-slate-400">Memory efficiency</div>
                  </div>
                </div>

                {/* Visual Architecture Representation */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    Forward Pass Data Flow with Frozen vs Trainable Branches
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    {/* Input Token Vector */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Input $x$</div>
                      <div className="text-xs font-bold text-cyan-400">[1, 4096]</div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />

                    {/* Dual Path */}
                    <div className="flex-1 space-y-3">
                      {/* Frozen Path */}
                      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            Frozen
                          </span>
                          <span className="text-xs font-medium text-slate-300">
                            Base Weight $W_0 \cdot x$
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">No Gradients</span>
                      </div>

                      {/* Trainable LoRA Path */}
                      <div className="flex items-center justify-between rounded-lg border border-purple-500/40 bg-purple-950/20 p-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="rounded bg-purple-950 border border-purple-700/60 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                            Trainable
                          </span>
                          <span className="text-xs font-medium text-purple-200">
                            {'(α/r)(B · A · x) with rank r = '}{loraRank}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400">Active Gradients</span>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />

                    {/* Output Vector */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Output $h$</div>
                      <div className="text-xs font-bold text-emerald-400">[1, 4096]</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PEFT METHODS COMPARATOR */}
        {activeTab === 'methods' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">PEFT Adaptation Strategy Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="p-3">Method</th>
                    <th className="p-3">Trainable %</th>
                    <th className="p-3">Inference Overhead</th>
                    <th className="p-3">Mergeable into Base?</th>
                    <th className="p-3">Best Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="p-3 font-semibold text-purple-300">LoRA</td>
                    <td className="p-3 font-mono">0.05% - 0.5%</td>
                    <td className="p-3 text-emerald-400 font-semibold">Zero (post-merge)</td>
                    <td className="p-3 text-emerald-400">Yes ($W = W_0 + \Delta W$)</td>
                    <td className="p-3 text-slate-300">Domain adaptation, instruction tuning</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-cyan-300">QLoRA</td>
                    <td className="p-3 font-mono">0.05% - 0.5%</td>
                    <td className="p-3 text-emerald-400 font-semibold">Zero (post-merge)</td>
                    <td className="p-3 text-emerald-400">Yes (dequantize & merge)</td>
                    <td className="p-3 text-slate-300">Fine-tuning 70B models on single consumer GPU</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-amber-300">Prefix Tuning</td>
                    <td className="p-3 font-mono">0.1% - 1.0%</td>
                    <td className="p-3 text-amber-400">Consumes sequence context</td>
                    <td className="p-3 text-rose-400">No (prepended virtual tokens)</td>
                    <td className="p-3 text-slate-300">NLG, translation, multi-task conditioning</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-rose-300">Full Fine-Tuning</td>
                    <td className="p-3 font-mono">100.0%</td>
                    <td className="p-3 text-emerald-400">Zero</td>
                    <td className="p-3 text-slate-400">Native</td>
                    <td className="p-3 text-slate-300">Fundamental behavioral/language shift</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VOCABULARY EXPANSION */}
        {activeTab === 'vocab' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              Tokenizer Vocabulary Expansion & Embedding Resizing
            </h3>
            <p className="text-xs text-slate-400">
              {'When adding new languages or domain-specific tokens (e.g. medical or code tokens), we expand the tokenizer and resize the embedding matrix E ∈ ℝ^(V × d) and LM head from V_old to V_new.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-xs font-semibold text-slate-300 block mb-2">Original Vocabulary</span>
                <div className="text-xl font-bold font-mono text-cyan-400">{baseVocab.toLocaleString()} tokens</div>
                <div className="text-xs text-slate-500 mt-1">Embedding size: {(baseVocab * 4096 * 2 / 1024**2).toFixed(1)} MB (FP16)</div>
              </div>

              <div className="rounded-xl border border-purple-500/40 bg-purple-950/20 p-4">
                <span className="text-xs font-semibold text-purple-300 block mb-2">Expanded Vocabulary (+{addedTokens})</span>
                <div className="text-xl font-bold font-mono text-purple-400">{(baseVocab + addedTokens).toLocaleString()} tokens</div>
                <div className="text-xs text-slate-400 mt-1">New rows initialized via mean embeddings or noise vector</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MODEL MERGING */}
        {activeTab === 'merging' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-400" />
              Weight Merging without Retraining
            </h3>
            <p className="text-xs text-slate-400">
              Model merging combines fine-tuned checkpoints of identical base architectures into a single unified checkpoint without incurring additional compute or parameter footprint.
            </p>

            <div className="flex gap-2">
              {[
                { id: 'slerp', label: 'SLERP (Spherical Linear Interpolation)' },
                { id: 'ties', label: 'TIES (Trim, Elect Sign, Merge)' },
                { id: 'dare', label: 'DARE (Drop And REscale)' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMergeMethod(m.id as any)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                    mergeMethod === m.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <MathBlock
              label={mergeMethod === 'slerp' ? 'SLERP Formulation' : 'TIES Formulation'}
              math={
                mergeMethod === 'slerp'
                  ? "\\mathbf{W}_{\\text{merged}} = \\frac{\\sin((1-t)\\theta)}{\\sin\\theta} \\mathbf{W}_1 + \\frac{\\sin(t\\theta)}{\\sin\\theta} \\mathbf{W}_2, \\quad \\theta = \\arccos\\left(\\frac{\\mathbf{W}_1 \\cdot \\mathbf{W}_2}{\\|\\mathbf{W}_1\\| \\|\\mathbf{W}_2\\|}\\right)"
                  : "\\mathbf{W}_{\\text{merged}} = \\mathbf{W}_0 + \\lambda \\sum_{k} \\text{Trim}_{p}(\\Delta \\mathbf{W}_k) \\odot \\text{SignConsensus}"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
