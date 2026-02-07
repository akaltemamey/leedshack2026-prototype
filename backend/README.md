# Backend (FastAPI)

This backend provides a simple, interpretable debris exposure risk API for the hackathon MVP.

## Requirements
- Python 3.11+

## Setup & run (local)
```bash
cd backend
python -m venv .venv
# Windows PowerShell:
# .\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
