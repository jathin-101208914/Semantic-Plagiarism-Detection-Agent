import os
import sys
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

def run_calibration():
    print("Loading sentence-transformers/all-MiniLM-L6-v2...")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    test_cases = [
        {
            "id": "Test 1 — Exact Copy",
            "ref": "Artificial intelligence enables computers to perform tasks that normally require human intelligence.",
            "stu": "Artificial intelligence enables computers to perform tasks that normally require human intelligence."
        },
        {
            "id": "Test 2 — Strong Paraphrase 1",
            "ref": "Artificial intelligence enables computers to perform tasks that normally require human intelligence.",
            "stu": "AI allows machines to accomplish activities that generally need human reasoning."
        },
        {
            "id": "Test 3 — Strong Paraphrase 2",
            "ref": "Machine learning algorithms identify patterns in large datasets to make predictions.",
            "stu": "ML techniques discover patterns within huge collections of data and use them to predict outcomes."
        },
        {
            "id": "Test 4 — Weak / Partial Paraphrase",
            "ref": "Machine learning algorithms identify patterns in large datasets to make predictions.",
            "stu": "Machine learning can analyze data and sometimes help systems make predictions."
        },
        {
            "id": "Test 5 — Unrelated Content",
            "ref": "Machine learning algorithms identify patterns in large datasets to make predictions.",
            "stu": "Football is one of the most popular sports in the world."
        }
    ]

    print("\n--- RAW EMBEDDING COSINE SIMILARITY SCORES ---")
    scores = []
    for tc in test_cases:
        emb_ref = model.encode([tc["ref"]], normalize_embeddings=True)
        emb_stu = model.encode([tc["stu"]], normalize_embeddings=True)
        sim = float(cosine_similarity(emb_stu, emb_ref)[0][0])
        bounded_sim = max(0.0, min(1.0, sim))
        pct = round(bounded_sim * 100, 2)
        scores.append((tc["id"], sim, pct))
        print(f"{tc['id']:<35} | Cosine Sim: {sim:.4f} | Percentage: {pct:.2f}%")

if __name__ == "__main__":
    run_calibration()
