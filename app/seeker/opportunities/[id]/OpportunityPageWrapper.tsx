'use client';

import React, { useState, useEffect } from 'react';
import { type Opportunity } from '@/app/lib/opportunities';
import OpportunityDetailClient from './OpportunityDetailClient';
import NavigateOpportunities from '@/app/LandingPage/components/NavigateOpportunities';
import { AuthService } from '@/app/lib/auth';

interface OpportunityPageWrapperProps {
  opportunity: Opportunity;
}

export default function OpportunityPageWrapper({ opportunity }: OpportunityPageWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user: currentUser } = await AuthService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  // If user is not authenticated, show the public view
  if (!user) {
    return <NavigateOpportunities opportunity={opportunity} />;
  }

  // If user is authenticated, show the full interface
  return <OpportunityDetailClient opportunity={opportunity} />;
} 