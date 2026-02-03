'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  InformationCircleIcon,
  LinkIcon,
  PhoneIcon,
  BriefcaseIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { Briefcase, GraduationCap, DollarSign, ArrowRight } from 'lucide-react';

interface NGOProfile {
  id: string;
  name: string;
  email: string;
  year_created?: string;
  legal_rep_name?: string;
  legal_rep_email?: string;
  legal_rep_phone?: string;
  legal_rep_function?: string;
  profile_image_url?: string;
  banner_url?: string;
  logo_url?: string;
  mission_statement?: string;
  additional_info?: Array<{
    id?: string;
    title: string;
    content: string;
    type: string;
  }>;
  documents?: Array<{
    id?: string;
    name: string;
    description?: string;
    url: string;
  }>;
}

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'funding' | 'training';
  created_at: string;
}

interface NGOData {
  profile: NGOProfile;
  opportunities: Opportunity[];
  stats: {
    jobs_count: number;
    fundings_count: number;
    trainings_count: number;
    total_opportunities: number;
  };
}

export default function PublicNGOProfilePage() {
  const params = useParams();
  const ngoId = params.id as string;
  const [data, setData] = useState<NGOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNGOData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/ngos/${ngoId}`);
        const result = await response.json();

        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch (err) {
        console.error('Error fetching NGO data:', err);
        setError('Failed to load NGO profile');
      } finally {
        setLoading(false);
      }
    };

    if (ngoId) {
      fetchNGOData();
    }
  }, [ngoId]);

  const getIconForInfoType = (type: string) => {
    switch(type) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      case 'social':
        return <UserIcon className="h-5 w-5" />;
      default:
        return <InformationCircleIcon className="h-5 w-5" />;
    }
  };

  const getOpportunityTypeIcon = (type: string) => {
    switch(type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'funding':
        return <DollarSign className="h-4 w-4" />;
      case 'training':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getOpportunityTypeLabel = (type: string) => {
    switch(type) {
      case 'job':
        return 'Job';
      case 'funding':
        return 'Funding';
      case 'training':
        return 'Training';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Landing Page Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
              </Link>
            </div>
          </div>
        </header>

        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
              </Link>
            </div>
          </div>
        </header>
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">{error || 'NGO profile not found'}</p>
            <Link href="/" className="text-[#556B2F] hover:text-[#6B8E23] underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, opportunities, stats } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Landing Page Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
            </Link>
            <Link 
              href="/" 
              className="text-olive-700 hover:text-olive-600 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Banner Section */}
        <div className="relative w-full h-64 md:h-80 overflow-hidden bg-gradient-to-r from-[#556B2F] to-[#6B8E23]">
          {profile.banner_url ? (
            <img
              src={profile.banner_url}
              alt={`${profile.name} Banner`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading banner image:", profile.banner_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-24 w-24 text-white/30" />
            </div>
          )}
          
          {/* Logo Overlay */}
          <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10">
            <div className="relative w-36 h-36 rounded-xl bg-white shadow-2xl border-4 border-white flex items-center justify-center overflow-visible">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={`${profile.name} Logo`}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ padding: '8px' }}
                  onError={(e) => {
                    console.error("Error loading logo image:", profile.logo_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-lg">
                  <BuildingOfficeIcon className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="pt-20 pb-6 px-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {profile.name}
                </h1>
                {profile.year_created && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <CalendarIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                    <span>Established in {profile.year_created}</span>
                  </div>
                )}
              </div>
              {profile.email && (
                <div className="flex items-center text-gray-700">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                  <a 
                    href={`mailto:${profile.email}`}
                    className="hover:text-[#6B8E23] transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mission Statement Section */}
          {profile.mission_statement && (
            <div className="px-8 py-8 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] flex items-center justify-center">
                    <InformationCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                    {profile.mission_statement}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Section */}
          {opportunities.length > 0 && (
            <div className="px-8 py-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BriefcaseIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
                  Opportunities ({stats.total_opportunities})
                </h2>
                <div className="flex gap-4 text-sm text-gray-600">
                  {stats.jobs_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{stats.jobs_count} Jobs</span>
                    </div>
                  )}
                  {stats.fundings_count > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{stats.fundings_count} Fundings</span>
                    </div>
                  )}
                  {stats.trainings_count > 0 && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{stats.trainings_count} Trainings</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.id}
                    href={`/seeker/opportunities/${opp.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-[#6B8E23] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          opp.type === 'job' ? 'bg-blue-100 text-blue-600' :
                          opp.type === 'funding' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {getOpportunityTypeIcon(opp.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#6B8E23] transition-colors">
                            {opp.title}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {getOpportunityTypeLabel(opp.type)}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#6B8E23] group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information Section */}
          {profile.additional_info && profile.additional_info.length > 0 && (
            <div className="px-8 py-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <LinkIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.additional_info.map((info, index) => (
                  <div 
                    key={info.id || index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#6B8E23] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-[#556B2F]">
                        {getIconForInfoType(info.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        {info.type === 'link' ? (
                          <a 
                            href={info.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6B8E23] hover:text-[#556B2F] break-all"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-gray-700 break-all">{info.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Representative Section */}
          <div className="px-8 py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
              Legal Representative
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-medium text-gray-900">{profile.legal_rep_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BriefcaseIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Function</p>
                  <p className="font-medium text-gray-900">{profile.legal_rep_function || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a 
                    href={`mailto:${profile.legal_rep_email}`}
                    className="font-medium text-[#6B8E23] hover:text-[#556B2F]"
                  >
                    {profile.legal_rep_email || 'N/A'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <a 
                    href={`tel:${profile.legal_rep_phone}`}
                    className="font-medium text-[#6B8E23] hover:text-[#556B2F]"
                  >
                    {profile.legal_rep_phone || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {profile.documents && profile.documents.length > 0 && (
            <div className="px-8 py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <DocumentIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
                Official Documents
              </h2>
              <div className="space-y-3">
                {profile.documents.map((doc, index) => (
                  <div 
                    key={doc.id || index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-[#6B8E23] hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{doc.name}</h3>
                      {doc.description && (
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      )}
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md transition-all"
                    >
                      View Document
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
