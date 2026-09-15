import React, { useRef, useState } from 'react';
import { FileText, Trash2, Upload } from 'lucide-react';

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'txt'];

function fileLabel(file) {
  const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
  return `${extension} · ${(file.size / 1024).toFixed(1)} KB`;
}

function DocumentInput({ label, accent, file, text, mode, onModeChange, onFile, onText, disabled, onValidationError }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const validateAndSetFile = (candidate) => {
    if (!candidate) return;
    const extension = candidate.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) return onValidationError(`${label} must be a PDF, DOCX, or TXT file.`);
    if (candidate.size === 0) return onValidationError(`${label} is empty. Choose a file that contains text.`);
    onValidationError('');
    onFile(candidate);
  };
  const removeFile = () => { onFile(null); if (inputRef.current) inputRef.current.value = ''; };

  return <section className={`glass-panel rounded-2xl p-6 flex flex-col border ${accent.border}`} aria-label={label}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Document to compare</p><h2 className="text-lg font-bold text-white">{label}</h2></div>
      <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs font-medium shrink-0">
        <button type="button" disabled={disabled} onClick={() => onModeChange('file')} className={`px-2.5 py-1 rounded-md ${mode === 'file' ? `${accent.button} text-white shadow` : 'text-slate-400 hover:text-slate-200'}`}>File</button>
        <button type="button" disabled={disabled} onClick={() => onModeChange('text')} className={`px-2.5 py-1 rounded-md ${mode === 'text' ? `${accent.button} text-white shadow` : 'text-slate-400 hover:text-slate-200'}`}>Paste text</button>
      </div>
    </div>
    {mode === 'text' ? (
      <textarea value={text} disabled={disabled} onChange={(event) => onText(event.target.value)} placeholder={`Paste ${label.toLowerCase()} text here...`} className={`w-full min-h-[172px] p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm focus:outline-none ${accent.focus} resize-none font-sans disabled:opacity-60`} />
    ) : file ? (
      <div className="min-h-[172px] flex flex-col justify-center p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3 min-w-0"><div className={`p-3 rounded-lg ${accent.icon} text-xs font-bold`}>{file.name.split('.').pop()?.toUpperCase()}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white truncate" title={file.name}>{file.name}</p><p className="text-xs text-slate-400 mt-1">{fileLabel(file)}</p></div><button type="button" disabled={disabled} onClick={removeFile} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400 disabled:opacity-50" aria-label={`Remove ${label}`}><Trash2 className="w-4 h-4" /></button></div>
        <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className={`mt-5 text-xs font-semibold ${accent.link} self-start disabled:opacity-50`}>Replace file</button>
      </div>
    ) : (
      <div role="button" tabIndex={disabled ? -1 : 0} onClick={() => !disabled && inputRef.current?.click()} onKeyDown={(event) => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) inputRef.current?.click(); }} onDragEnter={(event) => { event.preventDefault(); if (!disabled) setIsDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); if (!disabled) validateAndSetFile(event.dataTransfer.files?.[0]); }} className={`min-h-[172px] border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 ${isDragging ? accent.dropActive : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900/80'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}><Upload className={`w-8 h-8 ${accent.link} mb-2`} /><p className="text-sm font-semibold text-slate-200">Drop a file here, or browse</p><p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT</p></div>
    )}
    <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={(event) => validateAndSetFile(event.target.files?.[0])} />
  </section>;
}

export default function UploadZone({ referenceFile, setReferenceFile, referenceText, setReferenceText, studentFile, setStudentFile, studentText, setStudentText, onAnalyze, isLoading, onValidationError }) {
  const [refMode, setRefMode] = useState('file');
  const [stuMode, setStuMode] = useState('file');
  const isReady = Boolean((refMode === 'file' ? referenceFile : referenceText.trim()) && (stuMode === 'file' ? studentFile : studentText.trim()));
  const accents = { reference: { border: 'border-indigo-500/20', button: 'bg-indigo-600', icon: 'bg-indigo-500/20 text-indigo-300', link: 'text-indigo-300 hover:text-indigo-200', focus: 'focus:border-indigo-500/80', dropActive: 'border-indigo-400 bg-indigo-500/10' }, student: { border: 'border-purple-500/20', button: 'bg-purple-600', icon: 'bg-purple-500/20 text-purple-300', link: 'text-purple-300 hover:text-purple-200', focus: 'focus:border-purple-500/80', dropActive: 'border-purple-400 bg-purple-500/10' } };
  return <div className="w-full max-w-7xl mx-auto space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><DocumentInput label="Reference Document" accent={accents.reference} file={referenceFile} text={referenceText} mode={refMode} onModeChange={setRefMode} onFile={setReferenceFile} onText={setReferenceText} disabled={isLoading} onValidationError={onValidationError} /><DocumentInput label="Student Document" accent={accents.student} file={studentFile} text={studentText} mode={stuMode} onModeChange={setStuMode} onFile={setStudentFile} onText={setStudentText} disabled={isLoading} onValidationError={onValidationError} /></div><div className="flex flex-col items-center gap-2 pt-2"><button type="button" disabled={!isReady || isLoading} onClick={onAnalyze} className={`px-8 py-4 rounded-2xl font-bold text-base text-white transition-all shadow-xl flex items-center gap-3 ${isReady && !isLoading ? 'gradient-bg hover:opacity-95 shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'}`}><FileText className="w-5 h-5 text-indigo-100" /> Analyze Documents</button>{!isReady && <p className="text-xs text-slate-500">Add both documents to start an analysis.</p>}</div></div>;
}
