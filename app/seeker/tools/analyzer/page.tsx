'use client';

import React, { useState } from 'react';
import { 
  DocumentMagnifyingGlassIcon, 
  ChartBarIcon, 
  ArrowUpTrayIcon, 
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis (in a real app, this would be an API call)
    setTimeout(() => {
      setAnalysisResult({
        score: 75,
        strengths: [
          'Clear presentation of work experience',
          'Good educational background details',
          'Contact information is complete'
        ],
        improvements: [
          'Skills section could be more detailed',
          'Consider adding more keywords relevant to your target job',
          'Quantify your achievements with specific metrics'
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Resume Analyzer</h1>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Analyze Your Resume</h2>
          <p className="text-gray-600">
            Upload your resume to get instant feedback on its effectiveness. Our analyzer will evaluate 
            the content and formatting, providing personalized recommendations to help you improve.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                <DocumentMagnifyingGlassIcon className="w-5 h-5 mr-2 text-olive-medium" />
                Upload Resume
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload your resume in PDF or DOCX format for analysis.
              </p>
              
              <div className="mt-4">
                <label className="block mb-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-olive-light transition-colors">
                    <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <span className="text-gray-600">Click or drag file to upload</span>
                    <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOCX</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.docx" 
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
                
                {file && (
                  <div className="mt-3 flex items-center bg-gray-50 p-2 rounded">
                    <DocumentTextIcon className="w-5 h-5 text-olive-medium mr-2" />
                    <span className="text-sm font-medium text-gray-700 truncate flex-1">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>
              
              <button
                className={`w-full mt-4 px-4 py-2 rounded ${
                  file ? 'bg-olive-medium text-white hover:bg-olive-dark' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors flex items-center justify-center`}
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="w-5 h-5 mr-2" />
                    Analyze Resume
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
            {analysisResult ? (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 mr-2 text-olive-medium" />
                  Analysis Results
                </h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Score</span>
                    <span className="text-sm font-bold text-olive-dark">{analysisResult.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-olive-medium h-2.5 rounded-full" 
                      style={{ width: `${analysisResult.score}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-3">Areas for Improvement</h4>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start">
                          <ChartBarIcon className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-olive-light/10 border border-olive-light/20 rounded-lg">
                  <h4 className="text-md font-medium text-olive-dark mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-700">
                    Your resume is well-structured but could benefit from more specific achievements and tailored skills. 
                    Consider using the CV Maker tool to enhance these areas and improve your overall score.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <DocumentMagnifyingGlassIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Resume Analysis</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Upload your resume and click "Analyze Resume" to get detailed feedback and improvement suggestions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 