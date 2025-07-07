"use client";

import { useState } from "react";
import { WebsiteDisplay } from "./WebsiteDisplay";
import { SectionHandler } from "./SectionHandler";
import { GenerateRSS } from "./GenerateRSS";

interface Section {
  id: string;
  name: string;
  selector: string;
  elements: string[];
}

interface ScrapedOpportunity {
  id: string;
  title: string;
  data: Record<string, string>;
  url: string;
}

export default function ManualScraperPage() {
  const [url, setUrl] = useState("");
  const [loadedUrl, setLoadedUrl] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOpportunities, setGeneratedOpportunities] = useState<ScrapedOpportunity[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleLoadUrl = () => {
    if (url.trim()) {
      setLoadedUrl(url.trim());
      setSections([]);
      setGeneratedOpportunities([]);
      setShowResults(false);
    }
  };

  const handleAddSection = (sectionName: string) => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: sectionName,
      selector: "",
      elements: []
    };
    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection.id);
  };

  const handleUpdateSection = (sectionId: string, selector: string, elements: string[]) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, selector, elements }
          : section
      )
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate scraping process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock opportunities based on sections
      const mockOpportunities: ScrapedOpportunity[] = [];
      
      if (sections.length > 0) {
        // Create opportunities based on the first section's elements
        const titleSection = sections[0];
        titleSection.elements.forEach((element, index) => {
          const opportunity: ScrapedOpportunity = {
            id: `opp-${index}`,
            title: element,
            data: {},
            url: loadedUrl
          };
          
          // Add data from other sections
          sections.forEach(section => {
            if (section.elements[index]) {
              opportunity.data[section.name] = section.elements[index];
            }
          });
          
          mockOpportunities.push(opportunity);
        });
      }
      
      setGeneratedOpportunities(mockOpportunities);
      setShowResults(true);
    } catch (error) {
      console.error("Error generating opportunities:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manual Scraper</h1>
        <div className="flex gap-4">
          <input
            type="url"
            placeholder="Enter website URL (e.g., https://unicef.jobs.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#556B2F] focus:border-transparent"
          />
          <button
            onClick={handleLoadUrl}
            disabled={!url.trim()}
            className="px-6 py-2 bg-[#556B2F] text-white rounded-lg hover:bg-[#6B8E23] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Load Website
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showResults ? (
        <div className="flex-1 p-6">
          <GenerateRSS 
            opportunities={generatedOpportunities}
            onBack={() => setShowResults(false)}
          />
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* Left Panel - Section Handler */}
          <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
            <SectionHandler
              sections={sections}
              selectedSection={selectedSection}
              onAddSection={handleAddSection}
              onSelectSection={setSelectedSection}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              canGenerate={sections.length > 0 && sections.some(s => s.elements.length > 0)}
            />
          </div>

          {/* Right Panel - Website Display */}
          <div className="flex-1 bg-white overflow-hidden">
            {loadedUrl ? (
              <WebsiteDisplay
                url={loadedUrl}
                sections={sections}
                selectedSection={selectedSection}
                onUpdateSection={handleUpdateSection}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-2">No Website Loaded</h3>
                  <p>Enter a URL above and click "Load Website" to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 