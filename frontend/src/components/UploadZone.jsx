import React, { useState, useRef } from 'react';
import { Upload, FileText, X, File, AlertCircle } from 'lucide-react';

export default function UploadZone({
  referenceFile,
  setReferenceFile,
  referenceText,
  setReferenceText,
  studentFile,
  setStudentFile,
  studentText,
  setStudentText,
  onAnalyze,
  isLoading
}) {
  const [refMode, setRefMode] = useState('file'); // 'file' or 'text'
  const [stuMode, setStuMode] = useState('file'); // 'file' or 'text'

  const refInputRef = useRef(null);
  const stuInputRef = useRef(null);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄 PDF';
    if (ext === 'docx') return '📝 DOCX';
    return '📃 TXT';
  };

  const isReady =
    (refMode === 'file' ? referenceFile : referenceText.trim()) &&
    (stuMode === 'file' ? studentFile : studentText.trim());

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Reference Document Card */}
        <div className="glass-panel rounded-2xl p-6 relative flex flex-col border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
              <h2 className="text-lg font-bold text-white tracking-wide">Reference Document</h2>
            </div>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setRefMode('file')}
                className={`px-3 py-1 rounded-md transition-all ${
                  refMode === 'file' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setRefMode('text')}
                className={`px-3 py-1 rounded-md transition-all ${
                  refMode === 'text' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {refMode === 'file' ? (
            <div className="flex-1 flex flex-col">
              {referenceFile ? (
                <div className="flex-1 min-h-[160px] flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                      {getFileIcon(referenceFile.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[220px]">{referenceFile.name}</p>
                      <p className="text-xs text-slate-400">{(referenceFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReferenceFile(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => refInputRef.current?.click()}
                  className="flex-1 min-h-[160px] border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
                >
                  <input
                    type="file"
                    ref={refInputRef}
                    onChange={(e) => handleFileChange(e, setReferenceFile)}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-slate-200">Upload Reference Document</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste original source text here to compare against..."
              className="w-full min-h-[160px] p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500/80 resize-none font-sans"
            />
          )}
        </div>

        {/* Student Document Card */}
        <div className="glass-panel rounded-2xl p-6 relative flex flex-col border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
              <h2 className="text-lg font-bold text-white tracking-wide">Student Document</h2>
            </div>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setStuMode('file')}
                className={`px-3 py-1 rounded-md transition-all ${
                  stuMode === 'file' ? 'bg-purple-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setStuMode('text')}
                className={`px-3 py-1 rounded-md transition-all ${
                  stuMode === 'text' ? 'bg-purple-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {stuMode === 'file' ? (
            <div className="flex-1 flex flex-col">
              {studentFile ? (
                <div className="flex-1 min-h-[160px] flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs">
                      {getFileIcon(studentFile.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate max-w-[220px]">{studentFile.name}</p>
                      <p className="text-xs text-slate-400">{(studentFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStudentFile(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => stuInputRef.current?.click()}
                  className="flex-1 min-h-[160px] border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
                >
                  <input
                    type="file"
                    ref={stuInputRef}
                    onChange={(e) => handleFileChange(e, setStudentFile)}
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-semibold text-slate-200">Upload Student Document</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, TXT</p>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Paste student submission text here to evaluate..."
              className="w-full min-h-[160px] p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500/80 resize-none font-sans"
            />
          )}
        </div>

      </div>

      {/* Primary Action Button */}
      <div className="flex justify-center pt-2">
        <button
          disabled={!isReady || isLoading}
          onClick={onAnalyze}
          className={`relative px-8 py-4 rounded-2xl font-bold text-base text-white transition-all shadow-xl flex items-center gap-3 ${
            isReady && !isLoading
              ? 'gradient-bg hover:opacity-95 hover:scale-105 active:scale-95 shadow-indigo-500/25 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Semantic Vectors...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5 text-indigo-200" />
              <span>Analyze Documents</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
