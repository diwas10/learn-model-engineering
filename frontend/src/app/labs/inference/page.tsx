'use client';

import React, { useState, useMemo } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Cpu, Gauge, Database, Zap, Sliders, ArrowRight } from 'lucide-react';

export default function InferenceLabPage() {
  const [activeTab, setActiveTab] = useState<'kv_calc' | 'prefill_decode' | 'quant' | 'speculative'>('kv_calc');

  // KV Cache calculation params
  const [batchSize, setBatchSize] = useState(4);
  const [seqLen, setSeqLen] = useState(4096);
  const [numLayers, setNumLayers] = useState(32);
  const [numKvHeads, setNumKvHeads] = useState(8); // GQA
  const [headDim, setHeadDim] = useState(128);
  const [kvPrecision, setKvPrecision] = useState<'fp16' | 'fp8' | 'int4'>('fp16');

  // Speculative decoding params
  const [draftLen, setDraftLen] = useState(4);
  const [acceptanceRate, setAcceptanceRate] = useState(0.75); // alpha

  // Compute KV cache stats
  const kvStats = useMemo(() => {
    const bytesPerParam = kvPrecision === 'fp16' ? 2 : kvPrecision === 'fp8' ? 1 : 0.5;
    // Formula: 2 (K & V) * layers * kv_heads * head_dim * bytes * seq_len * batch
    const bytesPerToken = 2 * numLayers * numKvHeads * headDim * bytesPerParam;
    const totalBytes = bytesPerToken * seqLen * batchSize;
    const totalGb = totalBytes / (1024**3);
    const mbPerSeq = (bytesPerToken * seqLen) / (1024**2);

    return {
      bytesPerToken,
      totalGb: totalGb.toFixed(2),
      mbPerSeq: mbPerSeq.toFixed(1)
    };
  }, [batchSize, seqLen, numLayers, numKvHeads, headDim, kvPrecision]);

  // Speculative decoding speedup formula
  // Speedup = (1 + alpha * K) / (1 + K * (c_draft / c_target))
  const specSpeedup = useMemo(() => {
    const costRatio = 0.15; // draft model is ~15% cost of target model
    const num = 1 + acceptanceRate * draftLen;
    const den = 1 + draftLen * costRatio;
    return (num / den).toFixed(2);
  }, [draftLen, acceptanceRate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Gauge className="h-4 w-4" />
            <span>AI Systems & Inference Laboratory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            LLM Inference Systems & KV Profiler
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Analyze memory bandwidth saturation, prefill vs decode dynamics, KV cache footprints under GQA, quantization tradeoffs, and speculative decoding acceleration.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'kv_calc', label: '1. KV Cache Memory Profiler' },
              { id: 'prefill_decode', label: '2. Prefill vs Decode Dynamics' },
              { id: 'quant', label: '3. Quantization Studio (INT8 / INT4 / AWQ)' },
              { id: 'speculative', label: '4. Speculative Decoding Simulator' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: KV CACHE PROFILER */}
        {activeTab === 'kv_calc' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">Workload Dimensions</h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Concurrent Batch Size ($B$):</span>
                        <span className="font-mono text-amber-400 font-bold">{batchSize}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={64}
                        step={1}
                        value={batchSize}
                        onChange={(e) => setBatchSize(parseInt(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Sequence Length ($T$):</span>
                        <span className="font-mono text-amber-400 font-bold">{seqLen.toLocaleString()} tokens</span>
                      </div>
                      <input
                        type="range"
                        min={512}
                        max={32768}
                        step={512}
                        value={seqLen}
                        onChange={(e) => setSeqLen(parseInt(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    <div>
                      <span className="text-slate-300 block mb-1">KV Cache Precision:</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'fp16', label: 'FP16 (2B)' },
                          { id: 'fp8', label: 'FP8 (1B)' },
                          { id: 'int4', label: 'INT4 (0.5B)' }
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setKvPrecision(p.id as any)}
                            className={`rounded-lg py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                              kvPrecision === p.id
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <MathBlock
                  label="KV Cache Memory Formula"
                  math={"\text{Memory}_{\text{KV}} = 2 \times n_{\text{layers}} \times n_{\text{kv\_heads}} \times d_{\text{head}} \times \text{bytes} \times T \times B"}
                />
              </div>

              {/* Stats & Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">Total KV Cache VRAM</span>
                    <div className="mt-1 text-2xl font-bold font-mono text-amber-400">{kvStats.totalGb} GB</div>
                    <div className="text-xs text-slate-400 mt-1">Required dedicated GPU cache</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">Per-Sequence Memory</span>
                    <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">{kvStats.mbPerSeq} MB</div>
                    <div className="text-xs text-slate-400 mt-1">Per active stream at {seqLen} tokens</div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-500">Bytes per Token</span>
                    <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">{kvStats.bytesPerToken} B</div>
                    <div className="text-xs text-slate-400 mt-1">Across all {numLayers} layers</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    GPU Hardware Sizing Assessment
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2">
                    <p>
                      On an NVIDIA H100 SXM5 (80GB HBM3, 3.35 TB/s memory bandwidth):
                    </p>
                    <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs space-y-1">
                      <div className="text-slate-400">70B Model Weights (FP16): ~140 GB (Requires 2x H100 TP=2)</div>
                      <div className="text-amber-400">Current KV Cache Allocation: {kvStats.totalGb} GB</div>
                      <div className="text-emerald-400">Max concurrent users supported: ~{Math.floor(40 / Math.max(parseFloat(kvStats.mbPerSeq)/1024, 0.01))} streams</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PREFILL VS DECODE */}
        {activeTab === 'prefill_decode' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Prefill (Time To First Token) vs Decode (Time Per Output Token)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/20 p-5">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase block mb-1">
                  Phase 1: Prefill (Context Phase)
                </span>
                <div className="text-sm font-bold text-white mb-2">Compute-Bound (GEMM)</div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  {'The model processes all input prompt tokens simultaneously. The matrix multiplication Q·K^T has dimensions (T × d) × (d × T), yielding high arithmetic intensity (FLOP/byte >> 100). Tensor cores achieve maximum occupancy.'}
                </p>
                <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-cyan-300">
                  Bottleneck: TFLOPS (Compute capability)
                </div>
              </div>

              <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-5">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase block mb-1">
                  Phase 2: Decode (Generation Phase)
                </span>
                <div className="text-sm font-bold text-white mb-2">Memory-Bandwidth Bound (GEMV)</div>
                <p className="text-slate-300 leading-relaxed mb-3">
                  Tokens are generated one by one. For each single token, all model weights ($6.7 \times 10^9$ bytes for 7B) and entire KV history must be fetched from HBM into SRAM to perform a matrix-vector product.
                </p>
                <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-amber-300">
                  Bottleneck: HBM Memory Bandwidth (TB/s)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUANTIZATION */}
        {activeTab === 'quant' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Weight-Only Quantization (AWQ vs GPTQ)</h3>
            <p className="text-xs text-slate-400">
              In decode-bound LLMs, memory bandwidth limits generation speed. Quantizing weights from FP16 to INT4 reduces memory transfer by 4x, directly translating to a ~3.2x speedup in token generation throughput!
            </p>

            <MathBlock
              label="Affine Quantization Formula"
              math={"q = \text{clip}\left(\left\lfloor \frac{w}{s} \right\rceil + z, \, 0, \, 2^b - 1\right), \quad s = \frac{w_{\max} - w_{\min}}{2^b - 1}"}
            />
          </div>
        )}

        {/* TAB 4: SPECULATIVE DECODING */}
        {activeTab === 'speculative' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Speculative Decoding Latency Acceleration</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A small draft model (e.g. 1B) autoregressively produces $K$ candidate tokens rapidly; the large target model (e.g. 70B) validates all $K$ candidates in parallel with a single forward pass.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Theoretical Speedup</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{specSpeedup}x</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-slate-300 block mb-1">Draft Tokens per Step ($K$): {draftLen}</span>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={draftLen}
                  onChange={(e) => setDraftLen(parseInt(e.target.value))}
                  className="w-full accent-amber-400 mb-4"
                />

                <span className="text-slate-300 block mb-1">Target Acceptance Rate ($\alpha$): {(acceptanceRate * 100).toFixed(0)}%</span>
                <input
                  type="range"
                  min={0.3}
                  max={0.95}
                  step={0.05}
                  value={acceptanceRate}
                  onChange={(e) => setAcceptanceRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-center">
                <span className="font-semibold text-white mb-2">Acceptance Criterion:</span>
                <p className="text-slate-400 leading-relaxed font-mono">
                  {'Token accepted if: random_uniform() < min(1, P_target(x) / P_draft(x))'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
