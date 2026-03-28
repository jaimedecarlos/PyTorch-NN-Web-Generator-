#!/usr/bin/env bash
set -e

# Add local node to PATH if available
if [ -d "$HOME/node20/bin" ]; then
  export PATH="$HOME/node20/bin:$PATH"
fi

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== PyTorch Network Generator ==="
echo ""

# ── Backend ──────────────────────────────────────────────────────────────
echo "Starting backend (FastAPI) on http://localhost:8000 ..."
UVICORN="$HOME/Library/Python/3.9/bin/uvicorn"
if [ ! -f "$UVICORN" ]; then
  UVICORN="uvicorn"
fi

cd "$ROOT/backend"
"$UVICORN" main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# wait for backend to start
sleep 2

# ── Frontend ─────────────────────────────────────────────────────────────
echo "Starting frontend (Vite dev server) on http://localhost:5173 ..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "Open http://localhost:5173 in your browser."
echo "Press Ctrl+C to stop both servers."

# ── Cleanup ───────────────────────────────────────────────────────────────
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
