'use client';

import React, { useState } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Cpu, Activity, Sliders, Layers, Zap } from 'lucide-react';

export default function NeuralNetworksLabPage() {
  const [activeTab, setActiveTab] = useState<'activations' | 'init' | 'residuals' | 'norm'>('activations');
  const [inputValue, setInputValue] = useState(0.5);
  const [initScheme, setInitScheme] = useState<'kaiming' | 'xavier' | 'normal'>('kaiming');

  // Activation function computations
  const x = inputValue;
  const relu = Math.max(0, x);
  const d_relu = x > 0 ? 1 : 0;

  // GELU approximation: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
  const gelu_inner = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3));
  const gelu = 0.5 * x * (1 + Math.tanh(gelu_inner));

  // SiLU (Swish-1): x * sigmoid(x)
  const sigmoid = 1 / (1 + Math.exp(-x));
  const silu = x * sigmoid;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Cpu className="h-4 w-4" />
            <span>Core Deep Learning Laboratory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Neural Network Dynamics & Autograd
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Analyze forward and backward dynamics: activation non-linearities, weight initialization variance preservation, residual gradient highways, and normalization layers.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'activations', label: '1. Activations Studio (ReLU, GELU, SiLU, SwiGLU)' },
              { id: 'init', label: '2. Weight Initialization & Variance' },
              { id: 'residuals', label: '3. Residual Gradient Highways' },
              { id: 'norm', label: '4. LayerNorm vs RMSNorm' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
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
        {/* TAB 1: ACTIVATIONS */}
        {activeTab === 'activations' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">Live Activation Input</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Input value ($x$):</span>
                      <span className="font-mono text-emerald-400 font-bold">{inputValue.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={-4.0}
                      max={4.0}
                      step={0.1}
                      value={inputValue}
                      onChange={(e) => setInputValue(parseFloat(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>

                <MathBlock
                  label="GELU Activation Formulation"
                  math={"\text{GELU}(x) = x \Phi(x) = x \cdot P(X \le x) \approx 0.5x \left(1 + \tanh\left(\sqrt{\frac{2}{\pi}} (x + 0.044715 x^3)\right)\right)"}
                />
              </div>

              {/* Comparison Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">ReLU</span>
                  <div className="mt-2 text-2xl font-bold font-mono text-white">{relu.toFixed(3)}</div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">Derivative: {d_relu}</div>
                  <p className="text-xs text-slate-500 mt-3">Dying ReLU problem if $x \le 0$ as gradient is identically 0.</p>
                </div>

                <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/20 p-5">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400">GELU (Gaussian Error Linear Unit)</span>
                  <div className="mt-2 text-2xl font-bold font-mono text-emerald-300">{gelu.toFixed(3)}</div>
                  <div className="text-xs text-emerald-400/80 mt-2 font-mono">Non-zero negative gradient</div>
                  <p className="text-xs text-slate-400 mt-3">Smooth non-monotonic curvature, standard in GPT-2, GPT-3, BERT.</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                  <span className="text-[10px] uppercase font-semibold text-cyan-400">SiLU / Swish ($x \cdot \sigma(x)$)</span>
                  <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">{silu.toFixed(3)}</div>
                  <div className="text-xs text-cyan-400/80 mt-2 font-mono">Self-gated non-linearity</div>
                  <p className="text-xs text-slate-500 mt-3">Used extensively in LLaMA SwiGLU feed-forward networks.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEIGHT INITIALIZATION */}
        {activeTab === 'init' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Variance Preservation Across Deep Layers</h3>
                <p className="text-xs text-slate-400 mt-1">
                  If weights are initialized with too high variance, activations explode exponentially with depth; if too low, activations vanish to zero.
                </p>
              </div>

              <div className="flex gap-2">
                {[
                  { id: 'kaiming', label: 'Kaiming / He (for ReLU)' },
                  { id: 'xavier', label: 'Xavier / Glorot (for Tanh)' },
                  { id: 'normal', label: 'Naive Normal $\mathcal{N}(0, 1)$' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setInitScheme(s.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                      initScheme === s.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <MathBlock
              label={initScheme === 'kaiming' ? 'Kaiming He Normal Variance' : 'Xavier Glorot Variance'}
              math={
                initScheme === 'kaiming'
                  ? "\\text{Var}(W) = \\frac{2}{n_{\\text{in}}}"
                  : "\\text{Var}(W) = \\frac{2}{n_{\\text{in}} + n_{\\text{out}}}"
              }
            />

            {/* Layer Variance Chart Simulation */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((layer) => {
                const variance =
                  initScheme === 'kaiming'
                    ? 1.0 + (Math.sin(layer) * 0.05)
                    : initScheme === 'xavier'
                    ? Math.pow(0.85, layer)
                    : Math.pow(1.8, layer);

                return (
                  <div key={layer} className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-center">
                    <span className="text-[10px] font-mono text-slate-500">L{layer}</span>
                    <div className="mt-1 text-xs font-mono font-bold text-emerald-400">
                      {variance > 100 ? '>100 (Exploded)' : variance < 0.01 ? '<0.01 (Vanished)' : variance.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RESIDUALS */}
        {activeTab === 'residuals' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Residual Connections & Gradient Highway
            </h3>
            <p className="text-xs text-slate-400">
              {'Residual skip connections x_{l+1} = x_l + F(x_l) create an unimpeded gradient highway: the identity term guarantees that gradients can flow from layer L directly to layer l without vanishing through successive weight matrix multiplications.'}
            </p>

            <MathBlock
              label="Residual Gradient Propagation Highway"
              math={"\frac{\partial \mathcal{L}}{\partial x_l} = \frac{\partial \mathcal{L}}{\partial x_L} \left( \mathbf{I} + \frac{\partial}{\partial x_l} \sum_{i=l}^{L-1} F(x_i, W_i) \right)"}
            />
          </div>
        )}

        {/* TAB 4: NORMALIZATION */}
        {activeTab === 'norm' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">LayerNorm vs Root Mean Square Normalization (RMSNorm)</h3>
            <p className="text-xs text-slate-400">
              RMSNorm removes mean-centering from LayerNorm, computing only the root mean square of activation activations. This saves 7% - 15% kernel execution time with zero accuracy loss, adopted in LLaMA, Mistral, and Gemma.
            </p>

            <MathBlock
              label="RMSNorm Formulation"
              math={"\text{RMSNorm}(x) = \frac{x}{\text{RMS}(x)} \odot \gamma, \quad \text{RMS}(x) = \sqrt{\frac{1}{d} \sum_{i=1}^d x_i^2 + \epsilon}"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
