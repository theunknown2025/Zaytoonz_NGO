'use client';

import { 
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const resources = [
  {
    title: 'Volunteer Management Guide',
    description: 'Learn effective strategies for recruiting, training, and retaining volunteers.',
    icon: UserGroupIcon,
    href: '#',
    category: 'Guide'
  },
  {
    title: 'Grant Writing Toolkit',
    description: 'Templates and tips to help you secure funding for your organization.',
    icon: DocumentTextIcon,
    href: '#',
    category: 'Template'
  },
  {
    title: 'Impact Measurement Framework',
    description: 'Methods to evaluate and communicate the effectiveness of your programs.',
    icon: DocumentMagnifyingGlassIcon,
    href: '#',
    category: 'Framework'
  },
  {
    title: 'NGO Leadership Course',
    description: 'Free online course covering essential leadership skills for NGO managers.',
    icon: AcademicCapIcon,
    href: '#',
    category: 'Course'
  },
  {
    title: 'Community Engagement Handbook',
    description: 'Strategies for meaningful involvement of communities in your programs.',
    icon: BookOpenIcon,
    href: '#',
    category: 'Handbook'
  },
  {
    title: 'Fundraising Best Practices',
    description: 'Effective approaches to diversify your funding sources.',
    icon: DocumentTextIcon,
    href: '#',
    category: 'Guide'
  }
];

export default function ResourcesPage() {
  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">Tools & Resources</h1>
          <p className="mt-2 text-sm text-gray-600">Helpful resources to enhance your organization's impact and operations</p>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-200 transform hover:scale-[1.02]"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10 text-[#6B8E23]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="ml-3 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {resource.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <a 
                    href={resource.href} 
                    className="text-sm font-medium text-[#6B8E23] hover:text-[#556B2F] transition-colors"
                  >
                    Access Resource →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-gradient-to-br from-[#556B2F]/10 to-[#6B8E23]/10 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#556B2F] mb-3">Need Custom Support?</h2>
          <p className="text-gray-700 mb-4">
            Our team is available to provide personalized guidance for your organization's specific needs.
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white rounded-md hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
            Request Consultation
          </button>
        </div>
      </div>
    </div>
  );
} 