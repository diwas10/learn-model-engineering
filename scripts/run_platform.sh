#!/usr/bin/env bash
set -e

# AI Model Engineering Mastery Platform Runner
echo "=========================================================="
echo " Starting AI Model Engineering Mastery Learning Platform"
echo "=========================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 1. Start Python FastAPI Backend
echo "[1/2] Starting Python FastAPI Backend on port 8000..."
cd "$ROOT_DIR/backend"
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    uv venv
    uv pip install fastapi uvicorn pydantic pytest httpx numpy torch
fi

source .venv/bin/activate
export PYTHONPATH=.
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"

# 2. Start Next.js Frontend
echo "[2/2] Starting Next.js Frontend on port 3000..."
cd "$ROOT_DIR/frontend"
pnpm dev --port 3000 &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID"

echo ""
echo "=========================================================="
echo " Platform is live!"
echo " Frontend: http://localhost:3000"
echo " Backend API: http://localhost:8000"
echo " API Docs: http://localhost:8000/docs"
echo " Press Ctrl+C to terminate both servers."
echo "=========================================================="

trap "echo 'Shutting down services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
