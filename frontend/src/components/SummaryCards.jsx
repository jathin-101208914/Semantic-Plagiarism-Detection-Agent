import React from 'react';
import { AlertTriangle, CheckCircle2, Copy, FileCode2 } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const {
    overall_similarity_percentage,
    total_sections,
    highly_similar_count,
    paraphrased_count,
    original_count,
  } = summary;

  const getRiskLevel = (score) => {
    if (score >= 70) return { label: 'HIGH PLAGIARISM RISK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (score >= 40) return { label: 'MODERATE PARAPHRASE RISK', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'LOW / CLEAN', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const risk = getRiskLevel(overall_similarity_percentage);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      
      {/* Overall Score Card */}
      <div className="sm:col-span-2 glass-panel-glow rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Semantic Similarity</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white font-mono">{overall_similarity_percentage}%</span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${risk.color}`}>
                {risk.label}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <FileCode2 className="w-7 h-7" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 gradient-bg"
              style={{ width: `${Math.min(100, overall_similarity_percentage)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Weighted semantic score across all {total_sections} student sections</p>
        </div>
      </div>

      {/* Highly Similar Count */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between border-l-4 border-l-rose-500">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Highly Similar</span>
          <Copy className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-extrabold text-white font-mono">{highly_similar_count}</span>
          <p className="text-[11px] text-slate-400 mt-1">Direct/Near-identical content</p>
        </div>
      </div>

      {/* Paraphrased Count */}
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

      {/* Original Count */}
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
  );
}
