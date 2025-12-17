import React from 'react';
import { Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} CV Comparator. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#"
              className="text-gray-500 hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#"
              className="text-gray-500 hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="#"
              className="flex items-center space-x-2 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <div className="flex items-center space-x-1 text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;