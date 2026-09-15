import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
from app.config import settings
from app.models import MatchingSection, SummaryMetrics, AnalysisResponse

# Model singleton for performance - loaded once and reused across all requests
_model_instance = None

def get_model() -> SentenceTransformer:
    """Returns singleton SentenceTransformer instance. Reuses existing model in memory."""
    global _model_instance
    if _model_instance is None:
        print(f"[SemanticAnalyzer] Loading model '{settings.MODEL_NAME}' singleton...")
        _model_instance = SentenceTransformer(settings.MODEL_NAME)
        print("[SemanticAnalyzer] Model loaded successfully.")
    return _model_instance

def classify_similarity(score: float, high_thresh: float, para_thresh: float) -> str:
    """Classifies similarity score into defined semantic tiers."""
    if score >= high_thresh:
        return "Highly Similar"
    elif score >= para_thresh:
        return "Potential Paraphrase"
    else:
        return "Likely Original"

def calculate_risk_level(overall_pct: float) -> str:
    """Calculates overall document risk level based on similarity percentage."""
    if overall_pct >= 70.0:
        return "HIGH PLAGIARISM RISK"
    elif overall_pct >= 40.0:
        return "MODERATE PARAPHRASE RISK"
    else:
        return "LOW / CLEAN"

def analyze_semantic_similarity(
    student_sections: List[str],
    reference_sections: List[str],
    high_threshold: float = None,
    para_threshold: float = None
) -> AnalysisResponse:
    """
    Computes semantic embeddings for student and reference sections,
    calculates pairwise cosine similarity matrix using batch processing,
    identifies top matches, sorts them descending by score,
    and returns complete plagiarism analysis metrics.
    """
    if high_threshold is None:
        high_threshold = settings.HIGHLY_SIMILAR_THRESHOLD
    if para_threshold is None:
        para_threshold = settings.PARAPHRASE_THRESHOLD

    # Handle empty input gracefully
    if not student_sections or not reference_sections:
        return AnalysisResponse(
            summary=SummaryMetrics(
                total_sections=len(student_sections),
                overall_similarity=0.0,
                overall_similarity_percentage=0.0,
                risk_level="LOW / CLEAN",
                highly_similar_count=0,
                paraphrased_count=0,
                original_count=len(student_sections)
            ),
            sections=[],
            reference_section_count=len(reference_sections),
            student_section_count=len(student_sections),
            thresholds={
                "highly_similar": high_threshold,
                "paraphrase": para_threshold
            }
        )

    # Reuse model singleton
    model = get_model()

    # Batch embedding encoding (uses batch_size=32 for efficiency)
    student_embeddings = model.encode(
        student_sections,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True
    )
    reference_embeddings = model.encode(
        reference_sections,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True
    )

    # Cosine similarity matrix shape: (num_student_sections, num_ref_sections)
    sim_matrix = cosine_similarity(student_embeddings, reference_embeddings)

    matching_sections: List[MatchingSection] = []
    
    highly_similar_count = 0
    paraphrased_count = 0
    original_count = 0
    total_score_sum = 0.0

    for i, s_text in enumerate(student_sections):
        # Index of best matching reference section
        best_ref_idx = int(np.argmax(sim_matrix[i]))
        raw_score = float(sim_matrix[i][best_ref_idx])
        best_ref_text = reference_sections[best_ref_idx]

        # Bound score between 0.0 and 1.0
        bounded_score = max(0.0, min(1.0, raw_score))
        similarity_pct = round(bounded_score * 100, 1)

        classification = classify_similarity(bounded_score, high_threshold, para_threshold)

        if classification == "Highly Similar":
            highly_similar_count += 1
        elif classification == "Potential Paraphrase":
            paraphrased_count += 1
        else:
            original_count += 1

        total_score_sum += bounded_score

        matching_sections.append(
            MatchingSection(
                student_section_number=i + 1,
                reference_section_number=best_ref_idx + 1,
                student_text=s_text,
                reference_text=best_ref_text,
                similarity=round(bounded_score, 4),
                percentage=similarity_pct,
                classification=classification,

                # Backward compatibility aliases
                student_index=i + 1,
                reference_index=best_ref_idx + 1,
                similarity_score=round(bounded_score, 4),
                similarity_percentage=similarity_pct
            )
        )

    # Sort matches from highest similarity score to lowest as required
    matching_sections.sort(key=lambda x: x.similarity, reverse=True)

    # Overall score calculation: mean semantic similarity across student sections
    overall_avg_score = (total_score_sum / len(student_sections)) if student_sections else 0.0
    overall_pct = round(overall_avg_score * 100, 1)
    risk_level = calculate_risk_level(overall_pct)

    summary = SummaryMetrics(
        total_sections=len(student_sections),
        overall_similarity=round(overall_avg_score, 4),
        overall_similarity_percentage=overall_pct,
        risk_level=risk_level,
        highly_similar_count=highly_similar_count,
        paraphrased_count=paraphrased_count,
        original_count=original_count
    )

    return AnalysisResponse(
        summary=summary,
        sections=matching_sections,
        reference_section_count=len(reference_sections),
        student_section_count=len(student_sections),
        thresholds={
            "highly_similar": high_threshold,
            "paraphrase": para_threshold
        }
    )
