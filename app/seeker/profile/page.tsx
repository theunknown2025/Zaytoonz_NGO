'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { 
  UserIcon, 
  CameraIcon, 
  PlusIcon, 
  XMarkIcon, 
  BellIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon as XIcon,
  CalendarIcon,
  FlagIcon,
  ClockIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { saveProfile, getProfile, SeekerProfileData } from './supabaseService';
import { countries, Country } from './countries';

interface ProfileData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  latestJobTitle: string;
  yearsOfExperience: number | '';
  fieldsOfExperience: string[];
  aboutMe: string;
  profilePicture: File | null;
  profilePictureUrl: string;
}

export default function SeekerProfile() {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    latestJobTitle: '',
    yearsOfExperience: '',
    fieldsOfExperience: [],
    aboutMe: '',
    profilePicture: null,
    profilePictureUrl: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [newField, setNewField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Nationality dropdown states
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);

  // Load existing profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  // Filter countries based on search
  useEffect(() => {
    if (nationalitySearch.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(nationalitySearch.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [nationalitySearch]);

  const loadProfileData = async () => {
    try {
      setIsLoadingData(true);
      
      const { data, error } = await getProfile();
      
      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfileData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          dateOfBirth: data.date_of_birth || '',
          nationality: data.nationality || '',
          latestJobTitle: data.latest_job_title || '',
          yearsOfExperience: data.years_of_experience || '',
          fieldsOfExperience: data.fields_of_experience || [],
          aboutMe: data.about_me || '',
          profilePicture: null,
          profilePictureUrl: data.profile_picture_url || ''
        });
        
        // Set preview URL if profile picture exists
        if (data.profile_picture_url) {
          setPreviewUrl(data.profile_picture_url);
        }
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setProfileData(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addField = () => {
    if (newField.trim()) {
      const fields = newField.split(',').map(field => field.trim()).filter(field => field);
      
      setProfileData(prev => ({
        ...prev,
        fieldsOfExperience: [...prev.fieldsOfExperience, ...fields]
      }));
      setNewField('');
    }
  };

  const removeField = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      fieldsOfExperience: prev.fieldsOfExperience.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addField();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data for Supabase
      const dataToSave: SeekerProfileData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dateOfBirth: profileData.dateOfBirth || undefined,
        nationality: profileData.nationality || undefined,
        latestJobTitle: profileData.latestJobTitle || undefined,
        yearsOfExperience: typeof profileData.yearsOfExperience === 'number' ? profileData.yearsOfExperience : undefined,
        fieldsOfExperience: profileData.fieldsOfExperience,
        aboutMe: profileData.aboutMe || undefined,
        profilePictureUrl: profileData.profilePictureUrl || undefined
      };

      // Save profile with image
      const { data, error } = await saveProfile(dataToSave, profileData.profilePicture || undefined);
      
      if (error) {
        console.error('Error saving profile:', error);
        const errorMessage = error.message || error.toString();
        alert('Error saving profile: ' + errorMessage);
        return;
      }

      // Update local state with saved data
      if (data && data.profile_picture_url) {
        setProfileData(prev => ({
          ...prev,
          profilePictureUrl: data.profile_picture_url,
          profilePicture: null // Clear the file object after successful upload
        }));
        setPreviewUrl(data.profile_picture_url);
      }

      alert('Profile saved successfully!');
      setEditMode(false); // Exit edit mode after successful save
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const errorMessage = error.message || error.toString();
      alert('Error saving profile: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reload original data
    loadProfileData();
  };

  const selectNationality = (country: Country) => {
    setProfileData(prev => ({
      ...prev,
      nationality: country.name
    }));
    setShowNationalityDropdown(false);
    setNationalitySearch('');
  };

  const toggleNationalityDropdown = () => {
    setShowNationalityDropdown(!showNationalityDropdown);
    if (!showNationalityDropdown) {
      setNationalitySearch('');
    }
  };

  // Show loading spinner while data is being loaded
  if (isLoadingData) {
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
        
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-8 h-8 border-4 border-olive-medium border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

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
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Profile</h2>
              <p className="text-gray-600">
                {editMode 
                  ? "Edit your profile information below."
                  : "Complete your profile to help employers find you and increase your chances of getting hired."
                }
              </p>
            </div>
            {!editMode ? (
              <button
                onClick={toggleEditMode}
                className="px-4 py-2 bg-olive-medium hover:bg-olive-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <XIcon className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {previewUrl || profileData.profilePictureUrl ? (
                  <img 
                    src={previewUrl || profileData.profilePictureUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {editMode && (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-olive-medium hover:bg-olive-dark text-white p-2 rounded-full shadow-lg transition-colors"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {editMode && (
              <p className="text-sm text-gray-500 text-center">
                Click the camera icon to upload your profile picture<br />
                Maximum file size: 5MB
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-olive-medium" />
                First Name *
              </label>
              {editMode ? (
                <input
                  type="text"
                  required
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  placeholder="Enter your first name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.firstName || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-olive-medium" />
                Last Name *
              </label>
              {editMode ? (
                <input
                  type="text"
                  required
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  placeholder="Enter your last name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.lastName || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-olive-medium" />
                Date of Birth
              </label>
              {editMode ? (
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FlagIcon className="w-4 h-4 text-olive-medium" />
                Nationality
              </label>
              {editMode ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleNationalityDropdown}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors flex items-center justify-between bg-white"
                  >
                    <span className={profileData.nationality ? 'text-gray-800' : 'text-gray-500'}>
                      {profileData.nationality || 'Select your nationality'}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  </button>
                  
                  {showNationalityDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={nationalitySearch}
                            onChange={(e) => setNationalitySearch(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-olive-medium focus:border-olive-medium"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectNationality(country)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {country.name}
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-center">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.nationality || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-olive-medium" />
                Latest Job Title
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={profileData.latestJobTitle}
                  onChange={(e) => handleInputChange('latestJobTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.latestJobTitle || 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-olive-medium" />
                Years of Experience
              </label>
              {editMode ? (
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={profileData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                  placeholder="0"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-800">
                    {profileData.yearsOfExperience ? `${profileData.yearsOfExperience} years` : 'Not specified'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fields of Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <BriefcaseIcon className="w-4 h-4 text-olive-medium" />
              Fields of Experience
              <span className="text-xs text-gray-500 font-normal ml-2 italic">
                (Add your areas of expertise. You can enter multiple fields separated by commas)
              </span>
            </label>
            {editMode ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors"
                    placeholder="Enter fields separated by commas (e.g., Marketing, Sales, Project Management)"
                  />
                  <button
                    type="button"
                    onClick={addField}
                    className="px-4 py-3 bg-olive-medium hover:bg-olive-dark text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                {profileData.fieldsOfExperience.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profileData.fieldsOfExperience.map((field, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-olive-light text-olive-dark rounded-full text-sm border border-olive-medium/20"
                      >
                        {field}
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-olive-dark hover:text-red-600 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                {profileData.fieldsOfExperience.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.fieldsOfExperience.map((field, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-olive-light text-olive-dark rounded-full text-sm"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500">No fields of experience specified</span>
                )}
              </div>
            )}
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-olive-medium" />
              About Me
              <span className="text-xs text-gray-500 font-normal ml-2 italic">
                (Write a compelling summary that highlights your strengths and career objectives)
              </span>
            </label>
            {editMode ? (
              <>
                <textarea
                  rows={6}
                  value={profileData.aboutMe}
                  onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olive-medium focus:border-olive-medium transition-colors resize-none"
                  placeholder="Tell employers about yourself, your experience, goals, and what makes you unique..."
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-400">
                    {profileData.aboutMe.length}/1000
                  </span>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800 whitespace-pre-wrap">
                  {profileData.aboutMe || 'No description provided'}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button - Only show in edit mode */}
          {editMode && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-olive-medium hover:bg-olive-dark disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 