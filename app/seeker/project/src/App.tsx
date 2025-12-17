import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputSection from './components/InputSection';
import ComparisonResults from './components/ComparisonResults';
import { TextContent, ComparisonResult, JobRequirement, JobAnalysis } from './types';
import { analyzeJobDescription, extractRequirements, compareCV } from './utils/textAnalysis';
import { ArrowDown } from 'lucide-react';

function App() {
  const [jobDescription, setJobDescription] = useState<TextContent | null>(null);
  const [cv, setCv] = useState<TextContent | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [approvedSections, setApprovedSections] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeJob = async () => {
      if (jobDescription?.text && !jobAnalysis) {
        try {
          setIsAnalyzing(true);
          setError(null);
          const analysis = await analyzeJobDescription(jobDescription.text);
          setJobAnalysis(analysis);
        } catch (err) {
          setError('Error analyzing job description. Please check your input and try again.');
          console.error('Analysis error:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeJob();
  }, [jobDescription]);

  useEffect(() => {
    const performComparison = async () => {
      if (cv?.text && requirements.length > 0) {
        try {
          setIsComparing(true);
          setError(null);
          const result = await compareCV(cv.text, requirements);
          setComparisonResult(result);
          setShowResults(true);
        } catch (err) {
          setError('Error comparing CV. Please check your input and try again.');
          console.error('Comparison error:', err);
        } finally {
          setIsComparing(false);
        }
      }
    };

    performComparison();
  }, [cv, requirements]);

  const handleSectionApproval = async () => {
    if (!jobDescription?.text || !approvedSections.length) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      const extractedRequirements = await extractRequirements(jobDescription.text, approvedSections);
      setRequirements(extractedRequirements);
    } catch (err) {
      setError('Error extracting requirements. Please try again.');
      console.error('Extraction error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSectionToggle = (section: string) => {
    setApprovedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleCompareAgain = () => {
    setJobDescription(null);
    setCv(null);
    setJobAnalysis(null);
    setApprovedSections([]);
    setRequirements([]);
    setComparisonResult(null);
    setShowResults(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {!showResults ? (
            <div className="space-y-8">
              <InputSection
                title="Job Description"
                description="Upload a job description PDF or paste the text directly"
                onContentChange={setJobDescription}
                placeholder="Paste the job description here..."
                inputLabel="job description"
              />
              
              {jobAnalysis && (
                <div className="bg-white rounded-lg shadow-sm p-6 animate-slide-up">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Identified Sections</h2>
                  <p className="text-gray-600 mb-6">{jobAnalysis.description}</p>
                  
                  <div className="space-y-3">
                    {jobAnalysis.sections.map((section, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={approvedSections.includes(section)}
                          onChange={() => handleSectionToggle(section)}
                          className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="text-gray-700 font-medium">{section}</span>
                      </label>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSectionApproval}
                    disabled={approvedSections.length === 0}
                    className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Approve Selected Sections
                  </button>
                </div>
              )}
              
              {requirements.length > 0 && (
                <>
                  <div className="flex justify-center">
                    <ArrowDown className="w-8 h-8 text-gray-400 animate-pulse-slow" />
                  </div>
                  
                  <InputSection
                    title="Your CV/Resume"
                    description="Upload your CV PDF or paste the text directly"
                    onContentChange={setCv}
                    placeholder="Paste your CV/resume content here..."
                    inputLabel="CV"
                  />
                </>
              )}
              
              {(isAnalyzing || isComparing) && (
                <div className="text-center py-12">
                  <div className="inline-block p-4 rounded-full bg-primary-100">
                    <div className="w-8 h-8 border-4 border-t-primary-500 border-r-primary-300 border-b-primary-200 border-l-primary-100 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-gray-600">
                    {isAnalyzing ? 'Analyzing job description...' : 'Comparing your CV...'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <ComparisonResults result={comparisonResult} />
              
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleCompareAgain}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Compare Another CV
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;