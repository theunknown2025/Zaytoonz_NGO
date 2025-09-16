'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './components/Sidebar';
import { useAuth } from '@/app/lib/auth';
import { User } from '@/app/types';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface NGOApprovalStatus {
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
}

export default function NGOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user: authUser } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<NGOApprovalStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Map auth user to the User type expected by Sidebar
  const user: User = authUser ? {
    id: authUser.id,
    name: authUser.fullName,
    email: authUser.email,
    role: authUser.userType === 'admin_ngo' ? 'admin_ngo' : 'assistant_ngo',
    createdAt: new Date(),
    updatedAt: new Date()
  } as User : {} as User;

  // Fetch NGO approval status
  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (!authUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/ngo/approval-status?userId=${authUser.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Approval status API response:', data);
          setApprovalStatus(data);
          
          // Show success message only if newly approved and not already shown
          if (data.approval_status === 'approved') {
            console.log('Setting showSuccessMessage to true');
            setShowSuccessMessage(true);
          } else {
            console.log('Not showing success message. Status:', data.approval_status);
          }
        }
      } catch (error) {
        console.error('Error fetching approval status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalStatus();
  }, [authUser?.id]);

  // Check if NGO is approved
  const isApproved = approvalStatus?.approval_status === 'approved';
  const isPending = approvalStatus?.approval_status === 'pending';
  const isRejected = approvalStatus?.approval_status === 'rejected';
  
  // Debug logging
  console.log('Layout state:', {
    approvalStatus: approvalStatus?.approval_status,
    isApproved,
    isPending,
    isRejected,
    showSuccessMessage,
    localStorageFlag: authUser?.id ? localStorage.getItem(`success_shown_${authUser.id}`) : 'no user id'
  });
  
  // Handle dismissing the success message
  const handleDismissSuccess = () => {
    setShowSuccessMessage(false);
    // Mark as shown for this user only after they dismiss it
    if (authUser?.id) {
      localStorage.setItem(`success_shown_${authUser.id}`, 'true');
    }
  };
  
  // Temporary function to reset localStorage flag for testing
  const resetSuccessFlag = () => {
    if (authUser?.id) {
      localStorage.removeItem(`success_shown_${authUser.id}`);
      setShowSuccessMessage(true);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            style: {
              background: '#ECFDF5',
              border: '1px solid #D1FAE5',
              color: '#065F46',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#B91C1C',
            },
          },
        }}
      />
      
      {/* Sidebar */}
      {authUser && <Sidebar user={user} />}
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Show approval status message in center of screen */}
        {!loading && (
          <>
            {/* Approved NGO - Show success message only once */}
            {isApproved && showSuccessMessage && (
              <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="mb-6">
                    <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-green-800 mb-4">
                      Account Approved! 🎉
                    </h1>
                    <p className="text-xl text-green-600 mb-8">
                      Welcome to your NGO dashboard. You now have access to all features.
                    </p>
                  </div>
                  
                  {/* Quick Access Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <a
                      href="/ngo/opportunities/new"
                      className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-300 group"
                    >
                      <div className="text-green-600 group-hover:text-green-700 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-green-800">New Opportunity</h3>
                    </a>
                    
                    <a
                      href="/ngo/applications"
                      className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-300 group"
                    >
                      <div className="text-green-600 group-hover:text-green-700 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-green-800">View Applications</h3>
                    </a>
                    
                    <a
                      href="/ngo/dashboard"
                      className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-300 group"
                    >
                      <div className="text-green-600 group-hover:text-green-700 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-green-800">Dashboard</h3>
                    </a>
                    
                    <a
                      href="/ngo/resources/tools"
                      className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-300 group"
                    >
                      <div className="text-green-600 group-hover:text-green-700 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-green-800">Tools</h3>
                    </a>
                  </div>
                  
                  <p className="text-sm text-green-500 mb-6">
                    Use the sidebar navigation to access all features
                  </p>
                  
                  {/* Dismiss button */}
                  <button
                    onClick={handleDismissSuccess}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Get Started
                  </button>
                  
                  {/* Temporary reset button for testing */}
                  <button
                    onClick={resetSuccessFlag}
                    className="ml-4 inline-flex items-center px-4 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Reset (Test)
                  </button>
                </div>
              </div>
            )}
            
            {/* Pending NGO - Show pending message */}
            {isPending && (
              <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="mb-6">
                    <ClockIcon className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-yellow-800 mb-4">
                      Account Pending Approval
                    </h1>
                    <p className="text-xl text-yellow-600 mb-8">
                      Your NGO account is currently under review. Please complete your profile and wait for admin approval to access the full dashboard.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-4">What happens next?</h3>
                    <ul className="text-left text-yellow-700 space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        Complete your NGO profile with all required information
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        Admin will review your application within 24-48 hours
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        You'll receive notification once approved
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        Access to all features will be unlocked
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-6">
                    <a
                      href="/ngo/profile"
                      className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                    >
                      Complete Profile
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Rejected NGO - Show rejection message */}
            {isRejected && (
              <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="mb-6">
                    <XCircleIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-red-800 mb-4">
                      Account Rejected
                    </h1>
                    <p className="text-xl text-red-600 mb-8">
                      Your NGO account application has been rejected. Please review the feedback and resubmit.
                    </p>
                  </div>
                  
                  {approvalStatus?.admin_notes && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200 mb-6">
                      <h3 className="font-semibold text-red-800 mb-4">Admin Feedback</h3>
                      <p className="text-red-700 text-left">{approvalStatus.admin_notes}</p>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-4">Next Steps</h3>
                    <ul className="text-left text-red-700 space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                        Review the admin feedback above
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                        Update your profile with the requested information
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                        Contact support if you need clarification
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                        Resubmit for approval when ready
                      </li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 space-x-4">
                    <a
                      href="/ngo/profile"
                      className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Update Profile
                    </a>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Check Status Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Show loading state */}
        {loading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Checking approval status...</p>
            </div>
          </div>
        )}
        
        {/* Show children based on approval status and success message state */}
        {!loading && (
          <>
            {/* Show normal page content for approved NGOs (after dismissing success message) */}
            {isApproved && !showSuccessMessage && (
              <>
                {/* Small success banner for approved NGOs */}
                <div className="bg-green-50 border-b border-green-200">
                  <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-800">
                          Your NGO account is approved and active
                        </span>
                      </div>
                      <span className="text-xs text-green-600">
                        Access all features via the sidebar navigation
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Page content */}
                {children}
              </>
            )}
            
            {/* Show profile page for pending/rejected NGOs */}
            {(isPending || isRejected) && pathname === '/ngo/profile' && children}
          </>
        )}
      </main>
    </div>
  );
} 