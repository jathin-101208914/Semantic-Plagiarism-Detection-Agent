class Settings:
    HIGHLY_SIMILAR_THRESHOLD: float = 0.80
    PARAPHRASE_THRESHOLD: float = 0.60
    MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

settings = Settings()
