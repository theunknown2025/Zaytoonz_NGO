import React from 'react';
import { getOpportunityById, type Opportunity } from '@/app/lib/opportunities';
import OpportunityPageWrapper from './OpportunityPageWrapper';
import { supabase } from '@/app/lib/supabase';
import { redirect } from 'next/navigation';
import ShareOpportunity from './ShareOpportunity';
import FavoriteOpportunity from './FavoriteOpportunity';

// Server component that fetches data dynamically
export default async function OpportunityDetailPage({ 
  params,
  searchParams
}: { 
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    // Handle extracted opportunities (full-content)
    if (params.id.startsWith('extracted_')) {
      const extractedId = params.id.replace('extracted_', '');
      const { data: extracted, error: extractedError } = await supabase
        .from('extracted_opportunity_content')
        .select('*')
        .eq('id', extractedId)
        .single();

      if (extractedError || !extracted) {
        return (
          <div className="min-h-screen bg-olive-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800">Extracted opportunity not found</h3>
                <p className="text-red-700 mt-2">{extractedError?.message || 'This extracted opportunity is no longer available.'}</p>
              </div>
            </div>
          </div>
        );
      }

      const deadline = extracted.deadline ? new Date(extracted.deadline).toLocaleDateString() : null;
      const mainInfo = [
        extracted.location,
        extracted.salary_range,
        extracted.job_type
      ].filter(Boolean).join(' • ');
      const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/seeker/opportunities/extracted_${extracted.id}`;

      return (
        <div className="min-h-screen bg-olive-50">
          {/* Landing-style header to match the main site */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-olive-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/image.png" alt="Zaytoonz" className="h-10 w-auto" />
                
              </div>
              <nav className="hidden md:flex items-center space-x-6 text-olive-700 text-sm font-medium">
                <a href="/#home" className="hover:text-olive-600">Home</a>
                <a href="/#jobs" className="hover:text-olive-600">Jobs</a>
                <a href="/#training" className="hover:text-olive-600">Training</a>
                <a href="/#funding" className="hover:text-olive-600">Funding</a>
                <a href="/#about" className="hover:text-olive-600">About</a>
              </nav>
              <div className="hidden md:flex items-center gap-3">
                <a href="/auth/signin" className="text-olive-700 hover:text-olive-600 text-sm font-medium">Sign in</a>
                <a href="/auth/signup" className="bg-olive-700 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-olive-800 transition">
                  Get started
                </a>
              </div>
            </div>
          </header>

          {/* Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-olive-900 via-olive-800 to-olive-600 text-white">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.15), transparent 35%)' }} />
            <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-100 mb-3">
                {extracted.opportunity_type}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow-sm text-white">{extracted.title}</h1>
              {extracted.company && (
                <p className="mt-2 text-olive-100 text-sm">{extracted.company}</p>
              )}
              {mainInfo && (
                <p className="mt-1 text-olive-100/90 text-sm">{mainInfo}</p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {extracted.location && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                    📍 {extracted.location}
                  </span>
                )}
                {extracted.salary_range && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                    💰 {extracted.salary_range}
                  </span>
                )}
                {extracted.job_type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                    📝 {extracted.job_type}
                  </span>
                )}
                {deadline && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm">
                    ⏰ Deadline: {deadline}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-olive-100 p-6 md:p-8">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  <FavoriteOpportunity opportunityId={`extracted_${extracted.id}`} title={extracted.title} />
                  <ShareOpportunity title={extracted.title} pageUrl={pageUrl} />
                </div>
              </div>

              <div className="mt-2 grid gap-6">
                <div className="bg-olive-50 border border-olive-100 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-olive-900 mb-2">Opportunity details</h2>
                  <div className="text-olive-800 text-sm whitespace-pre-line leading-relaxed">
                    {extracted.raw_content || extracted.description || 'No content available.'}
                  </div>
                </div>
              </div>

              {extracted.source_url && (
                <div className="mt-8">
                  <a
                    href={extracted.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl bg-olive-700 text-white font-semibold shadow-sm hover:bg-olive-800 transition"
                  >
                    Apply
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Check if this is a scraped opportunity (starts with "scraped_")
    if (params.id.startsWith('scraped_')) {
      // Extract the actual scraped opportunity ID
      const scrapedId = params.id.replace('scraped_', '');
      
      // Fetch the scraped opportunity to get its source URL
      const { data: scrapedOpportunity, error: scrapedError } = await supabase
        .from('scraped_opportunities')
        .select(`
          source_url,
          scraped_opportunity_details (
            metadata
          )
        `)
        .eq('id', scrapedId)
        .eq('status', 'active')
        .single();

      if (scrapedError || !scrapedOpportunity) {
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-800">Error</h3>
                    <p className="text-red-700 mt-1">Scraped opportunity not found or no longer available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Get the specific opportunity URL from metadata.link, fallback to source_url
      const details = scrapedOpportunity.scraped_opportunity_details?.[0];
      const specificUrl = details?.metadata?.link || scrapedOpportunity.source_url;

      // Redirect to the specific opportunity URL
      redirect(specificUrl);
    }

    // Handle internal NGO opportunities
    const { opportunity, error } = await getOpportunityById(params.id);
    
    if (error || !opportunity) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{error || 'Failed to load opportunity'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pass the opportunity to the client wrapper component
    return <OpportunityPageWrapper opportunity={opportunity} />;
    
  } catch (error) {
    console.error('Error in OpportunityDetailPage:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700 mt-1">An unexpected error occurred</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} 