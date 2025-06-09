'use client';

import React from 'react';
import { UserIcon, BellIcon } from '@heroicons/react/24/outline';

export default function SeekerProfile() {
  return (
    <>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
        <div className="ml-auto flex gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Profile</h2>
          <p className="text-gray-600">
            Manage your personal information, skills, experience, and preferences.
            A complete profile helps employers find you and increases your chances of getting hired.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <UserIcon className="w-20 h-20 mx-auto text-olive-medium mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The Profile Management section is under development. Soon you'll be able to manage your professional details, 
            skills, and job preferences from this page.
          </p>
        </div>
      </div>
    </>
  );
} 