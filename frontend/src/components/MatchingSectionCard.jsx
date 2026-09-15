import React from 'react';
import { AlertCircle, Copy, CheckCircle, Info } from 'lucide-react';

/**
 * Generates a plain-English, semantically-honest explanation for why a section
 * was flagged. Distinguishes between semantic detection and keyword matching.
 */
function getFlagExplanation(classification, similarity_percentage, student_text, reference_text) {
  const pct = typeof similarity_percentage === 'number'
    ? similarity_percentage
    : parseFloat(similarity_percentage) || 0;

  if (classification === 'Highly Similar') {
    if (pct >= 99) {
      return `Flagged as Highly Similar because this section is an exact or near-exact copy of the matched reference section (${pct}% semantic similarity).`;
    }
    return `Flagged as Highly Similar because this section carries ${pct}% semantic similarity with the matched reference — the meaning is almost identical even if some words differ.`;
  }

  if (classification === 'Potential Paraphrase') {
    return `Flagged as Potential Paraphrase because this section has ${pct}% semantic similarity with the matched reference section. The wording is substantially different, but the underlying meaning is closely aligned — a strong signal of paraphrasing detected through semantic embeddings, not keyword matching.`;
  }

  // Likely Original
  return `This section scored ${pct}% semantic similarity — below the paraphrase threshold. The content is considered likely original or sufficiently distinct in meaning from the reference document.`;
}

export default function MatchingSectionCard({ section }) {
  const {
    student_index,
    student_text,
    reference_index,
    reference_text,
    similarity_percentage,
    classification
  } = section;

  const getBadgeStyle = (tier) => {
    if (tier === 'Highly Similar') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
        leftBorder: 'border-l-rose-500',
        icon: <Copy className="w-3.5 h-3.5 text-rose-400" />,
        infoColor: 'text-rose-300 bg-rose-500/5 border-rose-500/20'
      };
    }
    if (tier === 'Potential Paraphrase') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        leftBorder: 'border-l-amber-500',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
        infoColor: 'text-amber-300 bg-amber-500/5 border-amber-500/20'
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      leftBorder: 'border-l-emerald-500',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      infoColor: 'text-emerald-300 bg-emerald-500/5 border-emerald-500/20'
    };
  };

  const style = getBadgeStyle(classification);
  const explanation = getFlagExplanation(classification, similarity_percentage, student_text, reference_text);
  const showExplanation = classification !== 'Likely Original';

  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative overflow-hidden border-l-4 ${style.leftBorder}`}>

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300">
            Section #{student_index}
          </span>
          <span className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${style.bg}`}>
            {style.icon}
            <span>{classification}</span>
          </span>
        </div>

        {/* Similarity Score Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Semantic Match:</span>
          <span className="text-base font-extrabold font-mono text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            {similarity_percentage}%
          </span>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Student Text Column */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>Student Submission</span>
            <span className="font-mono text-[11px] text-slate-500">Section #{student_index}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
            "{student_text}"
          </p>
        </div>

        {/* Reference Text Column */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
            <span>Matched Reference Section</span>
            <span className="font-mono text-[11px] text-slate-500">Ref #{reference_index}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans italic">
            "{reference_text}"
          </p>
        </div>

      </div>

      {/* "Why was this flagged?" explanation — only for flagged sections */}
      {showExplanation && (
        <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${style.infoColor}`}>
          <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
          <p>{explanation}</p>
        </div>
      )}

    </div>
  );
}
