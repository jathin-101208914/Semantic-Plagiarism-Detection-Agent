import React from 'react';
import { ArrowRight, AlertCircle, Copy, CheckCircle } from 'lucide-react';

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
        icon: <Copy className="w-3.5 h-3.5 text-rose-400" />,
        bar: 'bg-rose-500'
      };
    }
    if (tier === 'Potential Paraphrase') {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
        bar: 'bg-amber-500'
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      bar: 'bg-emerald-500'
    };
  };

  const style = getBadgeStyle(classification);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4 relative overflow-hidden">
      
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
            <span className="font-mono text-[11px] text-slate-500">Sentence #{student_index}</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
            "{student_text}"
          </p>
        </div>

        {/* Reference Text Column */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
            <span>Original Reference Candidate</span>
            <span className="font-mono text-[11px] text-slate-500">Sentence #{reference_index}</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans italic">
            "{reference_text}"
          </p>
        </div>

      </div>

    </div>
  );
}
