"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UploadButton } from "@/app/components/UploadButton";
import { 
  PencilIcon, 
  DocumentIcon, 
  InformationCircleIcon, 
  UserIcon, 
  TrashIcon,
  PhotoIcon,
  EnvelopeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  BriefcaseIcon,
  LinkIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { 
  saveNGOProfile, 
  saveAdditionalInfo, 
  saveDocuments, 
  uploadFile,
  getNGOProfile,
  NGOProfile as NGOProfileType,
  AdditionalInfo,
  Document as DocumentType
} from "@/app/lib/ngoProfile";

// Define user interface to match auth context
interface User {
  id: string;
  fullName: string;
  email: string;
  userType: 'Personne' | 'NGO' | 'Admin';
}

interface ProfileProps {
  currentUser: User | null;
}

const Profile: React.FC<ProfileProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    url: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([]);
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [newInfo, setNewInfo] = useState({
    title: "",
    content: "",
    type: "other"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [profileData, setProfileData] = useState<NGOProfileType | null>(null);
  
  // Add form state for user details
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    yearCreated: "",
    legalRepName: "",
    legalRepEmail: "",
    legalRepPhone: "",
    legalRepFunction: ""
  });

  // Fetch profile data on mount
  useEffect(() => {
    if (currentUser?.id) {
      loadProfileData(currentUser.id);
    }
  }, [currentUser]);

  const loadProfileData = async (userId: string) => {
    try {
      const { profile, error } = await getNGOProfile(userId);
      
      if (error) {
        console.error("Error loading profile:", error);
        return;
      }
      
      if (profile) {
        setProfileData(profile);
        setFormData({
          name: profile.name || currentUser?.fullName || "",
          email: profile.email || currentUser?.email || "",
          yearCreated: profile.year_created || "",
          legalRepName: profile.legal_rep_name || "",
          legalRepEmail: profile.legal_rep_email || "",
          legalRepPhone: profile.legal_rep_phone || "",
          legalRepFunction: profile.legal_rep_function || ""
        });
        
        // Set additional info if available
        if (profile.additional_info && profile.additional_info.length > 0) {
          setAdditionalInfo(profile.additional_info);
        }
        
        // Set documents if available
        if (profile.documents && profile.documents.length > 0) {
          setDocuments(profile.documents);
        }
      } else {
        // Set initial values from user data, not mock data
        setFormData({
          name: currentUser?.fullName || "",
          email: currentUser?.email || "",
          yearCreated: "",
          legalRepName: "",
          legalRepEmail: "",
          legalRepPhone: "",
          legalRepFunction: ""
        });
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInfoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateProfilePicture = async () => {
    // Open file dialog
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // Upload file to Supabase storage
        const { url, error } = await uploadFile(file, 'ngo-profile-pictures');
        
        if (error) {
          console.error("Error uploading profile picture:", error);
          return;
        }
        
        if (url) {
          // Update profile image URL in the state
          setProfileData(prev => prev ? { ...prev, profile_image_url: url } : null);
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    };
    input.click();
    setShowAvatarOptions(false);
  };

  const handleDeleteProfilePicture = () => {
    // Logic to delete profile picture
    if (profileData) {
      setProfileData({ ...profileData, profile_image_url: undefined });
    }
    setShowAvatarOptions(false);
  };

  const handleAddDocument = async () => {
    if (newDocument.name && newDocument.url) {
      // Don't generate client-side IDs, let the database handle that
      const newDoc: DocumentType = {
        name: newDocument.name,
        description: newDocument.description,
        url: newDocument.url
      };
      
      setDocuments([...documents, newDoc]);
      setNewDocument({ name: "", description: "", url: "" });
      setShowDocumentForm(false);
    }
  };

  const handleDeleteDocument = (documentId: string | undefined) => {
    if (!documentId) return;
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const handleAddInfo = () => {
    if (newInfo.title && newInfo.content) {
      // Don't generate client-side IDs, let the database handle that
      setAdditionalInfo([
        ...additionalInfo,
        {
          title: newInfo.title,
          content: newInfo.content,
          type: newInfo.type
        },
      ]);
      setNewInfo({ title: "", content: "", type: "other" });
      setShowAddInfo(false);
    }
  };

  const getIconForInfoType = (type: string) => {
    switch(type) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      case 'social':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const handleSaveAllData = async () => {
    if (!currentUser?.id) {
      setSaveStatus({
        status: 'error',
        message: 'User not authenticated. Please log in to save data.'
      });
      return;
    }
    
    // Check if using mock data (the ID exists but doesn't correspond to a real user in the database)
    if (currentUser.id === '550e8400-e29b-41d4-a716-446655440000') {
      setSaveStatus({
        status: 'error',
        message: 'Cannot save with mock user data. In production, this would save to the database.'
      });
      setTimeout(() => {
        setSaveStatus({ status: 'idle', message: '' });
      }, 5000);
      return;
    }
    
    setIsSaving(true);
    setSaveStatus({ status: 'idle', message: '' });
    
    try {
      // Prepare profile data
      const profileToSave: NGOProfileType = {
        id: profileData?.id,
        user_id: currentUser.id,
        name: formData.name,
        email: formData.email,
        year_created: formData.yearCreated,
        legal_rep_name: formData.legalRepName,
        legal_rep_email: formData.legalRepEmail,
        legal_rep_phone: formData.legalRepPhone,
        legal_rep_function: formData.legalRepFunction,
        profile_image_url: profileData?.profile_image_url
      };
      
      // Save profile data
      const { profile, error: profileError } = await saveNGOProfile(profileToSave);
      
      if (profileError) {
        throw new Error(`Error saving profile: ${profileError}`);
      }
      
      if (profile && profile.id) {
        // Save additional info
        const { error: infoError } = await saveAdditionalInfo(profile.id, additionalInfo);
        if (infoError) {
          throw new Error(`Error saving additional info: ${infoError}`);
        }
        
        // Save documents
        const { error: docsError } = await saveDocuments(profile.id, documents);
        if (docsError) {
          throw new Error(`Error saving documents: ${docsError}`);
        }
        
        // Update local state with saved data
        setProfileData(profile);
        
        // Success message
        setSaveStatus({
          status: 'success',
          message: 'Profile data saved successfully!'
        });
        
        // Clear editing state
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error saving data:", error);
      setSaveStatus({
        status: 'error',
        message: error.message || 'An error occurred while saving data.'
      });
    } finally {
      setIsSaving(false);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setSaveStatus({ status: 'idle', message: '' });
      }, 5000);
    }
  };

  if (!currentUser) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* General Information */}
      <div className="mb-10 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
            General Information
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddInfo(!showAddInfo)}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/10 transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Information
            </button>
            <button 
              onClick={toggleEditing}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            <div 
              className="relative"
              onMouseEnter={() => setShowAvatarOptions(true)}
              onMouseLeave={() => setShowAvatarOptions(false)}
            >
              <div 
                className="relative w-28 h-28 rounded-full overflow-hidden bg-gradient-to-r from-[#556B2F]/20 to-[#6B8E23]/20 border-4 border-white shadow flex-shrink-0 cursor-pointer"
              >
                {profileData?.profile_image_url ? (
                  <Image
                    src={profileData.profile_image_url}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#556B2F]">
                    <UserIcon className="h-14 w-14" />
                  </div>
                )}
              </div>
              
              {/* Avatar Edit Options */}
              {showAvatarOptions && (
                <div 
                  className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-black/50 flex items-center justify-center z-10"
                >
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateProfilePicture}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#6B8E23] hover:text-white transition-colors"
                    >
                      <PhotoIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={handleDeleteProfilePicture}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                  NGO Name
                </label>
                <input
                  type="text"
                  name="name"
                  className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="Organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                  Year of Creation
                </label>
                <input
                  type="text"
                  name="yearCreated"
                  className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                  value={formData.yearCreated}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  placeholder="Year founded"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {additionalInfo.length > 0 && (
            <div className="mt-6 border-t pt-6 border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
              <div className="space-y-3">
                {additionalInfo.map((info, index) => (
                  <div key={info.id || index} className="flex items-start p-3 border border-gray-200 rounded-lg">
                    <div className="mr-3 mt-1 text-[#556B2F]">
                      {getIconForInfoType(info.type)}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800">{info.title}</h5>
                      <p className="text-sm text-gray-600 break-all">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Information Form */}
          {showAddInfo && (
            <div className="mt-6 border-t pt-6 border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <PlusIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                Add New Information
              </h4>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] py-2.5 px-4"
                      value={newInfo.title}
                      onChange={handleInfoInputChange}
                      placeholder="Enter title (e.g. Website, Social Media, etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <input
                      type="text"
                      name="content"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] py-2.5 px-4"
                      value={newInfo.content}
                      onChange={handleInfoInputChange}
                      placeholder="Enter content (e.g. URL, social media handle, etc.)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] py-2.5 px-4"
                      value={newInfo.type}
                      onChange={handleInfoInputChange}
                    >
                      <option value="other">Other</option>
                      <option value="email">Email</option>
                      <option value="link">Website/Link</option>
                      <option value="social">Social Media</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddInfo}
                      disabled={!newInfo.title || !newInfo.content}
                      className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                    >
                      Add Information
                    </button>
                    <button
                      onClick={() => setShowAddInfo(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Official Documents */}
      <div className="mb-10 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <DocumentIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
            Official Documents
          </h3>
        </div>
        
        <div className="p-6">
          {documents.length > 0 ? (
            <div className="space-y-4 mb-6">
              {documents.map((doc, index) => (
                <div key={doc.id || index} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-medium text-gray-800">{doc.name}</h4>
                    <p className="text-sm text-gray-600">{doc.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6B8E23] hover:text-[#556B2F] transition-colors font-medium"
                    >
                      View Document
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Delete document"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-6">No documents uploaded yet.</p>
          )}
          
          {showDocumentForm && (
            <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 document-form">
              <h4 className="font-medium mb-4 text-gray-800 flex items-center">
                <PencilIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
                Add New Document
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] py-2.5 px-4"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="Enter document name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] py-2.5 px-4"
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                    placeholder="Enter a brief description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                  <div className="flex gap-2 items-center">
                    <UploadButton
                      label="Select Document"
                      onUpload={(url: string) => setNewDocument({ ...newDocument, url })}
                      bucket="ngo-documents"
                      path="uploads"
                    />
                    <button
                      onClick={handleAddDocument}
                      disabled={!newDocument.name || !newDocument.url}
                      className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6B8E23] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                    >
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Add More Documents Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setNewDocument({ name: "", description: "", url: "" });
                setShowDocumentForm(!showDocumentForm); // Toggle form visibility
                // Only scroll if we're showing the form, not hiding it
                if (!showDocumentForm) {
                  setTimeout(() => {
                    const formElement = document.querySelector('.document-form');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }
              }}
              className="px-4 py-2 border border-[#556B2F] text-[#556B2F] rounded-lg hover:bg-[#556B2F]/10 focus:outline-none focus:ring-2 focus:ring-[#556B2F] focus:ring-offset-2 transition-all duration-200 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {showDocumentForm ? "Hide Document Form" : "Add More Documents"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Legal Representative */}
      <div className="mb-10 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-[#556B2F]" />
            Legal Representative
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <UserIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                Full Name
              </label>
              <input
                type="text"
                name="legalRepName"
                className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                value={formData.legalRepName}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Legal representative name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                Email
              </label>
              <input
                type="email"
                name="legalRepEmail"
                className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                value={formData.legalRepEmail}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Legal representative email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                Phone Number
              </label>
              <input
                type="tel"
                name="legalRepPhone"
                className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                value={formData.legalRepPhone}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Legal representative phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <BriefcaseIcon className="h-4 w-4 mr-1 text-[#556B2F]" />
                Function
              </label>
              <input
                type="text"
                name="legalRepFunction"
                className={`block w-full rounded-lg border ${isEditing ? 'border-[#6B8E23]' : 'border-gray-200'} shadow-sm focus:border-[#6B8E23] focus:ring-[#6B8E23] ${isEditing ? 'bg-white' : 'bg-gray-50'} py-2.5 px-4 transition-all duration-200`}
                value={formData.legalRepFunction}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="Legal representative function"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleSaveAllData}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6B8E23] focus:ring-offset-2 transition-all duration-200 flex items-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Profile...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Save All Changes to Database
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {saveStatus.status !== 'idle' && (
        <div className={`mb-10 p-4 rounded-lg flex items-center ${
          saveStatus.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {saveStatus.status === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          )}
          {saveStatus.message}
        </div>
      )}
    </div>
  );
};

export default Profile; 