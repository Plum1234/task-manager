#!/usr/bin/env bash
# Starts both services for Replit:
#   - FastAPI backend on 127.0.0.1:8000 (internal only)
#   - Vite frontend on 0.0.0.0:5173 (public, proxies /tasks -> backend)
set -euo pipefail

# Install dependencies (idempotent).
(cd backend && pip install -r requirements.txt)
(cd frontend && npm install)

# Backend in the background; kill it when this script exits.
(cd backend && uvicorn main:app --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!
trap 'kill "$BACKEND_PID" 2>/dev/null || true' EXIT

# Frontend in the foreground (this is the public web process).
cd frontend && npm run dev
