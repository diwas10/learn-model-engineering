# Architecture & Implementation Specification

## AI Model Engineering Mastery Platform

This document describes the architectural design, component interactions, security boundaries, and data models of the AI Model Engineering Mastery Learning Platform.

---

## 1. System Overview

```
                                    +-----------------------------------------+
                                    |         Learner Browser Client          |
                                    |    Next.js 16 + React 19 + Tailwind     |
                                    +-----------------------------------------+
                                        /                  |                \
                                       /                   |                 \
                                      v                    v                  v
                   +---------------------+   +---------------------+   +---------------------+
                   | Learning Dashboard  |   | Flagship Labs (1-8) |   | Interactive Lessons |
                   | - Course Map & DAG  |   | - Transformer Lab   |   | - 12-Part Pedagogy  |
                   | - Parallel Tracks   |   | - Model Surgery     |   | - KaTeX Derivation  |
                   | - Competency Radar  |   | - KV Cache Profiler |   | - Manim Animation   |
                   | - Mastery Tracking  |   | - Multimodal ViT    |   | - Code Playground   |
                   +---------------------+   +---------------------+   +---------------------+
                                        \                  |                 /
                                         \                 |                /
                                          v                v               v
                                    +-----------------------------------------+
                                    |          FastAPI Backend API            |
                                    |            Python 3.12                  |
                                    +-----------------------------------------+
                                        |                  |                \
                                        v                  v                 v
                   +---------------------+   +---------------------+   +---------------------+
                   | Curriculum Service  |   | Laboratory Compute  |   | Sandboxed Execution |
                   | - DAG & Prereqs     |   | - PyTorch Attention |   | - Isolated Process  |
                   | - Search Index      |   | - LoRA VRAM Models  |   | - Output Redirect   |
                   | - Resource Manager  |   | - KV Sizing Engine  |   | - Hard Timeout (4s) |
                   +---------------------+   +---------------------+   +---------------------+
```

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router) with React 19
- **Type Safety**: TypeScript 5.9 with strict type checking
- **Styling**: Tailwind CSS with custom obsidian/slate dark theme
- **Mathematical Typesetting**: KaTeX 0.19 with inline `$` and block `$$` rendering
- **Interactive Visualizations**:
  - HTML5 Canvas & 2D Vector Manim-style smooth animation player
  - Interactive heatmaps with real-time temperature scaling
  - Dynamic parameter controllers and coordinate frames
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

### Backend
- **Framework**: FastAPI with Pydantic 2.14
- **Runtime**: Python 3.12 (uv package manager)
- **Scientific Computing**: PyTorch 2.15, NumPy 2.5, SciPy, SymPy
- **Process Isolation**: Multi-process sandboxed execution with `multiprocessing.Process` and IPC pipes
- **Testing**: PyTest with HTTPX TestClient

---

## 3. Data Model & Traceability

The source curriculum (`ai_model_engineering_mastery_course.json`) is parsed, validated, and normalized into strongly-typed data structures:

- **Modules** (`Module`): 28 modules categorized across 5 levels (`foundation`, `core`, `advanced`, `systems`, `research`).
- **Lessons** (`Lesson`): 253 lessons each with unique IDs (`<module_id>.L<order>`), prerequisite dependencies, mathematical connections, learning objectives, visualizations, exercises, and assessments.
- **Capstone Projects** (`CapstoneProject`): 6 autonomous projects with acceptance criteria and deliverables.
- **Cross-Cutting Labs** (`CrossCuttingLab`): 6 dedicated labs (`lab_shapes`, `lab_attention`, `lab_surgery`, `lab_training`, `lab_inference`, `lab_multimodal`).
- **Resources** (`Resource`): 22 curated external video series, books, repositories, and documentation with link verification provenance.

---

## 4. Sandboxed Code Execution Security

Learner code is executed through `/api/execution/run` under strict security constraints:

1. **Process Isolation**: Code runs inside an isolated sub-process spawned via `multiprocessing.Process`.
2. **Hard Timeout**: Sub-processes have a 4.0-second execution quota. If exceeded, `terminate()` and `kill()` are sent, preventing CPU lockups from infinite loops.
3. **Whitelisted Builtins & Imports**:
   - `__import__` is restricted to safe packages: `numpy`, `torch`, `math`, `scipy`, `typing`, `collections`, `itertools`, `random`, `time`.
   - File system write and unrestricted OS calls (`os.system`, `subprocess`, socket connections) are blocked.
4. **Standard I/O Redirection**: `sys.stdout` and `sys.stderr` are captured in memory and capped at 10,000 characters.
5. **Client-Side Fallback**: If the backend is loading or unavailable, the web client features an immediate verification runner so the learner is never blocked.

---

## 5. Standardized 12-Section Pedagogical Structure

Every lesson follows a consistent, research-grade pedagogical sequence:
1. **What problem does this concept solve?**: Formal problem statement and motivation.
2. **Intuitive explanation**: Conceptual and architectural mental model.
3. **Visual explanation**: Manim-style vector animation player with play/pause, step controls, and live parameter sliders.
4. **Mathematical formulation**: Formal KaTeX equations with operator definitions.
5. **Step-by-step derivation**: Analytical gradient propagation, chain rule expansion, or shape algebra.
6. **Numerical example**: Concrete small-scale numbers traced through the equations.
7. **Tensor shapes**: Input, kernel, and output dimensions with invariants.
8. **Implementation from scratch**: In-browser Python/PyTorch code editor with unit tests.
9. **Interactive experimentation**: Live parameter adjustments and behavior exploration.
10. **Common misconceptions**: Edge cases, vanishing gradients, precision limits.
11. **Practical applications**: Hardware execution (Tensor Cores, SRAM/HBM) and research implications.
12. **Knowledge assessment**: Mastery gate verification (derivation, implementation, failure analysis, unseen transfer).

---

## 6. Flagship Laboratories Overview

1. **Transformer Architecture Laboratory** (`/labs/transformer`):
   - Scaled Dot-Product Attention: $A = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}} + M\right) V$
   - RoPE (Rotary Position Embedding) complex plane rotations
   - Multi-Head, Multi-Query, and Grouped-Query Attention comparator
   - Step-by-Step Autoregressive Token Generation with live KV Cache memory tracing
   - Sparse Mixture of Experts (MoE) Top-k router and expert gating simulation

2. **Model Surgery and Fine-Tuning Laboratory** (`/labs/model-surgery`):
   - Low-Rank Adaptation (LoRA) live matrix decomposition: $W = W_0 + \frac{\alpha}{r}(BA)$
   - GPU VRAM footprint and parameter calculator (Trainable vs Frozen)
   - PEFT Strategy Comparator (LoRA, QLoRA, Prefix Tuning, Adapters, Linear Probing, Full FT)
   - Tokenizer Vocabulary Expansion & Embedding Resizing simulator
   - Weight Merging without retraining (SLERP spherical interpolation, TIES, DARE)

3. **Mathematical Foundations Laboratory** (`/labs/mathematics`):
   - Matrix Transformations ($Ax = b$, rotation, shear, scaling)
   - Eigenvalues, Eigenvectors & Spectral Theorem
   - SVD & Low-Rank Truncation ($A = U \Sigma V^T$) with Frobenius reconstruction error
   - High-dimensional loss landscapes, curvature, and gradient descent paths

4. **Neural Network Dynamics Laboratory** (`/labs/neural-networks`):
   - Activation Functions Studio: ReLU, GELU, SiLU, SwiGLU with derivatives
   - Weight Initialization: Xavier vs Kaiming vs Normal variance preservation across 10 layers
   - Residual Connections gradient highway verification
   - Normalization mechanics: LayerNorm vs RMSNorm

5. **Multimodal Engineering Laboratory** (`/labs/multimodal`):
   - Vision Transformer (ViT) 2D image patchification ($P \times P$) and linear projection
   - Audio Mel-spectrogram filterbank extraction and Conformer architecture
   - Cross-Modal Attention (Vision-to-Language) alignment

6. **AI Inference Systems Laboratory** (`/labs/inference`):
   - Prefill (Compute-Bound, GEMM) vs Decode (Memory-Bound, GEMV) phase dynamics
   - Live KV Cache VRAM Profiler
   - Weight Quantization Studio: FP16 vs INT8 vs INT4 vs NF4
   - Speculative Decoding latency speedup simulator

7. **Agentic AI & Systems Laboratory** (`/labs/agents`):
   - ReAct (Reasoning + Acting) execution trace timeline
   - Tool calling schema & JSON schema validator
   - Model Context Protocol (MCP) client-server architecture simulation
   - RAG vector retrieval & cosine similarity grounding

8. **Tensor Shape Debugger** (`/labs/shapes`):
   - Interactive [B, T, H, D] dimension tracing across all Transformer layers
   - Einsum tensor contractions
   - Broadcasting compatibility verification
