'use client';

import React, { useState } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Calculator, Sliders, Activity, Compass, Play, RotateCcw } from 'lucide-react';

export default function MathematicsLabPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'svd' | 'landscape'>('matrix');

  // Matrix Transformation State
  const [m11, setM11] = useState(1.5);
  const [m12, setM12] = useState(0.5);
  const [m21, setM21] = useState(0.0);
  const [m22, setM22] = useState(1.2);

  // SVD Rank State
  const [svdRank, setSvdRank] = useState(2); // 1, 2, 3

  // Loss Landscape State
  const [optimStep, setOptimStep] = useState(0);

  // Determinant calculation
  const det = m11 * m22 - m12 * m21;
  const trace = m11 + m22;
  // Eigenvalues: lambda^2 - trace*lambda + det = 0
  const disc = trace * trace - 4 * det;
  const eig1 = disc >= 0 ? ((trace + Math.sqrt(disc)) / 2).toFixed(2) : 'complex';
  const eig2 = disc >= 0 ? ((trace - Math.sqrt(disc)) / 2).toFixed(2) : 'complex';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Calculator className="h-4 w-4" />
            <span>Interactive Mathematics Laboratory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Mathematical Foundations & Geometry
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Explore linear algebra, SVD low-rank approximations, eigenspaces, Jacobians, and loss landscapes with live parametric transformations.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'matrix', label: '1. Matrix Transformations & Eigenspaces' },
              { id: 'svd', label: '2. SVD & Low-Rank Approximation' },
              { id: 'landscape', label: '3. Loss Landscapes & Gradient Flow' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
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
        {/* TAB 1: MATRIX TRANSFORMATIONS */}
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-sm font-bold text-white mb-3">{'Matrix A = [[a, b], [c, d]]'}</h3>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <label className="text-slate-400 block mb-1">a (m11): {m11}</label>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={m11}
                      onChange={(e) => setM11(parseFloat(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">b (m12): {m12}</label>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={m12}
                      onChange={(e) => setM12(parseFloat(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">c (m21): {m21}</label>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={m21}
                      onChange={(e) => setM21(parseFloat(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">d (m22): {m22}</label>
                    <input
                      type="range"
                      min={-2}
                      max={2}
                      step={0.1}
                      value={m22}
                      onChange={(e) => setM22(parseFloat(e.target.value))}
                      className="w-full accent-blue-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Determinant $\det(A)$:</span>
                    <span className="text-cyan-400 font-bold">{det.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{'Trace Tr(A):'}</span>
                    <span className="text-blue-400 font-bold">{trace.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eigenvalues $\lambda_1, \lambda_2$:</span>
                    <span className="text-purple-400 font-bold">{eig1}, {eig2}</span>
                  </div>
                </div>
              </div>

              <MathBlock
                label="Linear Transformation"
                math={"T(\mathbf{x}) = A\mathbf{x} = \begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x_1 \\ x_2 \end{pmatrix}"}
              />
            </div>

            {/* Canvas Transformation View */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 self-start">
                {'Transformed Unit Square & Basis Vectors (î, ĵ → Aî, Aĵ)'}
              </h3>

              <div className="h-80 w-80 relative rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center">
                {/* Coordinate axes */}
                <div className="absolute inset-x-0 h-px bg-slate-800" />
                <div className="absolute inset-y-0 w-px bg-slate-800" />

                {/* Transformed Basis Vector 1: (m11, m21) in cyan */}
                <svg className="absolute inset-0 h-full w-full" viewBox="-200 -200 400 400">
                  {/* Unit Square grid */}
                  <polygon
                    points={`0,0 ${m11 * 60},${-m21 * 60} ${(m11 + m12) * 60},${-(m21 + m22) * 60} ${m12 * 60},${-m22 * 60}`}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                  />
                  {/* Arrow i */}
                  <line
                    x1="0"
                    y1="0"
                    x2={m11 * 60}
                    y2={-m21 * 60}
                    stroke="#06b6d4"
                    strokeWidth="3"
                  />
                  {/* Arrow j */}
                  <line
                    x1="0"
                    y1="0"
                    x2={m12 * 60}
                    y2={-m22 * 60}
                    stroke="#a855f7"
                    strokeWidth="3"
                  />
                </svg>

                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400">Cyan: A(1, 0)</span> | <span className="text-purple-400">Purple: A(0, 1)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SVD & LOW-RANK APPROXIMATION */}
        {activeTab === 'svd' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Singular Value Decomposition (SVD)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Eckart-Young-Mirsky Theorem: The optimal rank-$k$ approximation minimizing Frobenius norm $\|A - A_k\|_F$ is given by truncating SVD to the top $k$ singular values.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-300 font-medium">Truncation Rank ($k$):</span>
                {[1, 2, 3].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSvdRank(r)}
                    className={`rounded-lg px-3 py-1 text-xs font-mono font-bold transition-colors ${
                      svdRank === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    k = {r}
                  </button>
                ))}
              </div>
            </div>

            <MathBlock
              label="SVD Truncation Form"
              math={"\mathbf{A} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T = \sum_{i=1}^{r} \sigma_i \mathbf{u}_i \mathbf{v}_i^T \approx \mathbf{A}_k = \sum_{i=1}^{k} \sigma_i \mathbf{u}_i \mathbf{v}_i^T"}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-semibold text-slate-400">Singular Values ($\sigma_i$)</div>
                <div className="mt-2 text-sm font-mono text-cyan-400">
                  σ₁ = 12.4, σ₂ = 4.8, σ₃ = 0.9, σ₄ = 0.1
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-semibold text-slate-400">Retained Energy (Variance)</div>
                <div className="mt-2 text-sm font-mono text-emerald-400 font-bold">
                  {svdRank === 1 ? '76.4%' : svdRank === 2 ? '94.2%' : '99.8%'}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-xs font-semibold text-slate-400">Reconstruction Error $\|A - A_k\|_F$</div>
                <div className="mt-2 text-sm font-mono text-rose-400 font-bold">
                  {svdRank === 1 ? '4.88' : svdRank === 2 ? '0.91' : '0.10'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOSS LANDSCAPES & GRADIENTS */}
        {activeTab === 'landscape' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Loss Landscape Curvature & Saddle Points
            </h3>
            <p className="text-xs text-slate-400">
              In deep networks, local minima are rarely isolated; high-dimensional loss surfaces are dominated by saddle points where the Hessian $H$ has both positive and negative eigenvalues.
            </p>

            <MathBlock
              label="Multivariate Taylor Expansion around Critical Point"
              math={"f(\mathbf{w} + \Delta\mathbf{w}) \approx f(\mathbf{w}) + \nabla f(\mathbf{w})^T \Delta\mathbf{w} + \frac{1}{2} \Delta\mathbf{w}^T \mathbf{H} \Delta\mathbf{w}"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
