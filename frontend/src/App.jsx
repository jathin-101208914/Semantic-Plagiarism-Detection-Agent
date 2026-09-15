import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SampleSelector from './components/SampleSelector';
import SummaryCards from './components/SummaryCards';
import SimilarityChart from './components/SimilarityChart';
import MatchingSectionCard from './components/MatchingSectionCard';
import FilterBar from './components/FilterBar';
import ThresholdConfigModal from './components/ThresholdConfigModal';
import { Download, RefreshCw, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

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

  // Thresholds State
  const [thresholds, setThresholds] = useState({
    highly_similar: 0.85,
    paraphrase: 0.70
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtering State
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial config from backend
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then((res) => res.json())
      .then((data) => {
        if (data.highly_similar && data.paraphrase) {
          setThresholds({
            highly_similar: data.highly_similar,
            paraphrase: data.paraphrase
          });
        }
      })
      .catch((err) => console.log('Backend offline or initializing:', err));
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = async (presetId) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/samples`);
      if (!res.ok) throw new Error('Failed to fetch sample datasets');
      const data = await res.json();

      const refDoc = data.reference_doc;
      const stuDoc = presetId === 'paraphrased' 
        ? data.preset_paraphrased.student_doc 
        : data.preset_original.student_doc;

      setReferenceFile(null);
      setReferenceText(refDoc);
      setStudentFile(null);
      setStudentText(stuDoc);

      // Trigger automatic analysis
      await triggerAnalysis(refDoc, stuDoc);
    } catch (err) {
      setErrorMsg(`Error loading sample preset: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Document Analysis API call
  const triggerAnalysis = async (customRefText = null, customStuText = null) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();

      const refTextToUse = customRefText !== null ? customRefText : referenceText;
      const stuTextToUse = customStuText !== null ? customStuText : studentText;

      if (referenceFile) {
        formData.append('reference_file', referenceFile);
      } else if (refTextToUse.trim()) {
        formData.append('reference_text', refTextToUse);
      }

      if (studentFile) {
        formData.append('student_file', studentFile);
      } else if (stuTextToUse.trim()) {
        formData.append('student_text', stuTextToUse);
      }

      formData.append('highly_similar_threshold', thresholds.highly_similar);
      formData.append('paraphrase_threshold', thresholds.paraphrase);

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Analysis request failed.');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'Error executing semantic analysis.');
    } finally {
      setIsLoading(false);
    }
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
        />

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="w-full max-w-7xl mx-auto my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results Analysis Dashboard */}
        {analysisResult && (
          <div className="mt-12 space-y-8 animate-fadeIn">
            
            {/* Section Divider */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>Semantic Plagiarism Report</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    Complete
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluated using <code className="text-indigo-300">all-MiniLM-L6-v2</code> embedding vectors & cosine similarity
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerAnalysis()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-evaluate</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl gradient-bg hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Report</span>
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
              {filteredSections.length > 0 ? (
                filteredSections.map((sec) => (
                  <MatchingSectionCard key={sec.student_index} section={sec} />
                ))
              ) : (
                <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No matching sections found for the selected filter or search term.</p>
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

    </div>
  );
}
