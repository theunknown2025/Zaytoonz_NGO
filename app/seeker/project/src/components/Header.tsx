import React from 'react';
import { FileText, Radar } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-800 to-secondary-800 text-white py-5 px-6 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Radar className="w-8 h-8 text-accent-400" />
            <div>
              <h1 className="text-2xl font-bold">CV Comparator</h1>
              <p className="text-sm text-primary-100">Match your resume to job requirements</p>
            </div>
          </div>
          <a 
            href="#" 
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Guide</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;