from pydantic import BaseModel, Field
from typing import List, Optional

class MatchingSection(BaseModel):
    student_section_number: int
    reference_section_number: int
    student_text: str
    reference_text: str
    similarity: float
    percentage: float
    classification: str  # "Highly Similar", "Potential Paraphrase", "Likely Original"

    # Backward compatibility aliases for frontend components
    student_index: int
    reference_index: int
    similarity_score: float
    similarity_percentage: float

class SummaryMetrics(BaseModel):
    total_sections: int
    overall_similarity: float
    overall_similarity_percentage: float
    risk_level: str  # "HIGH PLAGIARISM RISK", "MODERATE PARAPHRASE RISK", "LOW / CLEAN"
    highly_similar_count: int
    paraphrased_count: int
    original_count: int

class AnalysisResponse(BaseModel):
    summary: SummaryMetrics
    sections: List[MatchingSection]
    reference_section_count: int
    student_section_count: int
    thresholds: dict

class ThresholdUpdateRequest(BaseModel):
    highly_similar: float = Field(..., ge=0.0, le=1.0)
    paraphrase: float = Field(..., ge=0.0, le=1.0)

class TextAnalysisRequest(BaseModel):
    reference_text: str
    student_text: str
    highly_similar_threshold: Optional[float] = None
    paraphrase_threshold: Optional[float] = None
