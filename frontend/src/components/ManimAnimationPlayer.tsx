'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Sliders, Eye } from 'lucide-react';
import { MathView } from './MathView';

interface ManimAnimationPlayerProps {
  concept: string;
  storyboard?: string[];
  equation?: string;
  className?: string;
  interactiveControls?: {
    name: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }[];
}

export const ManimAnimationPlayer: React.FC<ManimAnimationPlayerProps> = ({
  concept,
  storyboard = [
    'Establish geometric and mathematical intuition',
    'Transition from algebraic equations to coordinate frames',
    'Trace dynamic transformation under parameter variation',
    'Evaluate convergence, stability, and failure boundaries'
  ],
  equation = '\\mathbf{y} = \\text{Softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^T}{\\sqrt{d_k}}\\right)\\mathbf{V}',
  className = '',
  interactiveControls = [
    { name: 'paramA', label: 'Parameter α (Scale / Temp)', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0 },
    { name: 'paramB', label: 'Parameter β (Bias / Shift)', min: -2.0, max: 2.0, step: 0.2, defaultValue: 0.0 }
  ]
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [speed, setSpeed] = useState(1.0);
  const currentStep = Math.min(
    storyboard.length - 1,
    Math.floor((progress / 100) * storyboard.length)
  );
  const [params, setParams] = useState<Record<string, number>>(
    interactiveControls.reduce((acc, c) => ({ ...acc, [c.name]: c.defaultValue }), {})
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    let lastTime = performance.now();
    const update = (time: number) => {
      if (isPlaying) {
        const delta = (time - lastTime) / 1000;
        setProgress((prev) => {
          const next = prev + delta * 20 * speed;
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }
      lastTime = time;
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speed]);



  // Canvas 2D rendering: Manim-style smooth geometry with glow, grid, vectors, and curves
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const t = (progress / 100) * Math.PI * 2;
    const alpha = params['paramA'] ?? 1.0;
    const beta = params['paramB'] ?? 0.0;

    // Background: Dark gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#020617'); // slate-950
    bgGradient.addColorStop(1, '#090d16');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)'; // slate-700
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Draw dynamic curves representing the transformation
    ctx.save();
    ctx.shadowBlur = 15;

    // Wave 1: Cyan primary transformation curve
    ctx.strokeStyle = '#06b6d4'; // cyan-500
    ctx.shadowColor = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px += 2) {
      const nx = (px - cx) / 50;
      // Equation combining concept phase, alpha and beta
      const ny = Math.sin(nx * alpha + t) * Math.cos(nx * 0.5 + beta) * Math.exp(-0.04 * nx * nx);
      const py = cy - ny * 80;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Wave 2: Purple secondary/gradient curve
    ctx.strokeStyle = '#a855f7'; // purple-500
    ctx.shadowColor = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px < width; px += 3) {
      const nx = (px - cx) / 50;
      const ny = Math.tanh(nx * alpha * 0.8) * Math.cos(t + nx);
      const py = cy - ny * 70;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Animated particle / vector tip
    const tipNx = Math.cos(t) * 2.5;
    const tipNy = Math.sin(tipNx * alpha + t) * Math.cos(tipNx * 0.5 + beta);
    const tipPx = cx + tipNx * 50;
    const tipPy = cy - tipNy * 80;

    // Vector line from origin to tip
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)'; // yellow-400
    ctx.shadowColor = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tipPx, tipPy);
    ctx.stroke();

    // Glowing tip dot
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(tipPx, tipPy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Tangent / gradient indicator at particle
    const tangentLength = 35;
    const deriv = alpha * Math.cos(tipNx * alpha + t);
    const angle = Math.atan2(-deriv, 1);
    ctx.strokeStyle = '#ec4899'; // pink-500
    ctx.shadowColor = '#ec4899';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tipPx - Math.cos(angle) * tangentLength, tipPy - Math.sin(angle) * tangentLength);
    ctx.lineTo(tipPx + Math.cos(angle) * tangentLength, tipPy + Math.sin(angle) * tangentLength);
    ctx.stroke();

    ctx.restore();

    // Coordinate HUD overlay on canvas
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`t = ${(progress / 100).toFixed(2)}τ`, 16, 24);
    ctx.fillText(`x(t) = ${tipNx.toFixed(3)}, y(t) = ${tipNy.toFixed(3)}`, 16, 42);
    ctx.fillText(`∇f = ${deriv.toFixed(3)}`, 16, 60);

  }, [progress, params]);

  const handleStepPrev = () => {
    setProgress((prev) => Math.max(0, prev - 25));
  };

  const handleStepNext = () => {
    setProgress((prev) => Math.min(100, prev + 25));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <Eye className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">
            Manim Mathematical Animation Engine
          </span>
          <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-800/40">
            {concept}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Speed:</span>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors ${
                speed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative aspect-[16/9] w-full bg-slate-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="h-full w-full object-contain"
        />

        {/* Dynamic Equation Overlay */}
        <div className="absolute top-4 right-4 max-w-sm rounded-xl border border-slate-800 bg-slate-900/85 p-3 backdrop-blur-md shadow-lg pointer-events-none">
          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
            Governing Equation
          </div>
          <MathView math={equation} block={false} className="text-sm font-serif" />
        </div>

        {/* Storyboard Step Subtitle */}
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-slate-800/80 bg-slate-900/85 p-2.5 backdrop-blur-md shadow-md text-center">
          <span className="text-[11px] font-semibold text-cyan-400 mr-2 uppercase tracking-wider">
            Phase {currentStep + 1} of {storyboard.length}:
          </span>
          <span className="text-xs text-slate-200">
            {storyboard[currentStep]}
          </span>
        </div>
      </div>

      {/* Progress Scrubber */}
      <div className="px-4 pt-3 pb-1 bg-slate-900/40 border-t border-slate-800/60">
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={progress}
          onChange={(e) => {
            setIsPlaying(false);
            setProgress(parseFloat(e.target.value));
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 hover:accent-cyan-300"
        />
      </div>

      {/* Playback Controls & Parameter Sliders */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/50">
        {/* Play / Step Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 hover:bg-cyan-500 transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button
            onClick={handleStepPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Step Back"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={handleStepNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Step Forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Live Parameter Sliders */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {interactiveControls.map((ctrl) => (
            <div key={ctrl.name} className="flex items-center space-x-2">
              <span className="text-[11px] font-medium text-slate-400">
                {ctrl.label}:
              </span>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={params[ctrl.name] ?? ctrl.defaultValue}
                onChange={(e) =>
                  setParams({ ...params, [ctrl.name]: parseFloat(e.target.value) })
                }
                className="w-24 h-1.5 cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
              />
              <span className="font-mono text-[11px] text-cyan-300 w-8">
                {(params[ctrl.name] ?? ctrl.defaultValue).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
