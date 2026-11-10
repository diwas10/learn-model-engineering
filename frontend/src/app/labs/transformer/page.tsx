'use client';

import React, { useState, useMemo } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Cpu, Layers, Sparkles, Sliders, Play, RefreshCw, Eye, ArrowRight, Database } from 'lucide-react';

export default function TransformerLabPage() {
  const [activeSection, setActiveSection] = useState<'attention' | 'rope' | 'gqa' | 'kv_gen' | 'moe'>('attention');
  
  // Attention state
  const [temperature, setTemperature] = useState(1.0);
  const [causalMask, setCausalMask] = useState(true);
  const [tokens, setTokens] = useState(['The', 'model', 'learns', 'deep', 'representations']);
  
  // KV Generation state
  const [genStep, setGenStep] = useState(0);
  const [promptTokens] = useState(['AI', 'systems', 'require']);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>(['efficient', 'tensor', 'kernels']);

  // RoPE state
  const [ropeDim, setRopeDim] = useState(64);
  const [ropeBase, setRopeBase] = useState(10000);
  const [posIndex, setPosIndex] = useState(3);

  // GQA state
  const [numHeads, setNumHeads] = useState(32);
  const [numKvHeads, setNumKvHeads] = useState(8);

  // Compute attention matrix dynamically
  const attentionMatrix = useMemo(() => {
    const N = tokens.length;
    const scores: number[][] = [];
    for (let i = 0; i < N; i++) {
      const row: number[] = [];
      for (let j = 0; j < N; j++) {
        if (causalMask && j > i) {
          row.push(-Infinity);
        } else {
          // Synthetic deterministic dot product based on token semantic distance
          const raw = Math.cos((i - j) * 0.8) * 2.2 + (i === j ? 1.5 : 0.2);
          row.push(raw / Math.max(temperature, 0.1));
        }
      }
      scores.push(row);
    }

    // Softmax per row
    return scores.map((row) => {
      const valid = row.filter((v) => v !== -Infinity);
      if (valid.length === 0) return row.map(() => 0);
      const maxVal = Math.max(...valid);
      const exps = row.map((v) => (v === -Infinity ? 0 : Math.exp(v - maxVal)));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map((v) => (sum > 0 ? v / sum : 0));
    });
  }, [tokens, causalMask, temperature]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Flagship Laboratory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Transformer Architecture Laboratory
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
                Inspect, modify, and simulate the mathematical engines powering modern Large Language Models: Scaled Dot-Product Attention, Rotary Position Embeddings (RoPE), Grouped-Query Attention (GQA), KV Caching, and Mixture-of-Experts (MoE).
              </p>
            </div>

            <div className="flex items-center space-x-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
              <span className="text-xs font-mono text-cyan-300">Tensor Flow: [B, T, H, D]</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'attention', label: '1. Scaled Dot-Product Attention' },
              { id: 'rope', label: '2. RoPE Rotary Encodings' },
              { id: 'gqa', label: '3. MHA vs MQA vs GQA' },
              { id: 'kv_gen', label: '4. Autoregressive KV Cache' },
              { id: 'moe', label: '5. Mixture of Experts (MoE)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeSection === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
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
        {/* SECTION 1: ATTENTION PLAYGROUND */}
        {activeSection === 'attention' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Controls & Math */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    Attention Controls
                  </h3>
                  
                  {/* Temperature slider */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Softmax Temperature ($T$):</span>
                      <span className="font-mono text-cyan-400">{temperature.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={3.0}
                      step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      Lower temperature concentrates attention on top keys; higher temperature diffuses weights uniformly.
                    </div>
                  </div>

                  {/* Causal Mask Toggle */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <span className="text-xs text-slate-300 font-medium">Causal Auto-regressive Mask:</span>
                    <button
                      onClick={() => setCausalMask(!causalMask)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                        causalMask
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {causalMask ? 'Enabled (Decoder)' : 'Disabled (Encoder)'}
                    </button>
                  </div>
                </div>

                {/* Mathematical Equation */}
                <MathBlock
                  label="Scaled Dot-Product Equation"
                  math={"\mathbf{A} = \text{Softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}} + \mathbf{M}\right)\mathbf{V}"}
                />

                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-200">{'Why scale by 1 / sqrt(d_k)?'}</div>
                  <p>
                    {'For independent components with zero mean and unit variance, the dot product q · k has variance equal to d_k. For large dimensions (e.g. d_k = 128), variance is 128 and magnitude grows, pushing softmax into extreme saturation regions with tiny gradients (< 10⁻⁶). Dividing by sqrt(d_k) normalizes the variance back to 1.'}
                  </p>
                </div>
              </div>

              {/* Heatmap & Matrix View */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span>Attention Weight Matrix A ∈ ℝ^(T × T)</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Tokens: {tokens.length} | Causal: {causalMask ? 'True' : 'False'}
                  </span>
                </div>

                {/* Interactive Heatmap Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 text-left text-xs font-mono text-slate-500">Query \ Key</th>
                        {tokens.map((tok, j) => (
                          <th key={j} className="p-2 text-center text-xs font-mono text-cyan-300">
                            {tok}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attentionMatrix.map((row, i) => (
                        <tr key={i} className="border-t border-slate-800/60">
                          <td className="p-2 text-xs font-mono font-medium text-indigo-300">
                            {tokens[i]}
                          </td>
                          {row.map((weight, j) => {
                            const isMasked = causalMask && j > i;
                            const intensity = isMasked ? 0 : weight;
                            return (
                              <td
                                key={j}
                                className="p-2 text-center transition-colors"
                                style={{
                                  backgroundColor: isMasked
                                    ? 'rgba(15, 23, 42, 0.4)'
                                    : `rgba(6, 182, 212, ${Math.max(intensity * 0.9, 0.05)})`
                                }}
                              >
                                <span className={`font-mono text-xs ${isMasked ? 'text-slate-600' : 'text-white font-semibold'}`}>
                                  {isMasked ? '-inf' : weight.toFixed(3)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block h-3 w-3 rounded bg-cyan-500/80" />
                    <span>{'High Attention (> 0.5)'}</span>
                    <span className="inline-block h-3 w-3 rounded bg-cyan-950 border border-cyan-800 ml-3" />
                    <span>{'Low Attention (< 0.1)'}</span>
                  </div>
                  <span className="text-emerald-400 font-mono">{'Row sums ∑_j A_ij = 1.000'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: ROPE ROTARY ENCODINGS */}
        {activeSection === 'rope' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">RoPE Configuration</h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Position Index ($m$):</span>
                        <span className="font-mono text-cyan-400">{posIndex}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        step={1}
                        value={posIndex}
                        onChange={(e) => setPosIndex(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Base Wavelength ($\theta$ base):</span>
                        <span className="font-mono text-cyan-400">{ropeBase}</span>
                      </div>
                      <select
                        value={ropeBase}
                        onChange={(e) => setRopeBase(parseInt(e.target.value))}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white"
                      >
                        <option value={10000}>10,000 (Standard LLaMA)</option>
                        <option value={500000}>500,000 (LLaMA 3 Extended Context)</option>
                        <option value={1000000}>1,000,000 (1M Context)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <MathBlock
                  label="2D Rotary Embedding Matrix"
                  math={"\mathbf{R}_{\Theta, m}^{2d} = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix}"}
                />
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="text-sm font-bold text-white mb-2">Complex Plane Phase Rotation</h3>
                <p className="text-xs text-slate-400 mb-4">
                  {'RoPE pairs consecutive hidden dimensions (x_2i, x_2i+1) and rotates them by angle m·θ_i in the 2D plane. The inner product ⟨R_m q, R_n k⟩ depends strictly on relative token distance (m - n).'}
                </p>

                {/* Visual rotation coordinates */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((pairIdx) => {
                    const theta_i = Math.pow(ropeBase, -2 * pairIdx / ropeDim);
                    const angleRad = posIndex * theta_i;
                    const cosVal = Math.cos(angleRad);
                    const sinVal = Math.sin(angleRad);
                    return (
                      <div key={pairIdx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                        <div className="text-[10px] font-mono text-cyan-400 uppercase">
                          Pair ({2 * pairIdx}, {2 * pairIdx + 1})
                        </div>
                        <div className="my-2 h-20 w-20 mx-auto relative rounded-full border border-slate-800 flex items-center justify-center">
                          {/* Unit circle axis */}
                          <div className="absolute inset-x-0 h-px bg-slate-800" />
                          <div className="absolute inset-y-0 w-px bg-slate-800" />
                          {/* Rotated vector line */}
                          <div
                            className="absolute h-0.5 w-8 bg-gradient-to-r from-cyan-500 to-indigo-500 origin-left"
                            style={{
                              transform: `rotate(${-angleRad * (180 / Math.PI)}deg)`
                            }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-slate-300">
                          θ = {(angleRad % (2 * Math.PI)).toFixed(2)} rad
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: MHA VS MQA VS GQA */}
        {activeSection === 'gqa' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="text-xs font-mono font-semibold text-rose-400 uppercase mb-1">
                  Multi-Head Attention (MHA)
                </div>
                <div className="text-sm font-bold text-white mb-2">32 Query : 32 KV Heads</div>
                <p className="text-xs text-slate-400 mb-4">
                  Every query head has its own private Key and Value head. Maximum expressiveness, but KV cache memory scales linearly with head count.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  KV Memory: <span className="text-rose-400">100% (Baseline)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/20 p-5 shadow-lg">
                <div className="text-xs font-mono font-semibold text-cyan-400 uppercase mb-1">
                  Grouped-Query Attention (GQA)
                </div>
                <div className="text-sm font-bold text-white mb-2">32 Query : 8 KV Heads</div>
                <p className="text-xs text-slate-300 mb-4">
                  Groups of 4 query heads share 1 KV head (e.g. LLaMA 3, Mistral). Recovers ~99% of MHA accuracy with 4x-8x smaller KV cache footprint!
                </p>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  KV Memory: <span className="text-cyan-400 font-bold">25% (4x Reduction)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="text-xs font-mono font-semibold text-emerald-400 uppercase mb-1">
                  Multi-Query Attention (MQA)
                </div>
                <div className="text-sm font-bold text-white mb-2">32 Query : 1 KV Head</div>
                <p className="text-xs text-slate-400 mb-4">
                  All 32 query heads share a single KV head. Minimal memory usage, but can degrade quality on complex reasoning tasks.
                </p>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-300">
                  KV Memory: <span className="text-emerald-400">3.1% (32x Reduction)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: KV CACHE AUTOREGRESSIVE GENERATION */}
        {activeSection === 'kv_gen' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  KV Cache Step-by-Step Generation Tracing
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Without KV cache, generation is $O(N^2)$ in compute because every token recomputes keys and values for all previous tokens. With KV cache, each new token computes only 1 new query vector ($O(1)$ new computations).
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGenStep((prev) => Math.min(generatedTokens.length, prev + 1))}
                  disabled={genStep >= generatedTokens.length}
                  className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Generate Next Token</span>
                </button>
                <button
                  onClick={() => setGenStep(0)}
                  className="rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Sequence Stream */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-[10px] uppercase font-semibold text-slate-500 mb-2">
                Active Sequence Stream
              </div>
              <div className="flex flex-wrap gap-2">
                {promptTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-1 text-xs font-mono text-indigo-300"
                  >
                    {t}
                  </span>
                ))}
                {generatedTokens.slice(0, genStep).map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 text-xs font-mono text-emerald-300 animate-in fade-in"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* KV Cache Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Cached Tensors in GPU SRAM / HBM
                </span>
                <span className="text-cyan-400 text-xs">
                  Cached Tokens: {promptTokens.length + genStep}
                </span>
              </div>
              <div className="space-y-1">
                {[...promptTokens, ...generatedTokens.slice(0, genStep)].map((tok, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900">
                    <span className="text-indigo-400">Token[{i}]: &quot;{tok}&quot;</span>
                    <span className="text-slate-500 text-[11px]">
                      K_cache[{i}]: [32 heads, 128 dim] | V_cache[{i}]: [32 heads, 128 dim]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: MIXTURE OF EXPERTS (MOE) */}
        {activeSection === 'moe' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              Sparse Mixture of Experts (MoE) Routing Architecture
            </h3>
            <p className="text-xs text-slate-400">
              In an MoE layer (e.g. Mixtral 8x7B), feed-forward networks are replaced by $N$ parallel experts. A lightweight router computes gating logits $H(x) = x \cdot W_g$, applies Softmax, and dispatches each token to the Top-$k$ experts (typically $k=2$).
            </p>

            <MathBlock
              label="MoE Output Formulation"
              math={"y = \sum_{i \in \text{Top-}k} \text{Softmax}(\text{Top-}k(x \cdot W_g))_i \cdot \text{Expert}_i(x)"}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((expId) => {
                const isActive = expId === 2 || expId === 6;
                return (
                  <div
                    key={expId}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      isActive
                        ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/20'
                        : 'border-slate-800 bg-slate-950 opacity-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Expert {expId}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {isActive ? (
                        <span className="text-purple-300 font-semibold">
                          Active (Weight: {expId === 2 ? '0.68' : '0.32'})
                        </span>
                      ) : (
                        'Inactive (Frozen)'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
