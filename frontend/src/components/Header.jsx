import React from 'react';
import { ShieldCheck, Sliders, Sparkles, BookOpen } from 'lucide-react';

export default function Header({ onOpenThresholds, currentThresholds }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Title & Tagline */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-bg shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                Semanti<span className="gradient-text">Check</span>
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI Agent
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Detect plagiarism by <span className="text-indigo-400 font-semibold">meaning</span>, not just words.
            </p>
          </div>
        </div>

        {/* Action Controls & Threshold Display */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Highly Similar &ge; {Math.round(currentThresholds.highly_similar * 100)}%
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Paraphrase &ge; {Math.round(currentThresholds.paraphrase * 100)}%
            </span>
          </div>

          <button
            onClick={onOpenThresholds}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm hover:border-indigo-500/50"
            title="Configure Sensitivity Thresholds"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Sensitivity</span>
          </button>
        </div>

      </div>
    </header>
  );
}
