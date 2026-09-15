#!/bin/bash
echo "Starting SemantiCheck Backend (FastAPI + Sentence-Transformers)..."
cd "$(dirname "$0")/backend"
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
