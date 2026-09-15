import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

export default function SampleSelector({ onSelectPreset, isLoading }) {
  const [selected, setSelected] = useState(null);
  const presets = [{ id: 'paraphrased', title: 'Paraphrased sample', desc: 'Load the backend’s paraphrased sample and analyze it.' }, { id: 'original', title: 'Original-content sample', desc: 'Load the backend’s alternate student sample and analyze it.' }];
  const select = (id) => { setSelected(id); onSelectPreset(id); };
  return <section className="w-full max-w-7xl mx-auto glass-panel rounded-2xl p-6 mb-8 border border-indigo-500/20" aria-label="Try a backend demo"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4"><div className="flex items-center gap-2.5"><Sparkles className="w-5 h-5 text-indigo-400" /><h2 className="text-base font-bold text-white">Try a live demo</h2></div><span className="text-xs text-slate-400">Uses sample documents supplied by the backend</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{presets.map((preset) => <div key={preset.id} className={`p-4 rounded-xl border bg-slate-900/50 flex items-start justify-between gap-4 ${selected === preset.id ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-slate-700'}`}><div><h3 className="text-sm font-bold text-white">{preset.title}</h3><p className="text-xs text-slate-400 leading-relaxed mt-1">{preset.desc}</p></div><button type="button" disabled={isLoading} onClick={() => select(preset.id)} className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"><Play className="w-3.5 h-3.5 fill-current" />Run</button></div>)}</div></section>;
}
