# SemantiCheck: Semantic Plagiarism Detection Agent

> **"Detect plagiarism by meaning, not just words."**

SemantiCheck is a full-stack AI application engineered for college hackathons. It identifies textual plagiarism based on **semantic meaning** rather than traditional exact-match n-gram string comparison.

---

## 🌟 Key Features

1. **Multi-Format Document Parsing**:
   - Supports **PDF** (via PyMuPDF), **DOCX** (via python-docx), and **TXT** files.
   - Text cleaning and sentence segmentation pipeline.

2. **Semantic Embedding Analysis**:
   - Uses `sentence-transformers/all-MiniLM-L6-v2` for high-performance, lightweight vector encoding.
   - Calculates pairwise cosine similarity matrix using `scikit-learn` / `numpy`.

3. **Three-Tier Similarity Classification**:
   - **Highly Similar** ($\ge 85\%$ match): Direct copy or near-identical syntax.
   - **Potential Paraphrase** ($70\% - 84\%$ match): Heavy rephrasing / synonym substitution retaining identical core meaning.
   - **Likely Original** ($< 70\%$ match): Unique student expression.

4. **Interactive Analytics Dashboard**:
   - Recharts Donut & Bar Charts displaying sentence-level similarity profile.
   - Side-by-side section comparison cards.
   - Live search & filter bar (Filter by Highly Similar, Paraphrased, Original, or search keyword).
   - **Dynamic Sensitivity Slider**: Re-classify results on the fly without re-uploading documents.
   - **1-Click Hackathon Demo Presets**: Pre-loaded test cases for instant demo presenting to hackathon judges.
   - **Printable Report**: One-click summary export.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Running the Application

1. **Start Backend Server (FastAPI)**:
   ```bash
   ./start_backend.sh
   # Or manually:
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
   Backend runs at: `http://localhost:8000`

2. **Start Frontend App (React + Vite)**:
   ```bash
   ./start_frontend.sh
   # Or manually:
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173` (or as displayed by Vite).

---

## 📐 Architecture & Tech Stack

```
           ┌─────────────────────────────┐
           │      React (Vite + CSS)     │
           │ Lucide Icons + Recharts UI  │
           └──────────────┬──────────────┘
                          │ REST API (JSON / Multipart)
                          ▼
           ┌─────────────────────────────┐
           │    FastAPI Python Backend   │
           └──────────────┬──────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│  Doc Extractors  │           │   Sentence Transformer   │
│ PDF / DOCX / TXT │           │ all-MiniLM-L6-v2 │
└──────────────────┘           └────────┬─────────┘
                                        │ Cosine Similarity
                                        ▼
                               ┌──────────────────┐
                               │ Similarity Report│
                               └──────────────────┘
```

- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: FastAPI, Uvicorn, Pydantic.
- **NLP**: sentence-transformers (`all-MiniLM-L6-v2`), PyMuPDF, python-docx, scikit-learn.
