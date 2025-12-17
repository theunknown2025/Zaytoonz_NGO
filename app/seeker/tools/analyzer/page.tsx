'use client';

import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ComparisonResults from './components/ComparisonResults';
import { TextContent, ComparisonResult, JobRequirement, JobAnalysis } from './types';
import { analyzeJobDescription, extractRequirements, compareCV } from './utils/textAnalysis';
import { ArrowDownIcon } from '@heroicons/react/24/outline';

export default function Analyzer() {
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">CV/Resume Analyzer</h1>
        <p className="text-gray-600">
          Compare your CV against job requirements and get detailed feedback
        </p>
      </div>

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
            <div className="bg-white rounded-xl shadow-sm p-6">
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
                      className="w-5 h-5 text-[#556B2F] rounded border-gray-300 focus:ring-[#556B2F]"
                    />
                    <span className="text-gray-700 font-medium">{section}</span>
                  </label>
                ))}
              </div>
              
              <button
                onClick={handleSectionApproval}
                disabled={approvedSections.length === 0}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:from-[#6B8E23] hover:to-[#556B2F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Approve Selected Sections
              </button>
            </div>
          )}
          
          {requirements.length > 0 && (
            <>
              <div className="flex justify-center">
                <ArrowDownIcon className="w-8 h-8 text-gray-400 animate-pulse" />
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
              <div className="inline-block p-4 rounded-full bg-[#556B2F]/10">
                <div className="w-8 h-8 border-4 border-t-[#556B2F] border-r-[#6B8E23] border-b-[#556B2F] border-l-transparent rounded-full animate-spin"></div>
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
  );
}
