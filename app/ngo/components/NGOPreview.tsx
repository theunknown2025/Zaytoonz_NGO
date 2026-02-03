"use client";

import { useState, useEffect } from "react";
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  InformationCircleIcon,
  LinkIcon,
  PhoneIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";
import { 
  getNGOProfile,
  NGOProfile as NGOProfileType,
  AdditionalInfo,
  Document as DocumentType
} from "@/app/lib/ngoProfile";

interface NGOPreviewProps {
  profileData: NGOProfileType | null;
  isLoading?: boolean;
}

const NGOPreview: React.FC<NGOPreviewProps> = ({ profileData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No profile data available to display.</p>
      </div>
    );
  }

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

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Banner Section */}
      <div className="relative w-full h-64 md:h-80 rounded-t-2xl overflow-hidden bg-gradient-to-r from-[#556B2F] to-[#6B8E23]">
        {profileData.banner_url ? (
          <img
            src={profileData.banner_url}
            alt={`${profileData.name} Banner`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Error loading banner image:", profileData.banner_url);
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
            {profileData.logo_url ? (
              <img
                src={profileData.logo_url}
                alt={`${profileData.name} Logo`}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                style={{ padding: '8px' }}
                onError={(e) => {
                  console.error("Error loading logo image:", profileData.logo_url);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("✅ Logo loaded successfully in preview");
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
      <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
        {/* Header Section */}
        <div className="pt-20 pb-6 px-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {profileData.name}
              </h1>
              {profileData.year_created && (
                <div className="flex items-center text-gray-600 mb-4">
                  <CalendarIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                  <span>Established in {profileData.year_created}</span>
                </div>
              )}
            </div>
            {profileData.email && (
              <div className="flex items-center text-gray-700">
                <EnvelopeIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                <a 
                  href={`mailto:${profileData.email}`}
                  className="hover:text-[#6B8E23] transition-colors"
                >
                  {profileData.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Mission Statement Section */}
        {profileData.mission_statement && (
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
                  {profileData.mission_statement}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information Section */}
        {profileData.additional_info && profileData.additional_info.length > 0 && (
          <div className="px-8 py-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <LinkIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.additional_info.map((info, index) => (
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
                <p className="font-medium text-gray-900">{profileData.legal_rep_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BriefcaseIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Function</p>
                <p className="font-medium text-gray-900">{profileData.legal_rep_function || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <a 
                  href={`mailto:${profileData.legal_rep_email}`}
                  className="font-medium text-[#6B8E23] hover:text-[#556B2F]"
                >
                  {profileData.legal_rep_email || 'N/A'}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 mt-1 text-[#556B2F] flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <a 
                  href={`tel:${profileData.legal_rep_phone}`}
                  className="font-medium text-[#6B8E23] hover:text-[#556B2F]"
                >
                  {profileData.legal_rep_phone || 'N/A'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        {profileData.documents && profileData.documents.length > 0 && (
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentIcon className="h-6 w-6 mr-2 text-[#556B2F]" />
              Official Documents
            </h2>
            <div className="space-y-3">
              {profileData.documents.map((doc, index) => (
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
  );
};

export default NGOPreview;
