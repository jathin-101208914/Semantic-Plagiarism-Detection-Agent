import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';

export default function ThresholdConfigModal({
  isOpen,
  onClose,
  currentThresholds,
  onSaveThresholds
}) {
  const [highlySimilar, setHighlySimilar] = useState(
    Math.round((currentThresholds?.highly_similar ?? 0.85) * 100)
  );
  const [paraphrase, setParaphrase] = useState(
    Math.round((currentThresholds?.paraphrase ?? 0.70) * 100)
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (paraphrase >= highlySimilar) {
      setError('Paraphrase threshold must be lower than Highly Similar threshold.');
      return;
    }
    setError('');
    onSaveThresholds(highlySimilar / 100, paraphrase / 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-indigo-500/30 shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Similarity Threshold Config</h3>
              <p className="text-xs text-slate-400">Adjust semantic classifier sensitivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Highly Similar Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Highly Similar Cutoff:
            </label>
            <span className="font-mono font-extrabold text-white text-sm">{highlySimilar}%</span>
          </div>
          <input
            type="range"
            min="75"
            max="95"
            value={highlySimilar}
            onChange={(e) => setHighlySimilar(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer bg-slate-800 rounded-lg h-2"
          />
          <p className="text-[11px] text-slate-400">Scores &ge; {highlySimilar}% flag exact or nearly identical wording.</p>
        </div>

        {/* Paraphrase Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Paraphrase Cutoff:
            </label>
            <span className="font-mono font-extrabold text-white text-sm">{paraphrase}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="80"
            value={paraphrase}
            onChange={(e) => setParaphrase(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer bg-slate-800 rounded-lg h-2"
          />
          <p className="text-[11px] text-slate-400">Scores between {paraphrase}% and {highlySimilar - 1}% flag semantic paraphrasing.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl gradient-bg hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Apply Thresholds</span>
          </button>
        </div>

      </div>
    </div>
  );
}
