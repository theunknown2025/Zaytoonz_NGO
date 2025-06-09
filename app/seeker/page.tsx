'use client';

import React, { useState } from 'react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';

// Define types for dashboard data
interface DashboardData {
  // Add fields as needed
  userId?: string;
  stats?: {
    applications?: number;
    savedJobs?: number;
  };
}

interface DashboardPanelProps {
  title: string;
  description: string;
  href: string;
}

export default function SeekerDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  // This would fetch data in a real implementation
  React.useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
      // Simulate successful data fetch with proper typing
      setDashboardData({
        userId: 'user123',
        stats: {
          applications: 0,
          savedJobs: 0
        }
      });
    }, 1000);
  }, []);

  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Job Seeker Dashboard</h1>
        <div className="ml-auto flex gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Your Career Portal</h2>
          <p className="text-gray-600">
            Discover job opportunities, track your applications, and manage your professional profile.
            Use the panels below to navigate through different features.
          </p>
        </div>
        
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading dashboard data...</p>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardPanel 
              title="Job Search" 
              description="Browse available positions matching your skills and experience."
              href="/seeker/jobs"
            />
            <DashboardPanel 
              title="My Applications" 
              description="Track status of submitted job applications."
              href="/seeker/applications"
            />
            <DashboardPanel 
              title="Profile" 
              description="Update your resume, skills, and professional information."
              href="/seeker/profile"
            />
            <DashboardPanel 
              title="CV Maker" 
              description="Create and manage professional CVs for your job applications."
              href="/seeker/cv-maker"
            />
          </div>
        )}
      </div>
    </>
  );
}

function DashboardPanel({ title, description, href }: DashboardPanelProps) {
  return (
    <a href={href} className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md hover:-translate-y-1">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
} 