'use client';

import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, Sparkles, Cpu, Layers } from 'lucide-react';
import { CodeEditorPlayground } from '@/components/CodeEditorPlayground';

export default function PlaygroundPage() {
  const templates: Record<string, { title: string; code: string; testCases: any[] }> = {
    attention: {
      title: 'Scaled Dot-Product Attention from Scratch',
      code: `import math
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, causal=True):
    d_k = Q.size(-1)
    # Compute attention scores
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    
    if causal:
        seq_len = Q.size(-2)
        mask = torch.triu(torch.full((seq_len, seq_len), float('-inf')), diagonal=1)
        scores = scores + mask
        
    weights = F.softmax(scores, dim=-1)
    context = torch.matmul(weights, V)
    return context, weights

# Run simulation
B, T, D = 1, 4, 16
Q = torch.randn(B, T, D)
K = torch.randn(B, T, D)
V = torch.randn(B, T, D)

out, weights = scaled_dot_product_attention(Q, K, V, causal=True)
print("Context Output shape:", out.shape)
print("Attention Weights row 0:\\n", weights[0, 0].tolist())
`,
      testCases: [
        { name: 'Output shape matches [1, 4, 16]', assertionCode: 'assert out.shape == torch.Size([1, 4, 16])' },
        { name: 'Row stochastic weights', assertionCode: 'assert torch.allclose(weights.sum(dim=-1), torch.ones(1, 4))' }
      ]
    },
    lora: {
      title: 'LoRA Linear Layer & Parameter Freezing',
      code: `import math
import torch
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, in_features, out_features, r=8, alpha=16):
        super().__init__()
        self.r = r
        self.scaling = alpha / r
        # Base weight frozen
        self.base = nn.Linear(in_features, out_features, bias=False)
        self.base.weight.requires_grad = False
        # Trainable low-rank adapters
        self.A = nn.Parameter(torch.randn(r, in_features) / math.sqrt(r))
        self.B = nn.Parameter(torch.zeros(out_features, r))

    def forward(self, x):
        base_out = self.base(x)
        lora_out = (x @ self.A.T @ self.B.T) * self.scaling
        return base_out + lora_out

layer = LoRALinear(32, 32, r=4)
x = torch.randn(2, 32)
y = layer(x)
loss = y.sum()
loss.backward()

print("Output shape:", y.shape)
print("Base grad (must be None):", layer.base.weight.grad)
print("LoRA A grad norm:", torch.norm(layer.A.grad).item())
`,
      testCases: [
        { name: 'Base weight frozen (no gradient)', assertionCode: 'assert layer.base.weight.grad is None' },
        { name: 'LoRA A received gradients', assertionCode: 'assert layer.A.grad is not None' }
      ]
    },
    kv_cache: {
      title: 'Autoregressive KV Cache Mechanism',
      code: `import torch

class KVCache:
    def __init__(self):
        self.keys = []
        self.values = []

    def step(self, new_k, new_v):
        self.keys.append(new_k)
        self.values.append(new_v)
        return torch.cat(self.keys, dim=1), torch.cat(self.values, dim=1)

cache = KVCache()
for t in range(5):
    k_t = torch.randn(1, 1, 64)
    v_t = torch.randn(1, 1, 64)
    all_k, all_v = cache.step(k_t, v_t)

print("Accumulated K Cache shape at step 5:", all_k.shape)
`,
      testCases: [
        { name: 'Cache length is 5', assertionCode: 'assert all_k.shape == torch.Size([1, 5, 64])' }
      ]
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState<string>('attention');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Terminal className="h-4 w-4" />
            <span>Interactive Code Sandbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Python & PyTorch Engineering Studio
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Live sandboxed environment executing PyTorch tensor contractions, custom autograd passes, model adaptations, and numerical gradient assertions with sub-millisecond feedback.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(templates).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  selectedTemplate === key
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CodeEditorPlayground
          key={selectedTemplate}
          initialCode={templates[selectedTemplate].code}
          testCases={templates[selectedTemplate].testCases}
        />
      </div>
    </div>
  );
}
