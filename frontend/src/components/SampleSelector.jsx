import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2 } from 'lucide-react';

export default function SampleSelector({ onSelectPreset, isLoading }) {
  const [selected, setSelected] = useState(null);

  const presets = [
    {
      id: 'paraphrased',
      title: 'Paraphrased AI Ethics Essay',
      tag: 'High Semantic Similarity',
      desc: 'Student submission uses synonym swaps & restructured sentence order to disguise stolen content.',
      color: 'from-amber-500/20 to-indigo-500/20 border-amber-500/30'
    },
    {
      id: 'original',
      title: 'Original Renewable Energy Essay',
      tag: 'Zero Similarity',
      desc: 'Completely different topic with 0% semantic overlap against reference document.',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30'
    }
  ];

  const handleSelect = (presetId) => {
    setSelected(presetId);
    onSelectPreset(presetId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto glass-panel rounded-2xl p-6 mb-8 border border-indigo-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-wide">1-Click Hackathon Test Demo Presets</h3>
        </div>
        <span className="text-xs text-slate-400">Load pre-configured test cases instantly</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map((p) => (
          <div
            key={p.id}
            onClick={() => !isLoading && handleSelect(p.id)}
            className={`p-4 rounded-xl border bg-gradient-to-r cursor-pointer transition-all flex items-start justify-between gap-4 ${
              p.color
            } ${selected === p.id ? 'ring-2 ring-indigo-500 shadow-lg scale-[1.01]' : 'hover:scale-[1.005] opacity-90 hover:opacity-100'}`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-900/80 text-slate-300 border border-slate-700">
                  {p.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
            </div>

            <button
              disabled={isLoading}
              className="mt-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
