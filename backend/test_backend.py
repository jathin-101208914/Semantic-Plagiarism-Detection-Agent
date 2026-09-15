import os
from app.doc_parser import split_into_sections
from app.analyzer import analyze_semantic_similarity

def test_semantic_pipeline():
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    ref_path = os.path.join(sample_dir, "ref_sample.txt")
    para_path = os.path.join(sample_dir, "student_paraphrased.txt")

    ref_text = open(ref_path).read()
    para_text = open(para_path).read()

    ref_sections = split_into_sections(ref_text)
    para_sections = split_into_sections(para_text)

    print(f"Reference Sections ({len(ref_sections)}):")
    for i, s in enumerate(ref_sections):
        print(f"  [{i+1}] {s}")

    print(f"\nStudent Sections ({len(para_sections)}):")
    for i, s in enumerate(para_sections):
        print(f"  [{i+1}] {s}")

    res = analyze_semantic_similarity(para_sections, ref_sections)
    print("\n--- ANALYSIS RESULTS ---")
    print(f"Overall Similarity: {res.summary.overall_similarity_percentage}%")
    print(f"Highly Similar Count: {res.summary.highly_similar_count}")
    print(f"Paraphrased Count: {res.summary.paraphrased_count}")
    print(f"Original Count: {res.summary.original_count}")

    for sec in res.sections:
        print(f"\nStudent [{sec.student_index}]: '{sec.student_text[:50]}...'")
        print(f"Reference [{sec.reference_index}]: '{sec.reference_text[:50]}...'")
        print(f"Score: {sec.similarity_percentage}% | Classification: {sec.classification}")

if __name__ == "__main__":
    test_semantic_pipeline()
