import React from 'react';
import { AlertTriangle, CheckCircle2, Copy, FileCode2, Hash } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const {
    overall_similarity_percentage,
    total_sections,
    highly_similar_count,
    paraphrased_count,
    original_count,
    // risk_level from backend if present, else compute locally as fallback
    risk_level: apiRiskLevel,
  } = summary;

  // Use the server-computed risk level if available; otherwise compute locally
  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'HIGH PLAGIARISM RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (score >= 40) return { label: 'MODERATE PARAPHRASE RISK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'LOW / CLEAN', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const riskLabel = apiRiskLevel || getRiskLevel(overall_similarity_percentage).label;
  const riskStyle = getRiskLevel(overall_similarity_percentage);

  const flaggedPct = total_sections > 0
    ? Math.round(((highly_similar_count + paraphrased_count) / total_sections) * 100)
    : 0;

  return (
    <div className="space-y-4 mb-8">

      {/* Main Score Hero Card */}
      <div className="glass-panel-glow rounded-2xl p-6 border border-indigo-500/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          {/* Big Percentage */}
          <div className="md:col-span-1 text-center md:text-left">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Overall Semantic Similarity
            </p>
            <div className="flex items-baseline gap-3 justify-center md:justify-start">
              <span className="text-6xl font-extrabold text-white font-mono tracking-tight">
                {overall_similarity_percentage}
              </span>
              <span className="text-2xl font-bold text-slate-400">%</span>
            </div>
            <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full border ${riskStyle.color}`}>
              {riskLabel}
            </span>
          </div>

          {/* Progress bar + breakdown */}
          <div className="md:col-span-2 space-y-4">
            {/* Visual bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Semantic similarity distribution</span>
                <span>{flaggedPct}% of sections flagged</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                {highly_similar_count > 0 && (
                  <div
                    className="h-full bg-rose-500 transition-all duration-700"
                    style={{ width: `${(highly_similar_count / total_sections) * 100}%` }}
                    title={`Highly Similar: ${highly_similar_count}`}
                  />
                )}
                {paraphrased_count > 0 && (
                  <div
                    className="h-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${(paraphrased_count / total_sections) * 100}%` }}
                    title={`Paraphrased: ${paraphrased_count}`}
                  />
                )}
                {original_count > 0 && (
                  <div
                    className="h-full bg-emerald-600 transition-all duration-700"
                    style={{ width: `${(original_count / total_sections) * 100}%` }}
                    title={`Original: ${original_count}`}
                  />
                )}
              </div>
              <div className="flex gap-4 mt-1.5 text-[11px]">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Highly Similar
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Paraphrased
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Likely Original
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Weighted mean cosine similarity across all <strong className="text-slate-300">{total_sections}</strong> student sections,
              using <code className="text-indigo-300">all-MiniLM-L6-v2</code> sentence embeddings.
              Detection is semantic — not based on keyword matching.
            </p>
          </div>

        </div>
      </div>

      {/* Four metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Sections */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sections</span>
            <Hash className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{total_sections}</span>
            <p className="text-[11px] text-slate-400 mt-1">Student sections analyzed</p>
          </div>
        </div>

        {/* Highly Similar */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Highly Similar</span>
            <Copy className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{highly_similar_count}</span>
            <p className="text-[11px] text-slate-400 mt-1">Direct / near-identical meaning</p>
          </div>
        </div>

        {/* Paraphrased */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Paraphrased</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{paraphrased_count}</span>
            <p className="text-[11px] text-slate-400 mt-1">Rephrased semantic meaning</p>
          </div>
        </div>

        {/* Original */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Likely Original</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">{original_count}</span>
            <p className="text-[11px] text-slate-400 mt-1">Unique student phrasing</p>
          </div>
        </div>

      </div>
    </div>
  );
}
