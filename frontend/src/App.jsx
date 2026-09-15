import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SampleSelector from './components/SampleSelector';
import SummaryCards from './components/SummaryCards';
import SimilarityChart from './components/SimilarityChart';
import MatchingSectionCard from './components/MatchingSectionCard';
import FilterBar from './components/FilterBar';
import ThresholdConfigModal from './components/ThresholdConfigModal';
import ReportModal from './components/ReportModal';
import { FileText, RefreshCw, AlertCircle, CheckCircle2, Circle, PlusCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function readableError(detail, fallback) {
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === 'string' ? item : item?.msg))
      .filter(Boolean);
    if (messages.length) return messages.join(' ');
  }
  return fallback;
}

export default function App() {
  // Input State
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceText, setReferenceText] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [studentText, setStudentText] = useState('');

  // Execution & Output State
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  // Thresholds State
  const [thresholds, setThresholds] = useState({
    highly_similar: 0.85,
    paraphrase: 0.70
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Filtering State
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial config from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Configuration unavailable');
        return res.json();
      })
      .then((data) => {
        if (data.highly_similar && data.paraphrase) {
          setThresholds({
            highly_similar: data.highly_similar,
            paraphrase: data.paraphrase
          });
        }
      })
      // The upload flow reports connectivity failures when the user takes action.
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading) return undefined;
    const timer = window.setInterval(() => setLoadingStep((step) => Math.min(step + 1, 4)), 900);
    return () => window.clearInterval(timer);
  }, [isLoading]);

  // Handle Preset Selection
  const handleSelectPreset = async (presetId) => {
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/samples`);
      if (!res.ok) throw new Error('Failed to fetch sample datasets');
      const data = await res.json();

      const refDoc = data.reference_doc;
      const stuDoc = presetId === 'paraphrased'
        ? data.preset_paraphrased?.student_doc
        : data.preset_original?.student_doc;

      if (!refDoc?.trim() || !stuDoc?.trim()) {
        throw new Error('The backend sample documents are empty or unavailable.');
      }

      // These files contain the exact text returned by the backend sample endpoint.
      const demoReference = new File([refDoc], 'backend-reference-sample.txt', { type: 'text/plain' });
      const demoStudent = new File([stuDoc], `backend-${presetId}-sample.txt`, { type: 'text/plain' });

      setReferenceFile(demoReference);
      setReferenceText('');
      setStudentFile(demoStudent);
      setStudentText('');

      await triggerAnalysis({ referenceFile: demoReference, studentFile: demoStudent });
    } catch (err) {
      const message = err instanceof TypeError
        ? 'Could not reach the backend. Start the API and try the demo again.'
        : readableError(err?.message, 'Could not load the demo. Please try again.');
      setErrorMsg(`Could not load the demo: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Document Analysis API call
  const triggerAnalysis = async (documents = {}) => {
    setIsLoading(true);
    setLoadingStep(1);
    setErrorMsg('');
    setAnalysisResult(null);
    try {
      const formData = new FormData();

      const refFileToUse = documents.referenceFile ?? referenceFile;
      const stuFileToUse = documents.studentFile ?? studentFile;

      if (refFileToUse) {
        formData.append('reference_file', refFileToUse);
      } else if (referenceText.trim()) {
        formData.append('reference_text', referenceText);
      } else {
        throw new Error('Add a reference document before analyzing.');
      }

      if (stuFileToUse) {
        formData.append('student_file', stuFileToUse);
      } else if (studentText.trim()) {
        formData.append('student_text', studentText);
      } else {
        throw new Error('Add a student document before analyzing.');
      }

      formData.append('highly_similar_threshold', thresholds.highly_similar);
      formData.append('paraphrase_threshold', thresholds.paraphrase);

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(readableError(errorBody.detail, `Analysis failed (server returned ${response.status}).`));
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof TypeError) {
        setErrorMsg('Could not reach the backend. Start the API at http://localhost:8000 and try again.');
      } else {
        setErrorMsg(readableError(err?.message, 'Analysis failed. Check that both documents contain readable text and try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startNewAnalysis = () => {
    setReferenceFile(null);
    setStudentFile(null);
    setReferenceText('');
    setStudentText('');
    setAnalysisResult(null);
    setErrorMsg('');
  };

  // Dynamic Threshold Updates
  const handleSaveThresholds = (newHigh, newPara) => {
    setThresholds({ highly_similar: newHigh, paraphrase: newPara });
    
    // Update backend settings
    fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highly_similar: newHigh, paraphrase: newPara })
    }).catch(err => console.error('Failed to update config on server:', err));

    // Re-evaluate current results locally or via API
    if (analysisResult) {
      triggerAnalysis();
    }
  };

  // Filter sections by search & tier
  const filteredSections = (analysisResult?.sections || []).filter((sec) => {
    const matchesFilter =
      activeFilter === 'ALL' || sec.classification === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      sec.student_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.reference_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-16 flex flex-col items-center">
      
      {/* Header */}
      <Header
        onOpenThresholds={() => setIsModalOpen(true)}
        currentThresholds={thresholds}
      />

      <main className="w-full max-w-7xl px-4 sm:px-6">
        
        {/* Sample Selector for Instant Hackathon Demo */}
        <SampleSelector
          onSelectPreset={handleSelectPreset}
          isLoading={isLoading}
        />

        {/* File / Text Upload Zone */}
        <UploadZone
          referenceFile={referenceFile}
          setReferenceFile={setReferenceFile}
          referenceText={referenceText}
          setReferenceText={setReferenceText}
          studentFile={studentFile}
          setStudentFile={setStudentFile}
          studentText={studentText}
          setStudentText={setStudentText}
          onAnalyze={() => triggerAnalysis()}
          isLoading={isLoading}
          onValidationError={setErrorMsg}
        />

        {isLoading && <LoadingState activeStep={loadingStep} />}

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="w-full max-w-7xl mx-auto my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results Analysis Dashboard */}
        {analysisResult && (
          <div className="mt-12 space-y-8">

            {/* Section Divider */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>Semantic Plagiarism Report</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    Complete
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluated using <code className="text-indigo-300">all-MiniLM-L6-v2</code> sentence embeddings &amp; cosine similarity
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={startNewAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Analysis</span>
                </button>
                <button
                  onClick={() => triggerAnalysis()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-evaluate</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl gradient-bg hover:opacity-95 text-white text-xs font-bold shadow"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View / Download Report</span>
                </button>
              </div>
            </div>

            {/* High-Level Summary Metrics Cards */}
            <SummaryCards summary={analysisResult.summary} />

            {/* Visual Recharts Charts */}
            <SimilarityChart
              summary={analysisResult.summary}
              sections={analysisResult.sections}
            />

            {/* Section Matching Filter & Search Bar */}
            <FilterBar
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalCount={analysisResult.sections.length}
              filteredCount={filteredSections.length}
            />

            {/* Section Matching Comparison Cards */}
            <div className="space-y-4">
              {analysisResult.sections.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-base font-bold text-white">No sections returned</p>
                  <p className="text-sm text-slate-400">The backend returned no section matches. Ensure both documents contain readable text.</p>
                </div>
              ) : filteredSections.length > 0 ? (
                filteredSections.map((sec) => (
                  <MatchingSectionCard key={sec.student_index} section={sec} />
                ))
              ) : (
                <div className="glass-panel rounded-2xl p-10 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-300">No sections match this filter.</p>
                  <p className="text-xs text-slate-500">
                    {activeFilter !== 'ALL'
                      ? `There are no "${activeFilter}" sections${searchQuery ? ' matching your search' : ''}.`
                      : 'Try clearing your search term.'}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Threshold Config Modal */}
      <ThresholdConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentThresholds={thresholds}
        onSaveThresholds={handleSaveThresholds}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysisResult={analysisResult}
        thresholds={thresholds}
      />

    </div>
  );
}

function LoadingState({ activeStep }) {
  const steps = ['Documents uploaded', 'Extracting text', 'Splitting sections', 'Generating semantic embeddings', 'Comparing semantic meaning', 'Generating report'];
  return <section className="w-full max-w-3xl mx-auto mt-6 glass-panel rounded-2xl p-5 border border-indigo-500/25" aria-live="polite">
    <div className="flex items-center gap-3 mb-4"><div className="w-5 h-5 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" /><div><h2 className="text-sm font-bold text-white">Analyzing your documents</h2><p className="text-xs text-slate-400">This may take a moment while the backend processes the files.</p></div></div>
    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
      {steps.map((step, index) => {
        const complete = index < activeStep;
        const active = index === activeStep;
        return <li key={step} className={`flex items-center gap-2 text-xs ${complete ? 'text-emerald-300' : active ? 'text-indigo-200' : 'text-slate-500'}`}>
          {complete ? <CheckCircle2 className="w-4 h-4" /> : active ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Circle className="w-4 h-4" />} {step}
        </li>;
      })}
    </ol>
  </section>;
}
