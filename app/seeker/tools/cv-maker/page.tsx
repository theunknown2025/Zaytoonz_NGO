'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  BellIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  FolderIcon,
  CheckIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import components
import GeneralSection from './components/GeneralSection';
import WorkSection from './components/WorkSection';
import EducationSection from './components/EducationSection';
import SkillsSection from './components/SkillsSection';
import LanguagesSection from './components/LanguagesSection';
import SummarySection from './components/SummarySection';
import CertificatesSection from './components/CertificatesSection';
import ProjectsSection from './components/ProjectsSection';
import AdditionalSection from './components/AdditionalSection';
import PlaceholderSection from './components/PlaceholderSection';
import ExternalLinksSection from './components/ExternalLinksSection';

// Import types
import { CVData, ExternalLink } from './types';

// Import Supabase service
import { saveCV, getCVs, getCVById, deleteCV, updateCVName } from './supabaseService';
import { toast, Toaster } from 'react-hot-toast';

export default function CVMaker() {
  // State for section management
  const [activeSection, setActiveSection] = useState('general');
  const [expandedSections, setExpandedSections] = useState(['general', 'work', 'education']);
  const [addedSections, setAddedSections] = useState(['general', 'work', 'education']);
  const [availableSections, setAvailableSections] = useState([
    'skills',
    'languages',
    'summary',
    'certificates',
    'projects',
    'volunteering',
    'publications',
    'references',
    'additional',
    'externalLinks'
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  
  // Saved CVs management
  const [savedCVs, setSavedCVs] = useState<any[]>([]);
  const [currentCVId, setCurrentCVId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [cvName, setCvName] = useState('');
  const [isCVModified, setIsCVModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(true);
  
  // Tab management
  const [activeTab, setActiveTab] = useState('create');
  
  // Export state
  const cvRef = useRef<HTMLDivElement>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // CV Data State
  const [cvData, setCvData] = useState<CVData>({
    general: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      nationality: '',
      birthDate: '',
      gender: '',
    },
    work: [
      {
        id: 1,
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      }
    ],
    education: [
      {
        id: 1,
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
      }
    ],
    skills: [
      {
        id: 1,
        name: '',
        level: 'intermediate'
      }
    ],
    languages: [
      {
        id: 1,
        language: '',
        proficiency: 'intermediate'
      }
    ],
    summary: '',
    certificates: [
      {
        id: 1,
        name: '',
        issuer: '',
        date: '',
        description: '',
      }
    ],
    projects: [
      {
        id: 1,
        title: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        url: '',
      }
    ],
    volunteering: [],
    publications: [],
    references: [],
    additional: '',
    externalLinks: []
  });

  // Load saved CVs from database on component mount
  useEffect(() => {
    const loadSavedCVs = async () => {
      setCvLoading(true);
      try {
        const { data, error } = await getCVs();
        if (error) {
          console.error('Error loading CVs:', error);
          toast.error('Failed to load saved CVs');
        } else if (data) {
          setSavedCVs(data);
        }
      } catch (err) {
        console.error('Error in CV fetch:', err);
        toast.error('Failed to load saved CVs');
      } finally {
        setCvLoading(false);
      }
    };

    loadSavedCVs();
  }, []);
  
  // Set up listener to track CV changes
  useEffect(() => {
    if (currentCVId) {
      setIsCVModified(true);
    }
  }, [cvData, addedSections, currentCVId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleSection = (section: string) => {
    if (expandedSections.includes(section)) {
      setExpandedSections(expandedSections.filter(s => s !== section));
    } else {
      setExpandedSections([...expandedSections, section]);
    }
    setActiveSection(section);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCvData({
      ...cvData,
      general: {
        ...cvData.general,
        [name]: value
      }
    });
    setIsCVModified(true);
  };

  const handleWorkChange = (index: number, field: string, value: string | boolean) => {
    const updatedWork = [...cvData.work];
    updatedWork[index] = {
      ...updatedWork[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      work: updatedWork
    });
    setIsCVModified(true);
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updatedEducation = [...cvData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      education: updatedEducation
    });
    setIsCVModified(true);
  };

  const addWorkExperience = () => {
    setCvData({
      ...cvData,
      work: [
        ...cvData.work,
        {
          id: Date.now(),
          position: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeWorkExperience = (index: number) => {
    if (cvData.work.length > 1) {
      const updatedWork = [...cvData.work];
      updatedWork.splice(index, 1);
      setCvData({
        ...cvData,
        work: updatedWork
      });
      setIsCVModified(true);
    }
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          id: Date.now(),
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeEducation = (index: number) => {
    if (cvData.education.length > 1) {
      const updatedEducation = [...cvData.education];
      updatedEducation.splice(index, 1);
      setCvData({
        ...cvData,
        education: updatedEducation
      });
      setIsCVModified(true);
    }
  };

  const addSection = (section: string) => {
    setAddedSections([...addedSections, section]);
    setExpandedSections([...expandedSections, section]);
    setAvailableSections(availableSections.filter(s => s !== section));
    setActiveSection(section);
    setIsDropdownOpen(false);
    setIsCVModified(true);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSectionSelect = (section: string) => {
    addSection(section);
  };

  const getSectionTitle = (section: string) => {
    const titles: {[key: string]: string} = {
      general: 'Personal Information',
      work: 'Work Experience',
      education: 'Education and Training',
      skills: 'Skills',
      languages: 'Language Skills',
      summary: 'Profile Summary',
      certificates: 'Certificates & Courses',
      projects: 'Projects',
      volunteering: 'Volunteering Experience',
      publications: 'Publications',
      references: 'References',
      additional: 'Additional Information',
      externalLinks: 'External Links'
    };
    return titles[section] || section;
  };

  const handleSkillChange = (index: number, field: string, value: string) => {
    const updatedSkills = [...cvData.skills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      skills: updatedSkills
    });
    setIsCVModified(true);
  };

  const addSkill = () => {
    setCvData({
      ...cvData,
      skills: [
        ...cvData.skills,
        {
          id: Date.now(),
          name: '',
          level: 'intermediate'
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeSkill = (index: number) => {
    if (cvData.skills.length > 1) {
      const updatedSkills = [...cvData.skills];
      updatedSkills.splice(index, 1);
      setCvData({
        ...cvData,
        skills: updatedSkills
      });
      setIsCVModified(true);
    }
  };

  const handleLanguageChange = (index: number, field: string, value: string) => {
    const updatedLanguages = [...cvData.languages];
    updatedLanguages[index] = {
      ...updatedLanguages[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      languages: updatedLanguages
    });
    setIsCVModified(true);
  };

  const addLanguage = () => {
    setCvData({
      ...cvData,
      languages: [
        ...cvData.languages,
        {
          id: Date.now(),
          language: '',
          proficiency: 'intermediate'
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeLanguage = (index: number) => {
    if (cvData.languages.length > 1) {
      const updatedLanguages = [...cvData.languages];
      updatedLanguages.splice(index, 1);
      setCvData({
        ...cvData,
        languages: updatedLanguages
      });
      setIsCVModified(true);
    }
  };

  const handleSummaryChange = (value: string) => {
    setCvData({
      ...cvData,
      summary: value
    });
    setIsCVModified(true);
  };

  const handleCertificateChange = (index: number, field: string, value: string) => {
    const updatedCertificates = [...cvData.certificates];
    updatedCertificates[index] = {
      ...updatedCertificates[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      certificates: updatedCertificates
    });
    setIsCVModified(true);
  };

  const addCertificate = () => {
    setCvData({
      ...cvData,
      certificates: [
        ...cvData.certificates,
        {
          id: Date.now(),
          name: '',
          issuer: '',
          date: '',
          description: ''
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeCertificate = (index: number) => {
    if (cvData.certificates.length > 1) {
      const updatedCertificates = [...cvData.certificates];
      updatedCertificates.splice(index, 1);
      setCvData({
        ...cvData,
        certificates: updatedCertificates
      });
      setIsCVModified(true);
    }
  };

  const handleAdditionalChange = (value: string) => {
    setCvData({
      ...cvData,
      additional: value
    });
    setIsCVModified(true);
  };

  const handleExternalLinkChange = (index: number, field: string, value: string) => {
    const updatedExternalLinks = [...cvData.externalLinks];
    updatedExternalLinks[index] = {
      ...updatedExternalLinks[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      externalLinks: updatedExternalLinks
    });
    setIsCVModified(true);
  };

  const addExternalLink = () => {
    setCvData({
      ...cvData,
      externalLinks: [
        ...cvData.externalLinks,
        {
          id: Date.now(),
          platform: '',
          url: '',
          displayName: ''
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeExternalLink = (index: number) => {
    const updatedExternalLinks = [...cvData.externalLinks];
    updatedExternalLinks.splice(index, 1);
    setCvData({
      ...cvData,
      externalLinks: updatedExternalLinks
    });
    setIsCVModified(true);
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    const updatedProjects = [...cvData.projects];
    updatedProjects[index] = {
      ...updatedProjects[index],
      [field]: value
    };
    setCvData({
      ...cvData,
      projects: updatedProjects
    });
    setIsCVModified(true);
  };

  const addProject = () => {
    setCvData({
      ...cvData,
      projects: [
        ...cvData.projects,
        {
          id: Date.now(),
          title: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
          url: ''
        }
      ]
    });
    setIsCVModified(true);
  };

  const removeProject = (index: number) => {
    if (cvData.projects.length > 1) {
      const updatedProjects = [...cvData.projects];
      updatedProjects.splice(index, 1);
      setCvData({
        ...cvData,
        projects: updatedProjects
      });
      setIsCVModified(true);
    }
  };

  // Add these new functions for section navigation
  const moveSection = (index: number, direction: number) => {
    // Create a copy of the sections array
    const newOrder = [...addedSections];
    
    // Calculate new position
    const newIndex = index + direction;
    
    // Check if the new position is valid
    if (newIndex < 0 || newIndex >= newOrder.length) {
      return; // Can't move outside bounds
    }
    
    // Swap positions
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    
    // Update state with new order
    setAddedSections(newOrder);
    setIsCVModified(true);
  };

  const removeSection = (sectionToRemove: string) => {
    // Don't allow removal of core sections
    if (['general', 'work', 'education'].includes(sectionToRemove)) {
      return;
    }
    
    // Remove from added sections
    setAddedSections(addedSections.filter(section => section !== sectionToRemove));
    
    // Remove from expanded sections if it's expanded
    if (expandedSections.includes(sectionToRemove)) {
      setExpandedSections(expandedSections.filter(section => section !== sectionToRemove));
    }
    
    // Add back to available sections
    setAvailableSections([...availableSections, sectionToRemove]);
    setIsCVModified(true);
  };

  // Function to handle CV export
  const handleExportCV = async () => {
    try {
      // Set loading state and show the modal
      setExportLoading(true);
      setIsExportModalOpen(true);
      
      // Ensure we have valid data
      if (!cvData.general.firstName || !cvData.general.lastName) {
        throw new Error('Please fill in at least your first and last name in the Personal Information section');
      }

      // Short delay to ensure modal appears
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create a temporary div for the CV content
      const cvContent = document.createElement('div');
      cvContent.className = 'cv-export-container';
      document.body.appendChild(cvContent);
      
      // Create styles for the CV export
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .cv-export-container {
          width: 210mm;
          padding: 15mm;
          background: white;
          font-family: Arial, sans-serif;
          color: #333;
        }
        .cv-export-header {
          border-bottom: 2px solid #004d00;
          padding-bottom: 10mm;
          margin-bottom: 10mm;
        }
        .cv-export-name {
          font-size: 24pt;
          font-weight: bold;
          color: #004d00;
          margin-bottom: 5mm;
        }
        .cv-export-contact {
          display: flex;
          flex-wrap: wrap;
          gap: 5mm;
          font-size: 10pt;
        }
        .cv-export-section {
          margin-bottom: 10mm;
        }
        .cv-export-section-title {
          font-size: 14pt;
          font-weight: bold;
          color: #004d00;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2mm;
          margin-bottom: 5mm;
        }
        .cv-export-item {
          margin-bottom: 5mm;
        }
        .cv-export-item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 2mm;
        }
        .cv-export-item-title {
          font-weight: bold;
        }
        .cv-export-item-subtitle {
          font-style: italic;
        }
        .cv-export-item-dates {
          font-size: 9pt;
          color: #666;
        }
        .cv-export-item-description {
          font-size: 10pt;
          margin-top: 2mm;
        }
        .cv-export-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 3mm;
        }
        .cv-export-skill {
          background: #f5f5f5;
          padding: 2mm 3mm;
          border-radius: 3mm;
          font-size: 9pt;
        }
      `;
      document.head.appendChild(styleElement);
      
      // Generate content based on CV data
      let europassContent = '';
      
      // Header with personal info
      if (cvData.general) {
        const { firstName, lastName, email, phone, address } = cvData.general;
        europassContent += `
          <div class="cv-export-header">
            <div class="cv-export-name">${firstName || ''} ${lastName || ''}</div>
            <div class="cv-export-contact">
              ${email ? `<div>${email}</div>` : ''}
              ${phone ? `<div>${phone}</div>` : ''}
              ${address ? `<div>${address}</div>` : ''}
            </div>
          </div>
        `;
      }
      
      // Generate content for each section in the order they appear
      addedSections.forEach(section => {
        switch(section) {
          case 'summary':
            if (cvData.summary) {
              europassContent += `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Profile</div>
                  <div class="cv-export-item-description">${cvData.summary}</div>
                </div>
              `;
            }
            break;
            
          case 'work':
            if (cvData.work && cvData.work.length > 0) {
              let workContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Work Experience</div>
              `;
              
              cvData.work.forEach(work => {
                const { position, company, location, startDate, endDate, current, description } = work;
                const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                const formattedEndDate = current ? 'Present' : (endDate ? new Date(endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '');
                
                workContent += `
                  <div class="cv-export-item">
                    <div class="cv-export-item-header">
                      <div class="cv-export-item-title">${position || ''}</div>
                      <div class="cv-export-item-dates">${formattedStartDate} - ${formattedEndDate}</div>
                    </div>
                    <div class="cv-export-item-subtitle">${company || ''}${location ? `, ${location}` : ''}</div>
                    ${description ? `<div class="cv-export-item-description">${description}</div>` : ''}
                  </div>
                `;
              });
              
              workContent += `</div>`;
              europassContent += workContent;
            }
            break;
            
          case 'education':
            if (cvData.education && cvData.education.length > 0) {
              let educationContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Education and Training</div>
              `;
              
              cvData.education.forEach(education => {
                const { degree, institution, location, startDate, endDate, description } = education;
                const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                
                educationContent += `
                  <div class="cv-export-item">
                    <div class="cv-export-item-header">
                      <div class="cv-export-item-title">${degree}</div>
                      <div class="cv-export-item-dates">${formattedStartDate} - ${formattedEndDate}</div>
                    </div>
                    <div class="cv-export-item-subtitle">${institution}${location ? `, ${location}` : ''}</div>
                    ${description ? `<div class="cv-export-item-description">${description}</div>` : ''}
                  </div>
                `;
              });
              
              educationContent += `</div>`;
              europassContent += educationContent;
            }
            break;
            
          case 'skills':
            if (cvData.skills && cvData.skills.length > 0) {
              let skillsContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Skills</div>
                  <div class="cv-export-skills">
              `;
              
              cvData.skills.forEach(skill => {
                if (skill.name) {
                  skillsContent += `
                    <div class="cv-export-skill">
                      ${skill.name} (${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)})
                    </div>
                  `;
                }
              });
              
              skillsContent += `</div></div>`;
              europassContent += skillsContent;
            }
            break;
            
          case 'languages':
            if (cvData.languages && cvData.languages.length > 0) {
              let languagesContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Languages</div>
                  <div class="cv-export-skills">
              `;
              
              cvData.languages.forEach(language => {
                if (language.language) {
                  const proficiencyMap: {[key: string]: string} = {
                    'beginner': 'A1/A2',
                    'intermediate': 'B1/B2',
                    'advanced': 'C1',
                    'native': 'C2/Native'
                  };
                  
                  languagesContent += `
                    <div class="cv-export-skill">
                      ${language.language} (${proficiencyMap[language.proficiency] || language.proficiency})
                    </div>
                  `;
                }
              });
              
              languagesContent += `</div></div>`;
              europassContent += languagesContent;
            }
            break;
            
          case 'certificates':
            if (cvData.certificates && cvData.certificates.length > 0) {
              let certificatesContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Certificates & Courses</div>
              `;
              
              cvData.certificates.forEach(certificate => {
                const { name, issuer, date, description } = certificate;
                const formattedDate = date ? new Date(date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                
                certificatesContent += `
                  <div class="cv-export-item">
                    <div class="cv-export-item-title">${name}</div>
                    <div class="cv-export-item-subtitle">${issuer}${formattedDate ? ` (${formattedDate})` : ''}</div>
                    ${description ? `<div class="cv-export-item-description">${description}</div>` : ''}
                  </div>
                `;
              });
              
              certificatesContent += `</div>`;
              europassContent += certificatesContent;
            }
            break;
            
          case 'projects':
            if (cvData.projects && cvData.projects.length > 0) {
              let projectsContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Projects</div>
              `;
              
              cvData.projects.forEach(project => {
                const { title, role, startDate, endDate, description, url } = project;
                const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
                const dateRange = formattedStartDate || formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : '';
                
                projectsContent += `
                  <div class="cv-export-item">
                    <div class="cv-export-item-header">
                      <div class="cv-export-item-title">${title}</div>
                      ${dateRange ? `<div class="cv-export-item-dates">${dateRange}</div>` : ''}
                    </div>
                    ${role ? `<div class="cv-export-item-subtitle">${role}</div>` : ''}
                    ${description ? `<div class="cv-export-item-description">${description}</div>` : ''}
                    ${url ? `<div class="cv-export-item-description"><a href="${url}" target="_blank">${url}</a></div>` : ''}
                  </div>
                `;
              });
              
              projectsContent += `</div>`;
              europassContent += projectsContent;
            }
            break;
            
          case 'additional':
            if (cvData.additional) {
              europassContent += `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">Additional Information</div>
                  <div class="cv-export-item-description">${cvData.additional.replace(/\n/g, '<br>')}</div>
                </div>
              `;
            }
            break;
            
          case 'externalLinks':
            if (cvData.externalLinks && cvData.externalLinks.length > 0) {
              let externalLinksContent = `
                <div class="cv-export-section">
                  <div class="cv-export-section-title">External Links</div>
              `;
              
              cvData.externalLinks.forEach(link => {
                const { displayName, url } = link;
                externalLinksContent += `
                  <div class="cv-export-item">
                    <div class="cv-export-item-header">
                      <div class="cv-export-item-title">${displayName}</div>
                    </div>
                    <div class="cv-export-item-description"><a href="${url}" target="_blank">${url}</a></div>
                  </div>
                `;
              });
              
              externalLinksContent += `</div>`;
              europassContent += externalLinksContent;
            }
            break;
            
          // Other sections can be added as needed
          default:
            break;
        }
      });
      
      // Set the content to the temporary div
      cvContent.innerHTML = europassContent;
      
      // Generate PDF from the temporary div
      console.log('Generating PDF from HTML content');
      const canvas = await html2canvas(cvContent, { 
        scale: 2,
        useCORS: true,
        logging: true, // Enable logging for debugging
        onclone: (doc) => {
          // Make the cloned document visible during capture for debugging
          const clonedContent = doc.querySelector('.cv-export-container');
          if (clonedContent) {
            (clonedContent as HTMLElement).style.position = 'absolute';
            (clonedContent as HTMLElement).style.left = '0';
            (clonedContent as HTMLElement).style.top = '0';
            (clonedContent as HTMLElement).style.visibility = 'visible';
            console.log('Content cloned successfully');
          }
        }
      });
      
      console.log('Canvas generated, creating PDF');
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename based on user's name
      const { firstName, lastName } = cvData.general;
      const filename = `${firstName || 'CV'}_${lastName || 'Document'}_${new Date().toISOString().slice(0, 10)}.pdf`.replace(/\s+/g, '_');
      
      console.log('Saving PDF:', filename);
      // Save the PDF
      pdf.save(filename);
      
      // Clean up
      document.body.removeChild(cvContent);
      document.head.removeChild(styleElement);
      
      // Reset state
      setExportLoading(false);
      setIsExportModalOpen(false);
      
    } catch (error: any) {
      console.error('Error generating CV:', error);
      setExportLoading(false);
      setIsExportModalOpen(false);
      alert(`There was an error generating your CV: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to save the current CV
  const handleSaveCV = () => {
    setIsSaveModalOpen(true);
  };
  
  // Function to save CV with the given name
  const saveCVWithName = async () => {
    if (!cvName.trim()) {
      toast.error('Please enter a name for your CV');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await saveCV(
        cvData, 
        cvName, 
        currentCVId || undefined, 
        addedSections, 
        availableSections
      );
      
      if (error) {
        console.error('Error saving CV:', error);
        toast.error('Failed to save CV');
        return;
      }
      
      if (data) {
        // Refresh the CVs list
        const { data: cvsList, error: listError } = await getCVs();
        if (!listError && cvsList) {
          setSavedCVs(cvsList);
        }
        
        if (!currentCVId) {
          setCurrentCVId(data.id);
        }
        
        setIsSaveModalOpen(false);
        setIsCVModified(false);
        setActiveTab('saved');
        toast.success('CV saved successfully!');
      }
    } catch (err) {
      console.error('Error in CV save:', err);
      toast.error('Failed to save CV');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle rename CV
  const handleRenameCV = (id: string, name: string) => {
    setRenameId(id);
    setCvName(name);
    setIsRenameModalOpen(true);
  };
  
  // Function to complete rename
  const completeRename = async () => {
    if (!cvName.trim()) {
      toast.error('Please enter a name for your CV');
      return;
    }
    
    if (!renameId) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await updateCVName(renameId, cvName);
      
      if (error) {
        console.error('Error renaming CV:', error);
        toast.error('Failed to rename CV');
        return;
      }
      
      // Refresh the CVs list
      const { data: cvsList, error: listError } = await getCVs();
      if (!listError && cvsList) {
        setSavedCVs(cvsList);
      }
      
      setIsRenameModalOpen(false);
      toast.success('CV renamed successfully!');
    } catch (err) {
      console.error('Error in CV rename:', err);
      toast.error('Failed to rename CV');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to load a saved CV
  const loadCV = async (cv: any) => {
    if (isCVModified && activeTab === 'create') {
      if (!window.confirm('You have unsaved changes. Are you sure you want to load a different CV?')) {
        return;
      }
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await getCVById(cv.id);
      
      if (error) {
        console.error('Error loading CV:', error);
        toast.error('Failed to load CV');
        return;
      }
      
      if (data) {
        setCvData(data.data);
        setAddedSections(data.sections);
        setAvailableSections(data.availableSections);
        setCurrentCVId(data.id);
        setCvName(data.name);
        setActiveTab('create');
        setIsCVModified(false);
      }
    } catch (err) {
      console.error('Error in CV load:', err);
      toast.error('Failed to load CV');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to delete a saved CV
  const deleteCVHandler = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await deleteCV(id);
      
      if (error) {
        console.error('Error deleting CV:', error);
        toast.error('Failed to delete CV');
        return;
      }
      
      // Refresh the CVs list
      const { data: cvsList, error: listError } = await getCVs();
      if (!listError && cvsList) {
        setSavedCVs(cvsList);
      }
      
      if (currentCVId === id) {
        // If the current CV is deleted, reset to a new CV
        resetCV();
      }
      
      toast.success('CV deleted successfully!');
    } catch (err) {
      console.error('Error in CV delete:', err);
      toast.error('Failed to delete CV');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create a new CV
  const createNewCV = () => {
    if (isCVModified) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to create a new CV?')) {
        return;
      }
    }
    
    resetCV();
    setActiveTab('create');
  };
  
  // Function to reset CV to default state
  const resetCV = () => {
    setCvData({
      general: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        nationality: '',
        birthDate: '',
        gender: '',
      },
      work: [
        {
          id: 1,
          position: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        }
      ],
      education: [
        {
          id: 1,
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        }
      ],
      skills: [
        {
          id: 1,
          name: '',
          level: 'intermediate'
        }
      ],
      languages: [
        {
          id: 1,
          language: '',
          proficiency: 'intermediate',
        }
      ],
      summary: '',
      certificates: [
        {
          id: 1,
          name: '',
          issuer: '',
          date: '',
          description: ''
        }
      ],
      projects: [
        {
          id: 1,
          title: '',
          role: '',
          startDate: '',
          endDate: '',
          description: '',
          url: ''
        }
      ],
      volunteering: [],
      publications: [],
      references: [],
      additional: '',
      externalLinks: []
    });
    setAddedSections(['general', 'work', 'education']);
    setAvailableSections([
      'skills',
      'languages',
      'summary',
      'certificates',
      'projects',
      'volunteering',
      'publications',
      'references',
      'additional',
      'externalLinks'
    ]);
    setCurrentCVId(null);
    setCvName('');
    setIsCVModified(false);
  };

  // Function to export a specific CV
  const exportSpecificCV = async (cv: any) => {
    try {
      // Store current state
      const currentState = {
        cvData: {...cvData},
        addedSections: [...addedSections],
        availableSections: [...availableSections],
        currentCVId: currentCVId,
        cvName: cvName
      };
      
      // Temporarily set the CV to export
      setCvData(cv.data);
      setAddedSections(cv.sections);
      setAvailableSections(cv.availableSections);
      
      // Set loading state and show the modal
      setExportLoading(true);
      setIsExportModalOpen(true);
      
      // Short delay to ensure state update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate PDF
      await handleExportCV();
      
      // Restore previous state
      setCvData(currentState.cvData);
      setAddedSections(currentState.addedSections);
      setAvailableSections(currentState.availableSections);
      setCurrentCVId(currentState.currentCVId);
      setCvName(currentState.cvName);
      
    } catch (error: any) {
      console.error('Error exporting specific CV:', error);
      setExportLoading(false);
      setIsExportModalOpen(false);
      alert(`Error exporting CV: ${error.message || 'Unknown error'}`);
    }
  };

  // Function to render the Create CV tab
  const renderCreateTab = () => {
    return (
      <>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Build Your Professional CV</h2>
          <p className="text-gray-600">
            Create a standout CV that highlights your skills, experience, and qualifications.
            Fill in each section below to build your professional CV. Sections with * contain required fields.
          </p>
          {isCVModified && currentCVId && (
            <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center text-amber-700">
              <PencilIcon className="w-5 h-5 mr-2" />
              <span>You have unsaved changes. Don't forget to save your CV!</span>
            </div>
          )}
        </div>
        
        {/* CV Builder */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8" ref={cvRef}>
          <div className="flex flex-col">
            {/* Mapping through added sections */}
            {addedSections.map((section, index) => (
              <div 
                key={section} 
                className={`border-b border-gray-200 ${activeSection === section ? 'bg-gray-50' : ''}`}
              >
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(section)}
                >
                  <div className="flex items-center flex-1">
                    <h3 className="font-medium text-gray-800 mr-2">{getSectionTitle(section)}</h3>
                    {expandedSections.includes(section) ? 
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : 
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <button 
                        className="p-1.5 bg-green-100 text-green-800 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, -1);
                        }}
                        title="Move section up"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </button>
                    )}
                    {index < addedSections.length - 1 && (
                      <button 
                        className="p-1.5 bg-green-100 text-green-800 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, 1);
                        }}
                        title="Move section down"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </button>
                    )}
                    {!['general', 'work', 'education'].includes(section) && (
                      <button 
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(section);
                        }}
                        title="Remove section"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Section content */}
                {expandedSections.includes(section) && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {renderSectionContent(section)}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Bottom Add Section Button */}
          {availableSections.length > 0 && (
            <div className="p-5 flex justify-center">
              <button 
                className="px-5 py-3 bg-olive-medium text-Green rounded-md flex items-center gap-2 hover:bg-olive-dark  transition-colors shadow-sm"
                onClick={() => setIsSectionModalOpen(true)}
              >
                <PlusIcon className="w-5 h-5" />
                Add Section to Your CV
              </button>
            </div>
          )}
        </div>
        
        {/* Add section button */}
        {availableSections.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            <div ref={dropdownRef} className="relative">
              <button 
                className="px-4 py-2 bg-olive-medium text-white rounded-md flex items-center gap-2 hover:bg-olive-dark transition-colors"
                onClick={toggleDropdown}
              >
                <PlusIcon className="w-5 h-5" />
                Add Section
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
                  {availableSections.map(section => (
                    <button 
                      key={section}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                      onClick={() => handleSectionSelect(section)}
                    >
                      {getSectionTitle(section)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center gap-2 hover:bg-gray-300 transition-colors"
              onClick={handleExportCV}
              disabled={exportLoading}
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              {exportLoading ? 'Generating...' : 'Export CV'}
            </button>
            
            <button 
              className="px-4 py-2 bg-olive-dark text-white rounded-md flex items-center gap-2 hover:bg-olive-medium transition-colors"
              onClick={handleSaveCV}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {currentCVId ? 'Update CV' : 'Save CV'}
            </button>
          </div>
        )}
      </>
    );
  };

  // Function to render the My CVs tab
  const renderSavedCVsTab = () => {
    return (
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">My Saved CVs</h2>
          <p className="text-gray-600">
            View and manage all your saved CVs. You can edit, rename, delete, or export any of your saved CVs.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          {cvLoading ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="animate-spin mb-4">
                <svg className="w-12 h-12 text-olive-medium" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-500">Loading your saved CVs...</p>
            </div>
          ) : savedCVs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-6">You don't have any saved CVs yet.</p>
              <button 
                className="px-4 py-2 bg-olive-medium text-white rounded-md flex items-center gap-2 hover:bg-olive-dark transition-colors"
                onClick={() => {
                  resetCV();
                  setActiveTab('create');
                }}
              >
                <PlusIcon className="w-5 h-5" />
                Create Your First CV
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCVs.map(cv => (
                  <div 
                    key={cv.id} 
                    className={`border rounded-lg shadow-sm overflow-hidden 
                      ${currentCVId === cv.id ? 'border-olive-medium' : 'border-gray-200'}`}
                  >
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                      <DocumentTextIcon className="w-8 h-8 text-olive-medium" />
                      <div>
                        <h4 className="font-medium">{cv.name}</h4>
                        <p className="text-xs text-gray-500">Last edited: {new Date(cv.updated_at || cv.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="p-3 flex flex-wrap gap-2">
                      <button 
                        className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        onClick={() => loadCV(cv)}
                        title="Edit CV"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        <span>Edit</span>
                      </button>
                      <button 
                        className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        onClick={() => handleRenameCV(cv.id, cv.name)}
                        title="Rename CV"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        <span>Rename</span>
                      </button>
                      <button 
                        className="flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                        onClick={() => exportSpecificCV(cv)}
                        disabled={exportLoading}
                        title="Export CV"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                        <span>Download</span>
                      </button>
                      <button 
                        className="flex items-center px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-sm text-red-600"
                                                    onClick={() => deleteCVHandler(cv.id)}
                        title="Delete CV"
                      >
                        <TrashIcon className="w-4 h-4 mr-1" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <button 
                  className="px-4 py-2 bg-olive-medium text-white rounded-md flex items-center gap-2 hover:bg-olive-dark transition-colors"
                  onClick={() => {
                    resetCV();
                    setActiveTab('create');
                  }}
                >
                  <PlusIcon className="w-5 h-5" />
                  Create New CV
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render section content based on section type  
  const renderSectionContent = (section: string) => {
    switch (section) {
      case 'general':
        return <GeneralSection 
          generalData={cvData.general} 
          onChange={handleGeneralChange} 
        />;
      case 'work':
        return <WorkSection 
          workExperiences={cvData.work} 
          onWorkChange={handleWorkChange} 
          onAddWork={addWorkExperience} 
          onRemoveWork={removeWorkExperience} 
        />;
      case 'education':
        return <EducationSection 
          educations={cvData.education} 
          onEducationChange={handleEducationChange} 
          onAddEducation={addEducation} 
          onRemoveEducation={removeEducation} 
        />;
      case 'skills':
        return <SkillsSection 
          skills={cvData.skills} 
          onSkillChange={handleSkillChange} 
          onAddSkill={addSkill} 
          onRemoveSkill={removeSkill} 
        />;
      case 'languages':
        return <LanguagesSection 
          languages={cvData.languages} 
          onLanguageChange={handleLanguageChange} 
          onAddLanguage={addLanguage} 
          onRemoveLanguage={removeLanguage} 
        />;
      case 'summary':
        return <SummarySection 
          summary={cvData.summary} 
          onSummaryChange={handleSummaryChange} 
        />;
      case 'certificates':
        return <CertificatesSection 
          certificates={cvData.certificates} 
          onCertificateChange={handleCertificateChange} 
          onAddCertificate={addCertificate} 
          onRemoveCertificate={removeCertificate} 
        />;
      case 'projects':
        return <ProjectsSection 
          projects={cvData.projects} 
          onProjectChange={handleProjectChange} 
          onAddProject={addProject} 
          onRemoveProject={removeProject} 
        />;
      case 'additional':
        return <AdditionalSection 
          additionalInfo={cvData.additional} 
          onAdditionalChange={handleAdditionalChange} 
        />;
      case 'externalLinks':
        return <ExternalLinksSection 
          externalLinks={cvData.externalLinks} 
          onExternalLinkChange={handleExternalLinkChange}
          onAddExternalLink={addExternalLink}
          onRemoveExternalLink={removeExternalLink}
        />;
      default:
        return <PlaceholderSection sectionTitle={getSectionTitle(section)} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <header className="flex items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">CV Maker {cvName && activeTab === 'create' ? ` - ${cvName}` : ''}</h1>
        <div className="ml-auto flex gap-3">
          <button 
            className="px-4 py-2 bg-olive-dark text-white rounded flex items-center gap-2 hover:bg-olive-medium transition-colors"
            onClick={handleExportCV}
            disabled={exportLoading}
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Export CV</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>
      
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`py-2 px-4 font-medium ${
              activeTab === 'create' 
              ? 'text-olive-dark border-b-2 border-olive-dark' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              if (isCVModified && !window.confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
                return;
              }
              setActiveTab('create');
            }}
          >
            <div className="flex items-center">
              <PencilIcon className="w-4 h-4 mr-2" />
              Create CV
            </div>
          </button>
          <button 
            className={`py-2 px-4 font-medium ${
              activeTab === 'saved' 
              ? 'text-olive-dark border-b-2 border-olive-dark' 
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <div className="flex items-center">
              <ListBulletIcon className="w-4 h-4 mr-2" />
              My CVs
            </div>
          </button>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'create' ? renderCreateTab() : renderSavedCVsTab()}
        
        {/* Save CV Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{currentCVId ? 'Update CV' : 'Save CV'}</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CV Name</label>
                  <input
                    type="text"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                    placeholder="My Professional CV"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-olive-medium text-white rounded hover:bg-olive-dark disabled:opacity-50"
                  onClick={saveCVWithName}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (currentCVId ? 'Update' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Rename CV Modal */}
        {isRenameModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Rename CV</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsRenameModalOpen(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New CV Name</label>
                  <input
                    type="text"
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                    placeholder="Enter a new name for your CV"
                    autoFocus
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsRenameModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-olive-medium text-white rounded hover:bg-olive-dark disabled:opacity-50"
                  onClick={completeRename}
                  disabled={loading}
                >
                  {loading ? 'Renaming...' : 'Rename'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add Section Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="font-semibold text-lg">Add Sections to Your CV</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => setIsSectionModalOpen(false)}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Select the sections you want to add to your CV. Each section helps showcase different aspects of your professional profile.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableSections.map(section => {
                    const sectionInfo = {
                      'skills': {
                        icon: <CheckIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'List your technical and soft skills with proficiency levels.'
                      },
                      'languages': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Showcase your language abilities and proficiency levels.'
                      },
                      'summary': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Add a brief professional summary highlighting your expertise.'
                      },
                      'certificates': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'List relevant certifications and professional courses.'
                      },
                      'projects': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Highlight key projects that demonstrate your abilities.'
                      },
                      'volunteering': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Share your volunteering experiences and community work.'
                      },
                      'publications': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Add your published works, articles, or research papers.'
                      },
                      'references': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Include professional references or recommendation statements.'
                      },
                      'additional': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Add any other information relevant to your professional profile.'
                      },
                      'externalLinks': {
                        icon: <DocumentTextIcon className="w-8 h-8 text-olive-medium" />,
                        description: 'Add links to your professional profiles on external platforms.'
                      }
                    };
                    
                    const info = sectionInfo[section as keyof typeof sectionInfo];
                    
                    return (
                      <div 
                        key={section}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          handleSectionSelect(section);
                          setIsSectionModalOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {info?.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 mb-1">{getSectionTitle(section)}</h4>
                            <p className="text-sm text-gray-600">{info?.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsSectionModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Export Modal */}
        {isExportModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
              <div className="animate-spin mb-4">
                <svg className="w-12 h-12 text-olive-medium" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center">CV is being generated, thank you for waiting</h3>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 