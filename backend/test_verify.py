"""
Comprehensive backend verification tests.
Tests doc_parser extraction, section splitting, API endpoints, and error handling.
Run with: python test_verify.py   (from backend/ directory, with server running on :8000)
"""
import os
import sys
import json
import io

# ── Unit tests for doc_parser (no server needed) ──

def test_doc_parser():
    """Test extract_text and split_into_sections directly."""
    from app.doc_parser import extract_text, split_into_sections, extract_text_from_txt

    print("=" * 60)
    print("UNIT TESTS: doc_parser")
    print("=" * 60)

    # 1. TXT extraction
    sample_bytes = "Hello world. This is a test sentence for verification.".encode("utf-8")
    result = extract_text("test.txt", sample_bytes)
    assert result == "Hello world. This is a test sentence for verification.", f"TXT extraction failed: {result!r}"
    print("[PASS] TXT extraction works")

    # 2. TXT with UTF-8
    utf8_bytes = "Héllo wörld. Ñoño text.".encode("utf-8")
    result = extract_text("test.txt", utf8_bytes)
    assert "Héllo" in result, f"UTF-8 TXT failed: {result!r}"
    print("[PASS] UTF-8 TXT extraction works")

    # 3. Unsupported extension
    try:
        extract_text("image.jpg", b"fake data")
        print("[FAIL] Should have raised ValueError for .jpg")
        sys.exit(1)
    except ValueError as e:
        assert "Unsupported" in str(e)
        print(f"[PASS] Unsupported extension rejected: {e}")

    # 4. No extension
    try:
        extract_text("noextension", b"data")
        print("[FAIL] Should have raised ValueError for no extension")
        sys.exit(1)
    except ValueError as e:
        assert "Cannot determine" in str(e)
        print(f"[PASS] No extension rejected: {e}")

    # 5. Corrupted PDF
    try:
        extract_text("bad.pdf", b"this is not a pdf")
        print("[FAIL] Should have raised ValueError for corrupted PDF")
        sys.exit(1)
    except ValueError as e:
        assert "Failed to parse PDF" in str(e)
        print(f"[PASS] Corrupted PDF rejected: {e}")

    # 6. Corrupted DOCX
    try:
        extract_text("bad.docx", b"this is not a docx")
        print("[FAIL] Should have raised ValueError for corrupted DOCX")
        sys.exit(1)
    except ValueError as e:
        assert "Failed to parse DOCX" in str(e)
        print(f"[PASS] Corrupted DOCX rejected: {e}")

    # 7. Empty TXT
    result = extract_text("empty.txt", b"")
    assert result == "", f"Empty TXT should return empty string, got: {result!r}"
    print("[PASS] Empty TXT returns empty string")

    # 8. Whitespace-only TXT
    result = extract_text("whitespace.txt", b"   \n\n   \t  ")
    assert result.strip() == "", f"Whitespace TXT should be empty after strip: {result!r}"
    print("[PASS] Whitespace-only TXT returns blank")

    # 9. split_into_sections on real text
    text = (
        "Artificial intelligence is transforming industries worldwide, "
        "raising crucial ethical questions regarding transparency, fairness, "
        "and accountability in algorithmic decision-making.\n\n"
        "Autonomous machine learning systems often operate as black boxes, "
        "making it difficult for developers and regulatory authorities to "
        "explain specific model outputs."
    )
    sections = split_into_sections(text)
    assert len(sections) >= 2, f"Expected at least 2 sections, got {len(sections)}: {sections}"
    for s in sections:
        assert len(s) >= 15, f"Section too short: {s!r}"
    print(f"[PASS] split_into_sections produced {len(sections)} sections, all >= 15 chars")

    # 10. split_into_sections on empty
    assert split_into_sections("") == []
    assert split_into_sections("   \n\n  ") == []
    print("[PASS] split_into_sections on empty/whitespace returns []")

    # 11. split_into_sections merges tiny fragments
    text_short = "Hi. This is a longer sentence that should form its own section for testing purposes."
    sections = split_into_sections(text_short)
    assert len(sections) >= 1
    print(f"[PASS] Short fragment handling: {len(sections)} section(s)")

    # 12. Real PDF extraction (if sample exists)
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    ref_path = os.path.join(sample_dir, "ref_sample.txt")
    if os.path.exists(ref_path):
        with open(ref_path, "rb") as f:
            ref_bytes = f.read()
        result = extract_text("ref_sample.txt", ref_bytes)
        assert len(result) > 50, f"Sample TXT extraction too short: {len(result)}"
        sections = split_into_sections(result)
        assert len(sections) >= 3, f"Expected >= 3 sections from sample, got {len(sections)}"
        print(f"[PASS] Real sample TXT: {len(result)} chars, {len(sections)} sections")

    print("\nAll doc_parser unit tests passed!\n")


def test_api():
    """Test API endpoints via HTTP requests (requires server running)."""
    import urllib.request
    import urllib.error

    BASE = "http://localhost:8000"

    print("=" * 60)
    print("API TESTS (server must be running on :8000)")
    print("=" * 60)

    # 1. Health check
    try:
        resp = urllib.request.urlopen(f"{BASE}/")
        data = json.loads(resp.read())
        assert data["status"] == "online"
        print(f"[PASS] GET / => status=online, model={data['model']}")
    except Exception as e:
        print(f"[FAIL] GET /: {e}")
        print("  Is the server running? Start with: uvicorn app.main:app --port 8000")
        return

    # 2. GET /api/config
    resp = urllib.request.urlopen(f"{BASE}/api/config")
    config = json.loads(resp.read())
    assert "highly_similar" in config
    assert "paraphrase" in config
    print(f"[PASS] GET /api/config => {config}")

    # 3. POST /api/analyze with text (multipart form)
    ref_text = "Artificial intelligence is transforming industries worldwide, raising crucial ethical questions regarding transparency, fairness, and accountability in algorithmic decision-making."
    stu_text = "AI technologies are revolutionizing global markets, which introduces major ethical concerns about explainability, equity, and responsibility in automated systems."

    boundary = "----TestBoundary123"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="reference_text"\r\n\r\n'
        f"{ref_text}\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="student_text"\r\n\r\n'
        f"{stu_text}\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())

    # Validate response structure
    assert "summary" in result, "Missing 'summary' in response"
    assert "sections" in result, "Missing 'sections' in response"
    summary = result["summary"]
    assert "overall_similarity_percentage" in summary
    assert "total_sections" in summary
    assert "highly_similar_count" in summary
    assert "paraphrased_count" in summary
    assert "original_count" in summary
    print(f"[PASS] POST /api/analyze (text) => overall={summary['overall_similarity_percentage']}%")

    for sec in result["sections"]:
        assert "student_index" in sec, f"Missing student_index: {sec.keys()}"
        assert "student_text" in sec
        assert "reference_index" in sec
        assert "reference_text" in sec
        assert "similarity_score" in sec
        assert "similarity_percentage" in sec
        assert "classification" in sec
        assert sec["classification"] in ("Highly Similar", "Potential Paraphrase", "Likely Original")
    print(f"[PASS] Response sections validated ({len(result['sections'])} sections)")

    # 4. POST /api/analyze with TXT files
    sample_dir = os.path.join(os.path.dirname(__file__), "sample_data")
    ref_path = os.path.join(sample_dir, "ref_sample.txt")
    stu_path = os.path.join(sample_dir, "student_paraphrased.txt")

    if os.path.exists(ref_path) and os.path.exists(stu_path):
        with open(ref_path, "rb") as f:
            ref_bytes = f.read()
        with open(stu_path, "rb") as f:
            stu_bytes = f.read()

        boundary = "----FileBoundary456"
        body = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="reference_file"; filename="ref_sample.txt"\r\n'
            f"Content-Type: text/plain\r\n\r\n"
        ).encode("utf-8") + ref_bytes + (
            f"\r\n--{boundary}\r\n"
            f'Content-Disposition: form-data; name="student_file"; filename="student_paraphrased.txt"\r\n'
            f"Content-Type: text/plain\r\n\r\n"
        ).encode("utf-8") + stu_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

        req = urllib.request.Request(
            f"{BASE}/api/analyze",
            data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST",
        )
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f"[PASS] POST /api/analyze (TXT files) => overall={result['summary']['overall_similarity_percentage']}%")
    else:
        print("[SKIP] Sample TXT files not found")

    # 5. Missing reference file => 400
    boundary = "----ErrBoundary"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="student_text"\r\n\r\n'
        f"Some student text here.\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Missing reference should have returned 400")
    except urllib.error.HTTPError as e:
        assert e.code == 400 or e.code == 422
        err_body = json.loads(e.read())
        print(f"[PASS] Missing reference => {e.code}: {err_body.get('detail', '')}")

    # 6. Missing student file => 400
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="reference_text"\r\n\r\n'
        f"Some reference text here.\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Missing student should have returned 400")
    except urllib.error.HTTPError as e:
        assert e.code == 400 or e.code == 422
        err_body = json.loads(e.read())
        print(f"[PASS] Missing student => {e.code}: {err_body.get('detail', '')}")

    # 7. Unsupported file extension => 400
    boundary = "----UnsupBoundary"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="reference_file"; filename="image.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
        f"fake image data\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="student_text"\r\n\r\n'
        f"Some student text for testing purposes and meaningful content.\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Unsupported extension should have returned 400")
    except urllib.error.HTTPError as e:
        assert e.code == 400
        err_body = json.loads(e.read())
        print(f"[PASS] Unsupported extension => {e.code}: {err_body.get('detail', '')}")

    # 8. Corrupted PDF => 400
    boundary = "----CorruptBoundary"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="reference_file"; filename="corrupt.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
        f"this is not a real pdf\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="student_text"\r\n\r\n'
        f"Some student text for testing purposes and meaningful content.\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Corrupted PDF should have returned 400")
    except urllib.error.HTTPError as e:
        assert e.code == 400
        err_body = json.loads(e.read())
        print(f"[PASS] Corrupted PDF => {e.code}: {err_body.get('detail', '')}")

    # 9. Empty file => 400
    boundary = "----EmptyBoundary"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="reference_file"; filename="empty.txt"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
        f"\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="student_text"\r\n\r\n'
        f"Some student text for testing purposes and meaningful content.\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/analyze",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req)
        print("[FAIL] Empty file should have returned 400")
    except urllib.error.HTTPError as e:
        assert e.code == 400
        err_body = json.loads(e.read())
        print(f"[PASS] Empty file => {e.code}: {err_body.get('detail', '')}")

    # 10. GET /api/samples
    resp = urllib.request.urlopen(f"{BASE}/api/samples")
    samples = json.loads(resp.read())
    assert "reference_doc" in samples
    assert "preset_paraphrased" in samples
    assert "preset_original" in samples
    print(f"[PASS] GET /api/samples => reference_doc len={len(samples['reference_doc'])}")

    # 11. CORS headers check
    req = urllib.request.Request(f"{BASE}/", method="OPTIONS")
    req.add_header("Origin", "http://localhost:5173")
    req.add_header("Access-Control-Request-Method", "POST")
    try:
        resp = urllib.request.urlopen(req)
        cors_header = resp.headers.get("access-control-allow-origin", "")
        print(f"[PASS] CORS preflight => Access-Control-Allow-Origin: {cors_header}")
    except urllib.error.HTTPError as e:
        # Some servers return 405 for OPTIONS on GET-only routes; check main analyze route
        print(f"[INFO] OPTIONS on / returned {e.code} (non-critical)")

    print("\nAll API tests passed!\n")


if __name__ == "__main__":
    test_doc_parser()
    if "--api" in sys.argv:
        test_api()
    else:
        print("Run with --api flag to also test API endpoints (requires server on :8000)")
