import React, { useRef } from 'react';
import { X, Download, FileText, Shield, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';

/**
 * ReportModal — generates a full plagiarism report from the real API response.
 * Supports:
 *   1. In-browser styled view
 *   2. Browser print (window.print) which captures the #report-printable div
 *   3. Download as .txt plain-text report
 *
 * No external PDF libraries are used for hackathon stability.
 */
export default function ReportModal({ isOpen, onClose, analysisResult, thresholds }) {
  const printRef = useRef(null);

  if (!isOpen || !analysisResult) return null;

  const { summary, sections, reference_section_count, student_section_count } = analysisResult;
  const ts = new Date().toLocaleString();

  const riskColor = (label) => {
    if (label === 'HIGH PLAGIARISM RISK') return '#f43f5e';
    if (label === 'MODERATE PARAPHRASE RISK') return '#f59e0b';
    return '#10b981';
  };

  const classColor = (c) => {
    if (c === 'Highly Similar') return 'text-rose-400';
    if (c === 'Potential Paraphrase') return 'text-amber-400';
    return 'text-emerald-400';
  };

  const flaggedSections = sections.filter(
    (s) => s.classification === 'Highly Similar' || s.classification === 'Potential Paraphrase'
  );

  // ---- Plain-text report builder ----
  const buildTextReport = () => {
    const lines = [
      '==================================================================',
      '  SEMANTICHECK — SEMANTIC PLAGIARISM DETECTION REPORT',
      '==================================================================',
      `  Generated: ${ts}`,
      `  Model: sentence-transformers/all-MiniLM-L6-v2`,
      `  Detection method: Semantic embedding cosine similarity`,
      '',
      '--- SUMMARY ---',
      `  Overall Semantic Similarity : ${summary.overall_similarity_percentage}%`,
      `  Risk Level                  : ${summary.risk_level || 'N/A'}`,
      `  Reference Sections          : ${reference_section_count}`,
      `  Student Sections Analyzed   : ${student_section_count}`,
      `  Total Student Sections      : ${summary.total_sections}`,
      `  Highly Similar              : ${summary.highly_similar_count}`,
      `  Potential Paraphrase        : ${summary.paraphrased_count}`,
      `  Likely Original             : ${summary.original_count}`,
      '',
      '--- THRESHOLDS USED ---',
      `  Highly Similar Cutoff  : >= ${Math.round(thresholds.highly_similar * 100)}%`,
      `  Paraphrase Cutoff      : >= ${Math.round(thresholds.paraphrase * 100)}%`,
      '',
      '==================================================================',
      '  FLAGGED SECTION DETAILS',
      '==================================================================',
      ...flaggedSections.flatMap((sec, i) => [
        '',
        `[${i + 1}] Section #${sec.student_index} — ${sec.classification} (${sec.similarity_percentage}%)`,
        `  Student text : "${sec.student_text}"`,
        `  Ref #${sec.reference_index}      : "${sec.reference_text}"`,
      ]),
      '',
      '--- ALL SECTIONS ---',
      ...sections.map((sec) =>
        `  S#${sec.student_index} vs R#${sec.reference_index} | ${sec.similarity_percentage}% | ${sec.classification}`
      ),
      '',
      '==================================================================',
      '  NOTE: Similarity is computed semantically via neural embeddings.',
      '  A high score indicates similar MEANING, not identical wording.',
      '==================================================================',
    ];
    return lines.join('\n');
  };

  const handleDownloadTxt = () => {
    const text = buildTextReport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semanticheck-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>SemantiCheck Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f1f5f9; padding: 2rem; }
            h1 { color: #818cf8; } h2 { color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: .5rem; }
            .badge-high { color: #f43f5e; } .badge-para { color: #f59e0b; } .badge-orig { color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { padding: .5rem .75rem; text-align: left; border: 1px solid #334155; font-size: 0.85rem; }
            th { background: #1e293b; color: #94a3b8; }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
            p { font-size: 0.85rem; color: #94a3b8; }
            @media print { body { background: white; color: black; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[90vh] glass-panel-glow rounded-2xl flex flex-col border border-indigo-500/30 shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">SemantiCheck — Plagiarism Report</h2>
              <p className="text-xs text-slate-400">Generated {ts}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-bg hover:opacity-95 text-white text-xs font-bold shadow"
            >
              <FileText className="w-3.5 h-3.5" />
              Print Report
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6" ref={printRef}>

          {/* Title Block */}
          <div className="text-center border-b border-slate-800 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-extrabold text-white">SemantiCheck</h1>
            </div>
            <p className="text-sm text-slate-400">Semantic Plagiarism Detection Report</p>
            <p className="text-xs text-slate-500 mt-1">Model: all-MiniLM-L6-v2 · Detection: Semantic Embedding Cosine Similarity</p>
          </div>

          {/* Overall Summary */}
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-3xl font-extrabold font-mono text-white">{summary.overall_similarity_percentage}%</p>
                <p className="text-[11px] text-slate-400 mt-1">Overall Similarity</p>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-3xl font-extrabold font-mono text-white">{summary.total_sections}</p>
                <p className="text-[11px] text-slate-400 mt-1">Sections Analyzed</p>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-3xl font-extrabold font-mono text-rose-400">{summary.highly_similar_count}</p>
                <p className="text-[11px] text-slate-400 mt-1">Highly Similar</p>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                <p className="text-3xl font-extrabold font-mono text-amber-400">{summary.paraphrased_count}</p>
                <p className="text-[11px] text-slate-400 mt-1">Paraphrased</p>
              </div>
            </div>

            {/* Risk badge */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Risk Assessment:</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{ color: riskColor(summary.risk_level), borderColor: riskColor(summary.risk_level) + '44', background: riskColor(summary.risk_level) + '11' }}
              >
                {summary.risk_level || 'N/A'}
              </span>
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Thresholds Used</h2>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-300">
                Highly Similar ≥ {Math.round(thresholds.highly_similar * 100)}%
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                Paraphrase ≥ {Math.round(thresholds.paraphrase * 100)}%
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300">
                Likely Original &lt; {Math.round(thresholds.paraphrase * 100)}%
              </span>
            </div>
          </div>

          {/* Flagged Sections */}
          {flaggedSections.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                Flagged Sections ({flaggedSections.length})
              </h2>
              <div className="space-y-3">
                {flaggedSections.map((sec, i) => (
                  <div key={sec.student_index} className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Student Section #{sec.student_index}
                        </span>
                        <span className={`text-xs font-bold ${classColor(sec.classification)}`}>
                          {sec.classification}
                        </span>
                      </div>
                      <span className="text-sm font-extrabold font-mono text-white">
                        {sec.similarity_percentage}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-purple-500/20 bg-slate-950/50">
                        <p className="text-purple-300 font-semibold mb-1">Student</p>
                        <p className="text-slate-300 leading-relaxed">"{sec.student_text}"</p>
                      </div>
                      <div className="p-3 rounded-lg border border-indigo-500/20 bg-slate-950/50">
                        <p className="text-indigo-300 font-semibold mb-1">Reference #{sec.reference_index}</p>
                        <p className="text-slate-400 leading-relaxed italic">"{sec.reference_text}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Section Table */}
          <div>
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              All Sections ({sections.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400">
                    <th className="px-4 py-2.5 text-left font-semibold">Student §</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Ref §</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Similarity</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Classification</th>
                    <th className="px-4 py-2.5 text-left font-semibold hidden md:table-cell">Student Text (excerpt)</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec, idx) => (
                    <tr
                      key={sec.student_index}
                      className={`border-t border-slate-800/60 ${idx % 2 === 0 ? 'bg-slate-900/20' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-300">#{sec.student_index}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">#{sec.reference_index}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-white">{sec.similarity_percentage}%</td>
                      <td className={`px-4 py-2.5 font-semibold ${classColor(sec.classification)}`}>
                        {sec.classification}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 hidden md:table-cell truncate max-w-xs">
                        {sec.student_text.slice(0, 80)}{sec.student_text.length > 80 ? '…' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-slate-500 text-center pt-2 border-t border-slate-800">
            Detection is based on semantic meaning via neural sentence embeddings, not keyword or n-gram matching.
            A high similarity score reflects similar intent and concept, not copied wording.
          </div>

        </div>
      </div>
    </div>
  );
}
