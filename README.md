# SemantiCheck — Semantic Plagiarism Detection Agent

## Overview

**SemantiCheck** is an intelligent plagiarism detection system that detects similarity based on the **meaning of content**, rather than simply matching words.

Traditional plagiarism checkers can miss paraphrased content when sentences are rewritten using different words or structures. SemantiCheck addresses this by analyzing the semantic relationship between a reference document and a student document.

## What It Does

The system allows users to provide:

- **Reference Document** — the original/source material
- **Student Document** — the content that needs to be checked

SemantiCheck then:

1. Extracts and processes the text.
2. Divides the content into meaningful sections.
3. Analyzes the semantic meaning of each section.
4. Compares student content with the reference content.
5. Identifies the most similar reference section.
6. Calculates similarity percentages.
7. Classifies the content as **Highly Similar**, **Potential Paraphrase**, or **Likely Original**.
8. Presents the findings through a results dashboard and plagiarism report.

## How It Works

```text
Reference Document ──┐
                     ├──> Text Processing
Student Document ────┘
                           ↓
                    Semantic Analysis
                           ↓
                   Similarity Comparison
                           ↓
                  Section-Level Matching
                           ↓
                  Similarity Classification
                           ↓
                    Results & Report
