'use client';

import React, { useState } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Sparkles, Eye, Music, Film, Sliders, Layers } from 'lucide-react';

export default function MultimodalLabPage() {
  const [activeTab, setActiveTab] = useState<'vit' | 'audio' | 'cross_modal'>('vit');

  // ViT patch size
  const [patchSize, setPatchSize] = useState<16 | 32>(16);
  const imageRes = 224;
  const numPatches = (imageRes / patchSize) * (imageRes / patchSize);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Multimodal Engineering Laboratory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Vision, Audio & Multimodal Token Engineering
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Explore image patch tokenization in Vision Transformers (ViT), audio Mel-spectrogram processing, and cross-attention modality fusion in vision-language models.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'vit', label: '1. Vision Transformer (ViT) Patchification' },
              { id: 'audio', label: '2. Audio Mel-Spectrogram & Conformer' },
              { id: 'cross_modal', label: '3. Cross-Modal Attention & CLIP' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
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
        {/* TAB 1: VIT PATCHIFICATION */}
        {activeTab === 'vit' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">Patchification Geometry</h3>
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">Image Resolution: 224 x 224 x 3</span>
                    </div>
                    <div>
                      <span className="text-slate-300 block mb-1">Patch Size ($P \times P$):</span>
                      <div className="flex gap-2">
                        {[16, 32].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPatchSize(p as any)}
                            className={`rounded-lg px-3 py-1 font-mono font-bold transition-colors ${
                              patchSize === p
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {p} x {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-2 font-mono text-cyan-400">
                      Total Visual Tokens: {numPatches} + 1 [CLS] = {numPatches + 1}
                    </div>
                  </div>
                </div>

                <MathBlock
                  label="Linear Projection of Flattened Patches"
                  math={"\mathbf{z}_0 = [\mathbf{x}_{\text{class}}; \, \mathbf{x}_p^1 \mathbf{E}; \, \mathbf{x}_p^2 \mathbf{E}; \, \dots; \, \mathbf{x}_p^N \mathbf{E}] + \mathbf{E}_{\text{pos}}"}
                />
              </div>

              {/* Grid Visualizer */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 self-start">
                  2D Patch Grid Decomposition ({imageRes/patchSize} x {imageRes/patchSize} = {numPatches} tokens)
                </h3>

                <div
                  className="grid gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800"
                  style={{
                    gridTemplateColumns: `repeat(${imageRes / patchSize}, minmax(0, 1fr))`
                  }}
                >
                  {Array.from({ length: numPatches }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-7 w-7 sm:h-9 sm:w-9 rounded bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-rose-600/40 hover:to-indigo-600/40 border border-slate-800/80 flex items-center justify-center text-[9px] font-mono text-slate-500 hover:text-white transition-all cursor-pointer"
                    >
                      {idx}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO MEL-SPECTROGRAM */}
        {activeTab === 'audio' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Music className="h-4 w-4 text-rose-400" />
              Audio Feature Extraction: STFT & Mel-Filterbanks
            </h3>
            <p className="text-xs text-slate-400">
              Raw 1D 16kHz audio waveforms are converted into 2D time-frequency representations using the Short-Time Fourier Transform (STFT), followed by projection onto non-linear Mel-scale triangular filterbanks imitating human ear cochlear sensitivity.
            </p>

            <MathBlock
              label="Hertz to Mel Conversion"
              math={"m = 2595 \log_{10}\left(1 + \frac{f}{700}\right)"}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-500 block">Sample Rate</span>
                <span className="text-lg font-bold text-cyan-400">16,000 Hz</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-500 block">STFT Window (Hop Length)</span>
                <span className="text-lg font-bold text-indigo-400">25ms window (10ms hop)</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <span className="text-slate-500 block">Mel Channels (Token Dim)</span>
                <span className="text-lg font-bold text-rose-400">80 or 128 filterbanks</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CROSS-MODAL ATTENTION */}
        {activeTab === 'cross_modal' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Cross-Attention Modality Alignment (Vision-to-Language)</h3>
            <p className="text-xs text-slate-400">
              {'In vision-language models (e.g. LLaVA, Flamingo), language tokens serve as Query (Q), while visual patch embeddings serve as Key (K) and Value (V).'}
            </p>

            <MathBlock
              label="Cross-Modal Attention"
              math={"\mathbf{A}_{\text{cross}} = \text{Softmax}\left(\frac{\mathbf{Q}_{\text{text}} \mathbf{K}_{\text{vision}}^T}{\sqrt{d}}\right) \mathbf{V}_{\text{vision}}"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
