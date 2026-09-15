from pydantic import BaseModel, Field
from typing import List, Optional

class MatchingSection(BaseModel):
    student_index: int
    student_text: str
    reference_index: int
    reference_text: str
    similarity_score: float
    similarity_percentage: float
    classification: str  # "Highly Similar", "Potential Paraphrase", "Likely Original"

class SummaryMetrics(BaseModel):
    total_sections: int
    overall_similarity_percentage: float
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
