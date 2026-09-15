import os
import sys
from app.analyzer import analyze_semantic_similarity, get_model
from app.config import settings

def run_test_suite():
    print("==================================================================")
    print("SEMANTICHECK AI/NLP ENGINE VALIDATION & THRESHOLD CALIBRATION")
    print("==================================================================\n")

    # 1. Verify Model Singleton Reuse
    m1 = get_model()
    m2 = get_model()
    assert m1 is m2, "Model singleton failed! Model was reloaded."
    print("✔ Model singleton verified (loaded once and reused in memory).\n")

    # Defined 5 Test Scenarios from prompt specification
    test_cases = [
        {
            "name": "Exact copy",
            "ref": ["Artificial intelligence enables computers to perform tasks that normally require human intelligence."],
            "stu": ["Artificial intelligence enables computers to perform tasks that normally require human intelligence."]
        },
        {
            "name": "Strong paraphrase",
            "ref": ["Artificial intelligence enables computers to perform tasks that normally require human intelligence."],
            "stu": ["AI allows machines to accomplish activities that generally need human reasoning."]
        },
        {
            "name": "Strong paraphrase 2",
            "ref": ["Machine learning algorithms identify patterns in large datasets to make predictions."],
            "stu": ["ML techniques discover patterns within huge collections of data and use them to predict outcomes."]
        },
        {
            "name": "Weak paraphrase",
            "ref": ["Machine learning algorithms identify patterns in large datasets to make predictions."],
            "stu": ["Machine learning can analyze data and sometimes help systems make predictions."]
        },
        {
            "name": "Unrelated",
            "ref": ["Machine learning algorithms identify patterns in large datasets to make predictions."],
            "stu": ["Football is one of the most popular sports in the world."]
        }
    ]

    print("Executing test set against current config thresholds:")
    print(f"  HIGHLY_SIMILAR_THRESHOLD = {settings.HIGHLY_SIMILAR_THRESHOLD} ({int(settings.HIGHLY_SIMILAR_THRESHOLD*100)}%)")
    print(f"  PARAPHRASE_THRESHOLD     = {settings.PARAPHRASE_THRESHOLD} ({int(settings.PARAPHRASE_THRESHOLD*100)}%)\n")

    table_rows = []

    for tc in test_cases:
        res = analyze_semantic_similarity(tc["stu"], tc["ref"])
        match = res.sections[0]
        table_rows.append({
            "test": tc["name"],
            "similarity": f"{match.similarity_percentage}%",
            "classification": match.classification,
            "raw_score": match.similarity
        })

    # Print Formatted Table requested by prompt
    print("=" * 65)
    print(f"{'Test':<22} | {'Similarity':<12} | {'Classification':<22}")
    print("-" * 65)
    for r in table_rows:
        print(f"{r['test']:<22} | {r['similarity']:<12} | {r['classification']:<22}")
    print("=" * 65 + "\n")

    # Assertions to ensure intuitive logic holds true
    exact_match = table_rows[0]
    assert exact_match["raw_score"] >= 0.95, "Exact copy failed high similarity check."
    assert exact_match["classification"] == "Highly Similar", "Exact copy classification mismatch."

    strong_para1 = table_rows[1]
    assert strong_para1["raw_score"] >= 0.75, "Strong paraphrase 1 failed threshold."
    assert strong_para1["classification"] == "Highly Similar", "Strong paraphrase 1 classification mismatch."

    strong_para2 = table_rows[2]
    assert strong_para2["raw_score"] >= 0.55, "Strong paraphrase 2 failed threshold."
    assert strong_para2["classification"] in ["Highly Similar", "Potential Paraphrase"], "Strong paraphrase 2 classification mismatch."

    weak_para = table_rows[3]
    assert weak_para["raw_score"] >= 0.55, "Weak paraphrase failed threshold."
    assert weak_para["classification"] == "Potential Paraphrase", "Weak paraphrase classification mismatch."

    unrelated = table_rows[4]
    assert unrelated["raw_score"] < 0.55, "Unrelated text falsely flagged."
    assert unrelated["classification"] == "Likely Original", "Unrelated text classification mismatch."

    print("✔ All intuitive behavior assertions PASSED successfully!\n")

if __name__ == "__main__":
    run_test_suite()
