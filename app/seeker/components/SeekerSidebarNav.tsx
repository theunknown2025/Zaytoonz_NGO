'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, 
  DocumentTextIcon, 
  BriefcaseIcon, 
  BookOpenIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function SeekerSidebarNav() {
  const pathname = usePathname();
  const [isJobsOpen, setIsJobsOpen] = useState(
    // Initialize dropdown as open if we're on a jobs page
    pathname?.includes('/seeker/jobs')
  );
  const [isOpportunitiesOpen, setIsOpportunitiesOpen] = useState(
    // Initialize dropdown as open if we're on an opportunities page
    pathname?.includes('/seeker/opportunities')
  );

  const handleLogout = () => {
    // This would include actual logout logic in a real implementation
    console.log('Logging out...');
    // Redirect to login page
    window.location.href = '/';
  };

  return (
    <aside className="w-[280px] h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col fixed left-0 top-0 z-50 shadow-lg">
      <div className="p-5 border-b border-gray-700/50 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full rounded-lg bg-white p-2">
            {/* Logo will go here */}
            <div className="w-full h-full bg-olive-medium/20 rounded flex items-center justify-center">
              <span className="text-olive-medium font-bold">LOGO</span>
            </div>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-100">Seeker Dashboard</h2>
      </div>
      
      <nav className="flex-1 py-5 overflow-y-auto">
        <Link 
          href="/seeker/profile" 
          className={`flex items-center w-full px-6 py-3 ${
            pathname === '/seeker/profile' 
              ? 'bg-white/10 text-white' 
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          } transition-colors`}
        >
          <UserIcon className="w-5 h-5 mr-3" />
          Profile
        </Link>
        
        <Link 
          href="/seeker/cv-maker" 
          className={`flex items-center w-full px-6 py-3 ${
            pathname === '/seeker/cv-maker' 
              ? 'bg-white/10 text-white' 
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          } transition-colors`}
        >
          <DocumentTextIcon className="w-5 h-5 mr-3" />
          CV Maker
        </Link>
        
        {/* Opportunities Management with dropdown functionality */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsOpportunitiesOpen(!isOpportunitiesOpen)}
            className={`flex items-center w-full px-6 py-3 ${
              pathname?.includes('/seeker/opportunities') 
                ? 'bg-white/10 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            } transition-colors`}
          >
            <ClipboardDocumentListIcon className="w-5 h-5 mr-3" />
            Opportunities
            {isOpportunitiesOpen ? (
              <ChevronUpIcon className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            )}
          </button>
          
          {isOpportunitiesOpen && (
            <div className="bg-black/20">
              <Link 
                href="/seeker/opportunities/navigate" 
                className={`flex items-center w-full px-6 py-2.5 pl-14 ${
                  pathname === '/seeker/opportunities/navigate' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } transition-colors`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Browse
              </Link>
              <Link 
                href="/seeker/opportunities/applications" 
                className={`flex items-center w-full px-6 py-2.5 pl-14 ${
                  pathname === '/seeker/opportunities/applications' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } transition-colors`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Applications
              </Link>
            </div>
          )}
        </div>
        
        {/* Jobs Management with dropdown functionality */}
        <div className="flex flex-col">
          <button
            onClick={() => setIsJobsOpen(!isJobsOpen)}
            className={`flex items-center w-full px-6 py-3 ${
              pathname?.includes('/seeker/jobs') 
                ? 'bg-white/10 text-white' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            } transition-colors`}
          >
            <BriefcaseIcon className="w-5 h-5 mr-3" />
            Jobs Management
            {isJobsOpen ? (
              <ChevronUpIcon className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 ml-auto" />
            )}
          </button>
          
          {isJobsOpen && (
            <div className="bg-black/20">
              <Link 
                href="/seeker/jobs/alerts" 
                className={`flex items-center w-full px-6 py-2.5 pl-14 ${
                  pathname === '/seeker/jobs/alerts' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } transition-colors`}
              >
                <BellIcon className="w-4 h-4 mr-2" />
                Jobs Alerts
              </Link>
              <Link 
                href="/seeker/jobs" 
                className={`flex items-center w-full px-6 py-2.5 pl-14 ${
                  pathname === '/seeker/jobs' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } transition-colors`}
              >
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Jobs
              </Link>
            </div>
          )}
        </div>
        
        <Link 
          href="/seeker/resources" 
          className={`flex items-center w-full px-6 py-3 ${
            pathname === '/seeker/resources' 
              ? 'bg-white/10 text-white' 
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          } transition-colors`}
        >
          <BookOpenIcon className="w-5 h-5 mr-3" />
          Resources
        </Link>
      </nav>

      <button 
        onClick={handleLogout}
        className="mx-5 mb-5 py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white flex items-center justify-center transition-colors hover:bg-white/20"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
        Logout
      </button>
    </aside>
  );
} 