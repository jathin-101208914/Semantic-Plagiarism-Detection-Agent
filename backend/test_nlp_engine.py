import sys
import os
from app.analyzer import analyze_semantic_similarity, get_model
from app.config import settings

def run_comprehensive_tests():
    print("==================================================")
    print("SEMANTICHECK AI/NLP ENGINE VALIDATION & BENCHMARK")
    print("==================================================\n")

    # Pre-warm model & verify singleton reuse
    m1 = get_model()
    m2 = get_model()
    assert m1 is m2, "Model singleton failed! Model was reloaded."
    print("✔ Model singleton verified (loaded once and reused in memory).\n")

    test_results = {}

    # ----------------------------------------------------
    # TEST 1: Exact Copy
    # ----------------------------------------------------
    ref_1 = ["Machine learning algorithms learn patterns from large datasets."]
    stu_1 = ["Machine learning algorithms learn patterns from large datasets."]
    res_1 = analyze_semantic_similarity(stu_1, ref_1)
    score_1 = res_1.sections[0].percentage
    class_1 = res_1.sections[0].classification
    test_results["1_exact_copy"] = {
        "score": score_1,
        "classification": class_1,
        "pass": score_1 >= 95.0 and class_1 == "Highly Similar"
    }
    print(f"[TEST 1: Exact Copy] Score: {score_1}% | Tier: {class_1} | Status: {'PASS' if test_results['1_exact_copy']['pass'] else 'FAIL'}")

    # ----------------------------------------------------
    # TEST 2: Strong Paraphrase (Mandatory Prompt Test Case)
    # ----------------------------------------------------
    ref_2 = ["Artificial intelligence enables computers to perform tasks that normally require human intelligence."]
    stu_2 = ["AI allows machines to accomplish activities that generally need human reasoning."]
    res_2 = analyze_semantic_similarity(stu_2, ref_2)
    score_2 = res_2.sections[0].percentage
    class_2 = res_2.sections[0].classification
    test_results["2_strong_paraphrase"] = {
        "score": score_2,
        "classification": class_2,
        "pass": score_2 >= 70.0 and class_2 in ["Highly Similar", "Potential Paraphrase"]
    }
    print(f"[TEST 2: Strong Paraphrase] Score: {score_2}% | Tier: {class_2} | Status: {'PASS' if test_results['2_strong_paraphrase']['pass'] else 'FAIL'}")
    print(f"  Reference: '{ref_2[0]}'")
    print(f"  Student:   '{stu_2[0]}'")

    # ----------------------------------------------------
    # TEST 3: Weak Paraphrase
    # ----------------------------------------------------
    ref_3 = ["Governments across Europe and North America are developing comprehensive regulatory frameworks to govern high-risk artificial intelligence applications."]
    stu_3 = ["State officials are considering new laws regarding automated decision software."]
    res_3 = analyze_semantic_similarity(stu_3, ref_3)
    score_3 = res_3.sections[0].percentage
    class_3 = res_3.sections[0].classification
    test_results["3_weak_paraphrase"] = {
        "score": score_3,
        "classification": class_3,
        "pass": 45.0 <= score_3 <= 80.0
    }
    print(f"\n[TEST 3: Weak Paraphrase] Score: {score_3}% | Tier: {class_3} | Status: {'PASS' if test_results['3_weak_paraphrase']['pass'] else 'FAIL'}")

    # ----------------------------------------------------
    # TEST 4: Completely Unrelated Content (Mandatory Prompt Test Case)
    # ----------------------------------------------------
    ref_4 = ["Machine learning algorithms learn patterns from large datasets."]
    stu_4 = ["Football is one of the most popular sports in the world."]
    res_4 = analyze_semantic_similarity(stu_4, ref_4)
    score_4 = res_4.sections[0].percentage
    class_4 = res_4.sections[0].classification
    test_results["4_unrelated_content"] = {
        "score": score_4,
        "classification": class_4,
        "pass": score_4 < 40.0 and class_4 == "Likely Original"
    }
    print(f"\n[TEST 4: Unrelated Content] Score: {score_4}% | Tier: {class_4} | Status: {'PASS' if test_results['4_unrelated_content']['pass'] else 'FAIL'}")
    print(f"  Reference: '{ref_4[0]}'")
    print(f"  Student:   '{stu_4[0]}'")

    # ----------------------------------------------------
    # TEST 5: Multiple Sections & Sorting Order Verification
    # ----------------------------------------------------
    ref_5 = [
        "Artificial intelligence enables computers to perform tasks that normally require human intelligence.",
        "Machine learning algorithms learn patterns from large datasets.",
        "Autonomous vehicles rely on computer vision and LIDAR sensors for navigation."
    ]
    stu_5 = [
        "Football is one of the most popular sports in the world.", # Unrelated -> low score
        "AI allows machines to accomplish activities that generally need human reasoning.", # Strong paraphrase -> high score
        "Machine learning algorithms learn patterns from large datasets." # Exact copy -> highest score
    ]
    res_5 = analyze_semantic_similarity(stu_5, ref_5)
    
    # Verify matches are sorted descending by similarity score
    scores = [sec.similarity for sec in res_5.sections]
    is_sorted = scores == sorted(scores, reverse=True)
    test_results["5_multiple_sections_sorting"] = {
        "is_sorted": is_sorted,
        "scores": scores,
        "pass": is_sorted and len(res_5.sections) == 3
    }
    print(f"\n[TEST 5: Multiple Sections & Sorting] Sorted Descending: {is_sorted} | Status: {'PASS' if is_sorted else 'FAIL'}")
    for idx, sec in enumerate(res_5.sections):
        print(f"  Match #{idx+1}: Score={sec.percentage}% | Tier={sec.classification} | Student S#{sec.student_section_number} -> Ref R#{sec.reference_section_number}")

    # ----------------------------------------------------
    # TEST 6: Empty Input
    # ----------------------------------------------------
    res_6 = analyze_semantic_similarity([], ["Reference text"])
    test_results["6_empty_input"] = {
        "total_sections": res_6.summary.total_sections,
        "pass": res_6.summary.total_sections == 0 and len(res_6.sections) == 0
    }
    print(f"\n[TEST 6: Empty Input] Handled gracefully | Status: {'PASS' if test_results['6_empty_input']['pass'] else 'FAIL'}")

    print("\n==================================================")
    print("ALL NLP BENCHMARKS EXECUTED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_comprehensive_tests()
