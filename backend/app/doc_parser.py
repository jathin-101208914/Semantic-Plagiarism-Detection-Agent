import re
import pymupdf  # PyMuPDF
import docx
from typing import List

def extract_text_from_pdf(stream: bytes) -> str:
    """Extracts text from PDF byte stream using PyMuPDF."""
    try:
        doc = pymupdf.open(stream=stream, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text

def extract_text_from_docx(stream: bytes) -> str:
    """Extracts text from DOCX byte stream using python-docx."""
    import io
    try:
        doc = docx.Document(io.BytesIO(stream))
    except Exception as e:
        raise ValueError(f"Failed to parse DOCX: {e}")
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

def extract_text_from_txt(stream: bytes) -> str:
    """Extracts text from TXT byte stream."""
    try:
        return stream.decode("utf-8")
    except UnicodeDecodeError:
        return stream.decode("latin-1", errors="ignore")

def extract_text(filename: str, file_bytes: bytes) -> str:
    """Routes file extraction based on extension."""
    if not filename or "." not in filename:
        raise ValueError(f"Cannot determine file type: '{filename}'. Supported formats: PDF, DOCX, TXT.")
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        return extract_text_from_docx(file_bytes)
    elif ext in ("txt", "md"):
        return extract_text_from_txt(file_bytes)
    else:
        raise ValueError(
            f"Unsupported file type '.{ext}'. Supported formats: PDF, DOCX, TXT."
        )

def clean_text(text: str) -> str:
    """Cleans text by removing unnecessary whitespace and formatting glitches."""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def split_into_sections(text: str) -> List[str]:
    """
    Splits text into meaningful semantic sections (sentences/short paragraphs).
    First attempts paragraph split; if paragraph is long, splits into sentences.
    """
    cleaned = clean_text(text)
    if not cleaned:
        return []

    # Regex for sentence splitting keeping punctuation attached
    sentence_pattern = re.compile(r'(?<=[.!?])\s+(?=[A-Z0-9"])')
    
    # Break into raw blocks by double newlines or single newlines
    raw_blocks = [b.strip() for b in cleaned.split('\n') if b.strip()]
    
    sections = []
    for block in raw_blocks:
        # If block is multiple sentences, split it
        sentences = sentence_pattern.split(block)
        for s in sentences:
            s_clean = s.strip()
            # Ignore trivial bullet points or single words (< 10 chars)
            if len(s_clean) >= 15:
                sections.append(s_clean)
            elif sections:
                # Append short fragments to previous section if appropriate
                sections[-1] += " " + s_clean

    # Fallback if no sections formed
    if not sections and cleaned:
        sections = [cleaned]

    return sections
