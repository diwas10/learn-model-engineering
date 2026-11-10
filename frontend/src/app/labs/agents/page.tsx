'use client';

import React, { useState } from 'react';
import { MathView, MathBlock } from '@/components/MathView';
import { Bot, Terminal, Workflow, Search, Play, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AgentsLabPage() {
  const [activeTab, setActiveTab] = useState<'react' | 'tools' | 'mcp' | 'rag'>('react');
  const [reactStep, setReactStep] = useState(0);

  const reactTrace = [
    {
      phase: 'Thought',
      content: 'The user wants to compute the Frobenius norm difference between a base model weight and its LoRA merged representation. I need to call the tensor_norm tool with matrix delta.'
    },
    {
      phase: 'Action',
      content: 'Call tool: tensor_norm(matrix="W_delta", norm_type="frobenius")'
    },
    {
      phase: 'Observation',
      content: 'Tool Output: {"norm": 0.0418, "shape": [4096, 4096], "dtype": "float32"}'
    },
    {
      phase: 'Thought',
      content: 'The Frobenius norm is 0.0418, which is under the 0.05 safety bound. The adapted model preserves baseline stability.'
    },
    {
      phase: 'Final Answer',
      content: 'The LoRA weight merge has a Frobenius deviation of 0.0418, confirming that the adaptation is within nominal bounds.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-teal-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Bot className="h-4 w-4" />
            <span>Agentic Systems & AI Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Agentic AI & Systems Laboratory
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Implement and evaluate autonomous agent loops: ReAct planning, structured tool execution schemas, Model Context Protocol (MCP) server architecture, and retrieval grounding.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-800/80 pb-2">
            {[
              { id: 'react', label: '1. ReAct Execution Loop' },
              { id: 'tools', label: '2. Tool Calling & JSON Schemas' },
              { id: 'mcp', label: '3. Model Context Protocol (MCP)' },
              { id: 'rag', label: '4. RAG Retrieval & Grounding' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
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
        {/* TAB 1: REACT LOOP */}
        {activeTab === 'react' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-teal-400" />
                  ReAct (Reasoning + Acting) Agent Trace
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Interleaves chain-of-thought reasoning with external environment actions and tool observations.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setReactStep((prev) => Math.min(reactTrace.length - 1, prev + 1))}
                  disabled={reactStep >= reactTrace.length - 1}
                  className="flex items-center space-x-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Next Step</span>
                </button>
                <button
                  onClick={() => setReactStep(0)}
                  className="rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Trace Timeline */}
            <div className="space-y-3">
              {reactTrace.slice(0, reactStep + 1).map((step, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 text-xs animate-in fade-in ${
                    step.phase === 'Thought'
                      ? 'border-indigo-800/50 bg-indigo-950/20'
                      : step.phase === 'Action'
                      ? 'border-teal-800/50 bg-teal-950/20 font-mono'
                      : step.phase === 'Observation'
                      ? 'border-amber-800/50 bg-amber-950/20 font-mono'
                      : 'border-emerald-800/50 bg-emerald-950/30 font-medium'
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider block mb-1 text-slate-400">
                    Step {idx + 1}: {step.phase}
                  </span>
                  <div className="text-slate-200">{step.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TOOL CALLING */}
        {activeTab === 'tools' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-teal-400" />
              JSON Schema & Pydantic Tool Definitions
            </h3>
            <p className="text-xs text-slate-400">
              Tool definitions must enforce strict type safety, required parameters, and regex validation so the model cannot emit malformed payloads.
            </p>

            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-teal-300 overflow-x-auto">
{`{
  "name": "quantize_layer",
  "description": "Applies affine weight quantization to a linear projection layer.",
  "parameters": {
    "type": "object",
    "properties": {
      "layer_name": { "type": "string" },
      "target_bits": { "type": "integer", "enum": [4, 8] },
      "symmetric": { "type": "boolean", "default": true }
    },
    "required": ["layer_name", "target_bits"]
  }
}`}
            </pre>
          </div>
        )}

        {/* TAB 3: MCP */}
        {activeTab === 'mcp' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white">Model Context Protocol (MCP) Standard</h3>
            <p className="text-xs text-slate-400">
              MCP establishes an open client-server protocol separating AI reasoning from external execution environments: MCP Clients (e.g. Antigravity IDE, Claude Desktop) connect to standard MCP Servers providing Resources, Prompts, and Tools over JSON-RPC.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center w-full sm:w-44">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Host / Client</span>
                <span className="font-bold text-cyan-400">LLM Reasoning Engine</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />
              <div className="rounded-xl border border-teal-500/40 bg-teal-950/20 p-3 text-center w-full sm:w-44">
                <span className="text-[10px] uppercase text-teal-300 block font-semibold">Transport</span>
                <span className="font-mono text-teal-400 font-bold">JSON-RPC / stdio</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600 hidden sm:block" />
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-center w-full sm:w-44">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">MCP Server</span>
                <span className="font-bold text-emerald-400">Isolated Tools & Memory</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RAG */}
        {activeTab === 'rag' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-teal-400" />
              RAG Retrieval Pipeline & Cosine Similarity
            </h3>
            <MathBlock
              label="Cosine Vector Similarity"
              math={"\text{Sim}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
