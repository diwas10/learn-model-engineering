# AI Model Engineering Mastery Platform

> **Foundations to Multimodal Systems: An Interactive Deep Learning & AI Systems Laboratory**

An interactive, research-grade educational platform designed to empower AI engineers and researchers to understand, implement, modify, train, fine-tune, optimize, evaluate, and deploy modern AI models independently.

Built directly from the curriculum contract in `ai_model_engineering_mastery_course.json`.

---

## 🌟 Key Highlights

- **Complete Curriculum**: All **28 modules** and **253 lessons** fully mapped, navigable, and rendered with the standardized 12-section pedagogical structure.
- **Reference Vertical Slice**: Production-depth implementations for:
  - Matrix Multiplication & Tensor Contractions (`math_linear.L02`)
  - Backpropagation & Computational Graphs (`math_calculus.L03`)
  - Scaled Dot-Product Attention (`transformer_core.L03`)
  - Multi-Head Attention Tensor Reshaping (`transformer_core.L05`)
  - LoRA Low-Rank Adaptation (`adaptation_peft.L03`)
  - Autoregressive KV Cache Mechanics (`inference_foundations.L03`)
- **Flagship Laboratories**:
  1. **Transformer Architecture Lab** (`/labs/transformer`): Live Attention Heatmap, RoPE Phase Rotations, MHA/MQA/GQA comparator, KV Cache step-by-step token generation trace, and MoE routing.
  2. **Model Surgery & Fine-Tuning Lab** (`/labs/model-surgery`): Live LoRA rank/alpha matrix merge ($W = W_0 + \frac{\alpha}{r} BA$), parameter breakdown, VRAM calculator, vocabulary expansion, and SLERP model merging.
  3. **Mathematical Geometry Lab** (`/labs/mathematics`): 2D/3D transformations, eigenspaces, SVD rank truncation with Frobenius error, and loss landscapes.
  4. **Neural Dynamics Lab** (`/labs/neural-networks`): Activations (ReLU, GELU, SiLU), weight initialization variance across 10 layers, and residual gradient highways.
  5. **Multimodal Engineering Lab** (`/labs/multimodal`): ViT 2D patch decomposition, audio Mel-spectrograms, and cross-attention alignment.
  6. **AI Inference Systems Lab** (`/labs/inference`): Prefill vs Decode breakdown, KV cache memory footprint calculator, quantization studio, and speculative decoding acceleration.
  7. **Agentic AI & Systems Lab** (`/labs/agents`): ReAct execution trace, JSON schema validation, MCP protocol visualizer, and RAG retrieval.
  8. **Tensor Shape Debugger** (`/labs/shapes`): Trace $[B, T, H, D]$ across Transformer layers and einsum contractions.
- **Interactive Code Sandbox**: In-browser Python/PyTorch editor with automated test assertions, backed by an isolated multi-process execution sandbox with resource quotas.
- **Context-Aware AI Tutor**: Slide-out research assistant offering progressive hints, step-by-step derivations, and architectural comparisons.
- **Mastery Gate Verification**: Enforces derivation proofs, scratch implementation passing, failure mode explanations, and unseen architecture transfer challenges.
- **Verified External Resources**: Provenance links to 3Blue1Brown, MIT 18.06, MML, Karpathy nanoGPT/micrograd, Sebastian Raschka, PyTorch, vLLM, and FlashAttention.

---

## 🚀 Quick Start

### Option A: Launch Everything with One Command

```bash
chmod +x scripts/run_platform.sh
./scripts/run_platform.sh
```

This starts:
- **FastAPI Backend** on `http://127.0.0.1:8000` (API Docs: `/docs`)
- **Next.js Frontend** on `http://localhost:3000`

---

### Option B: Run Components Separately

#### 1. Backend (Python 3.12 / FastAPI / PyTorch)

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install fastapi uvicorn pydantic pytest httpx numpy torch
export PYTHONPATH=.
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend (Next.js 16 / React 19 / Tailwind)

```bash
cd frontend
pnpm install
pnpm dev --port 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

### Backend Unit & API Tests

Run the PyTest test suite (16 tests verifying curriculum DAG, code sandbox, numerical gradients, attention math, LoRA memory, and KV cache calculations):

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest -v
```

### Frontend Typecheck & Build

Verify strict TypeScript types and compile all 299 static/dynamic routes:

```bash
cd frontend
pnpm build
```

Verify ESLint linting:

```bash
cd frontend
pnpm lint
```

---

## 📂 Project Structure

```
learn-model-engineering/
├── ai_model_engineering_mastery_course.json   # Source of truth curriculum specification
├── frontend/                                   # Next.js 16 App Router application
│   ├── src/
│   │   ├── app/                               # Pages: Dashboard, Lessons, Modules, Labs, Capstones, Coverage
│   │   │   ├── labs/                          # 8 Interactive Flagship Laboratories
│   │   │   ├── lessons/[lessonId]/            # 12-section pedagogical lesson runner
│   │   │   ├── modules/[moduleId]/            # Module directory and lesson lists
│   │   │   ├── capstones/                     # 6 Capstone project specs & tracking
│   │   │   ├── coverage/                      # Auditable implementation coverage matrix
│   │   │   └── playground/                    # Open Python/PyTorch code sandbox
│   │   ├── components/                        # Reusable UI & visualization components
│   │   │   ├── ManimAnimationPlayer.tsx       # 2D Vector animation player with live parameters
│   │   │   ├── CodeEditorPlayground.tsx       # Sandboxed code editor with automated unit tests
│   │   │   ├── AITutorDrawer.tsx              # Context-aware research AI tutor
│   │   │   ├── MasteryGateTracker.tsx         # 4-gate mastery verification checklist
│   │   │   ├── MathView.tsx                   # KaTeX equation renderer
│   │   │   └── Navigation.tsx                 # Header navbar with search & mastery pill
│   │   ├── data/
│   │   │   ├── courseData.json                # Normalized course data
│   │   │   └── lessonEnrichment.ts            # Detailed mathematical derivations & code tests
│   │   └── lib/                               # Curriculum graph & mastery state store
├── backend/                                   # FastAPI backend
│   ├── app/
│   │   ├── main.py                            # FastAPI application with CORS
│   │   ├── api/                               # REST endpoints (/curriculum, /execution, /labs, /tutor, /mastery)
│   │   ├── core/sandbox.py                    # Multi-process isolated code execution sandbox
│   │   ├── models/                            # Pydantic schemas for execution, curriculum, mastery
│   │   └── services/                          # PyTorch attention, LoRA sizing, KV cache profiler
│   └── tests/                                 # PyTest suite for sandbox, math, and API routes
├── docs/
│   ├── ARCHITECTURE.md                        # Full architectural documentation
│   ├── COVERAGE_REPORT.md                     # Markdown coverage audit
│   └── COVERAGE_REPORT.json                   # Machine-readable coverage report
└── scripts/
    ├── run_platform.sh                        # One-click startup script
    └── generate_coverage_report.py            # Coverage report generator
```

---

## 📊 Verification & Audit Coverage

- **Total Curriculum Modules**: 28 / 28 (100% Implemented)
- **Total Lessons**: 253 / 253 (100% Implemented with 12 structured sections)
- **Reference Deep Slice**: 6 representative flagship lessons with verified derivations, code, and test suites
- **Flagship Laboratories**: 8 / 8 (100% Functional)
- **Capstone Projects**: 6 / 6 (100% Tracked)
- **External Resources**: 22 / 22 (100% Verified)
- **PyTest Suite**: 16 / 16 Passing
- **Next.js Production Build**: 299 / 299 Routes Compiled

See [docs/COVERAGE_REPORT.md](docs/COVERAGE_REPORT.md) and [docs/COVERAGE_REPORT.json](docs/COVERAGE_REPORT.json) for the complete auditable checklist.
