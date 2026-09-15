import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

export default function SimilarityChart({ summary, sections }) {
  if (!summary || !sections) return null;

  const pieData = [
    { name: 'Highly Similar', value: summary.highly_similar_count, color: '#f43f5e' },
    { name: 'Paraphrased', value: summary.paraphrased_count, color: '#f59e0b' },
    { name: 'Likely Original', value: summary.original_count, color: '#10b981' }
  ].filter(item => item.value > 0);

  const barData = sections.map((sec, idx) => ({
    name: `S${idx + 1}`,
    score: sec.similarity_percentage,
    classification: sec.classification
  }));

  const getBarColor = (score) => {
    if (score >= 85) return '#f43f5e';
    if (score >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Classification Breakdown Donut Chart */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <PieIcon className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Content Breakdown</h3>
        </div>

        <div className="h-64 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-extrabold text-white font-mono">{summary.total_sections}</span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sections</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-around pt-2 border-t border-slate-800/80">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-slate-300 font-medium">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sentence Similarity Score Distribution Bar Chart */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Section Similarity Profile</h3>
          </div>
          <span className="text-xs text-slate-400">Score per student sentence</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-white">Student Section {data.name}</p>
                        <p className="text-indigo-300">Similarity: <span className="font-bold">{data.score}%</span></p>
                        <p className="text-slate-400">Tier: {data.classification}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          Hover over bars to inspect section details
        </div>
      </div>

    </div>
  );
}
