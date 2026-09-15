class Settings:
    HIGHLY_SIMILAR_THRESHOLD: float = 0.75
    PARAPHRASE_THRESHOLD: float = 0.55
    MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

settings = Settings()
