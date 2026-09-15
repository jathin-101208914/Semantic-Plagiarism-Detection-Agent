import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.config import settings
from app.models import AnalysisResponse, ThresholdUpdateRequest, TextAnalysisRequest
from app.doc_parser import extract_text, split_into_sections
from app.analyzer import analyze_semantic_similarity, get_model

app = FastAPI(
    title="SemantiCheck API",
    description="Semantic Plagiarism Detection API powered by sentence-transformers",
    version="1.0.0"
)

# Enable CORS for local Vite development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Pre-warm sentence-transformer model on server boot."""
    try:
        get_model()
        print("[Startup] Semantic model warm-up complete.")
    except Exception as e:
        print(f"[Startup Warning] Could not pre-warm model: {e}")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "SemantiCheck API",
        "model": settings.MODEL_NAME,
        "thresholds": {
            "highly_similar": settings.HIGHLY_SIMILAR_THRESHOLD,
            "paraphrase": settings.PARAPHRASE_THRESHOLD
        }
    }

@app.get("/api/config")
def get_config():
    """Return current similarity threshold settings."""
    return {
        "highly_similar": settings.HIGHLY_SIMILAR_THRESHOLD,
        "paraphrase": settings.PARAPHRASE_THRESHOLD,
        "model_name": settings.MODEL_NAME
    }

@app.post("/api/config")
def update_config(req: ThresholdUpdateRequest):
    """Dynamically update threshold parameters."""
    if req.paraphrase >= req.highly_similar:
        raise HTTPException(
            status_code=400,
            detail="Paraphrase threshold must be strictly less than Highly Similar threshold."
        )
    settings.HIGHLY_SIMILAR_THRESHOLD = req.highly_similar
    settings.PARAPHRASE_THRESHOLD = req.paraphrase
    return {
        "message": "Thresholds updated successfully",
        "highly_similar": settings.HIGHLY_SIMILAR_THRESHOLD,
        "paraphrase": settings.PARAPHRASE_THRESHOLD
    }

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_documents(
    reference_file: Optional[UploadFile] = File(None),
    student_file: Optional[UploadFile] = File(None),
    reference_text: Optional[str] = Form(None),
    student_text: Optional[str] = Form(None),
    highly_similar_threshold: Optional[float] = Form(None),
    paraphrase_threshold: Optional[float] = Form(None)
):
    """
    Accepts either uploaded document files (PDF/DOCX/TXT) or raw text input,
    processes both documents into sections, generates semantic embeddings,
    and returns comprehensive plagiarism similarity report.
    """
    ref_content = ""
    stu_content = ""

    # Process Reference Document
    if reference_file:
        bytes_data = await reference_file.read()
        ref_content = extract_text(reference_file.filename, bytes_data)
    elif reference_text:
        ref_content = reference_text
    else:
        raise HTTPException(status_code=400, detail="Missing reference document or text.")

    # Process Student Document
    if student_file:
        bytes_data = await student_file.read()
        stu_content = extract_text(student_file.filename, bytes_data)
    elif student_text:
        stu_content = student_text
    else:
        raise HTTPException(status_code=400, detail="Missing student document or text.")

    if not ref_content.strip():
        raise HTTPException(status_code=400, detail="Reference document text is empty or unreadable.")
    if not stu_content.strip():
        raise HTTPException(status_code=400, detail="Student document text is empty or unreadable.")

    # Split text into semantic sections/sentences
    ref_sections = split_into_sections(ref_content)
    stu_sections = split_into_sections(stu_content)

    # Perform semantic embedding and similarity analysis
    result = analyze_semantic_similarity(
        student_sections=stu_sections,
        reference_sections=ref_sections,
        high_threshold=highly_similar_threshold,
        para_threshold=paraphrase_threshold
    )

    return result

@app.get("/api/samples")
def get_sample_datasets():
    """
    Provides pre-loaded sample datasets for instant 1-click hackathon demo testing.
    """
    sample_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_data")
    
    ref_path = os.path.join(sample_dir, "ref_sample.txt")
    para_path = os.path.join(sample_dir, "student_paraphrased.txt")
    orig_path = os.path.join(sample_dir, "student_original.txt")

    ref_text = open(ref_path).read() if os.path.exists(ref_path) else ""
    para_text = open(para_path).read() if os.path.exists(para_path) else ""
    orig_text = open(orig_path).read() if os.path.exists(orig_path) else ""

    return {
        "reference_doc": ref_text,
        "preset_paraphrased": {
            "title": "Heavy Paraphrase Demo (AI Ethics)",
            "description": "Student submission that rephrases and restructures reference sentences to attempt bypassing standard word matchers.",
            "student_doc": para_text
        },
        "preset_original": {
            "title": "Original Content Demo (Renewable Energy)",
            "description": "Completely different topic with 0% semantic overlap.",
            "student_doc": orig_text
        }
    }
