import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function FilterBar({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  totalCount,
  filteredCount
}) {
  const filters = [
    { id: 'ALL', label: 'All Sections' },
    { id: 'Highly Similar', label: 'Highly Similar' },
    { id: 'Potential Paraphrase', label: 'Paraphrased' },
    { id: 'Likely Original', label: 'Likely Original' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
      
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search Input & Counter */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matching text..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500/80"
          />
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 shrink-0">
          Showing <span className="text-white font-bold">{filteredCount}</span> of {totalCount}
        </div>
      </div>

    </div>
  );
}
