'use client';

import Link from 'next/link';
import { 
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  CameraIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

const customTools = [
  {
    title: 'Form Maker',
    description: 'Create custom forms for volunteer applications, event registrations, feedback surveys, and more.',
    icon: DocumentTextIcon,
    href: '/ngo/resources/tools/FormMaker',
    category: 'Forms'
  },
  {
    title: 'Offre Maker',
    description: 'Create and manage volunteer opportunity listings with templates and customizable fields.',
    icon: ClipboardDocumentListIcon,
    href: '/ngo/resources/tools/OffreMaker',
    category: 'Opportunities'
  },
  {
    title: 'Process Makers',
    description: 'Design and manage your organization\'s workflow processes with customizable stages.',
    icon: Cog6ToothIcon,
    href: '/ngo/resources/tools/ProcessMakers',
    category: 'Workflow'
  },
  {
    title: 'Evaluation Maker',
    description: 'Create comprehensive evaluation templates with custom criteria and visual radar charts for applicant assessment.',
    icon: ChartPieIcon,
    href: '/ngo/resources/tools/EvaluationMaker',
    category: 'Assessment'
  }
];

const externalTools = [
  {
    title: 'Project Management Tool',
    description: 'Free task management system specially designed for NGOs and nonprofit projects.',
    icon: WrenchScrewdriverIcon,
    href: '#',
    category: 'Management'
  },
  {
    title: 'Volunteer Scheduling Software',
    description: 'Easy-to-use calendar tool for coordinating volunteer schedules and shifts.',
    icon: CalendarDaysIcon,
    href: '#',
    category: 'Planning'
  },
  {
    title: 'Data Collection App',
    description: 'Mobile-friendly solution for gathering field data and generating reports.',
    icon: ComputerDesktopIcon,
    href: '#',
    category: 'Technology'
  },
  {
    title: 'Impact Assessment Dashboard',
    description: 'Visualize your program outcomes with customizable charts and metrics.',
    icon: ChartBarIcon,
    href: '#',
    category: 'Analytics'
  },
  {
    title: 'Digital Storytelling Suite',
    description: 'Create compelling visual narratives about your work and impact.',
    icon: CameraIcon,
    href: '#',
    category: 'Media'
  },
  {
    title: 'Donor Management System',
    description: 'Track donations, generate reports, and manage donor relationships.',
    icon: PresentationChartLineIcon,
    href: '#',
    category: 'Fundraising'
  }
];

export default function NGOTools() {
  return (
    <div className="px-4 py-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] rounded-full">
            <Cog6ToothIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-[#556B2F] to-[#6B8E23] bg-clip-text text-transparent">NGO Tools</h1>
          <p className="mt-2 text-sm text-gray-600">Software and digital tools to enhance your organization's work</p>
        </div>
        
        {/* Custom Zaytoonz Tools */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Zaytoonz Custom Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTools.map((tool) => {
              const Icon = tool.icon;
              
              return (
                <Link 
                  key={tool.title}
                  href={tool.href}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="p-3 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{tool.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium bg-[#556B2F]/10 text-[#556B2F] px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <span className="text-sm font-medium text-[#6B8E23] hover:text-[#556B2F] transition-colors">
                          Access Tool →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* External Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Third-Party Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {externalTools.map((tool) => {
              const Icon = tool.icon;
              
              return (
                <div 
                  key={tool.title}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="p-3 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{tool.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium bg-[#556B2F]/10 text-[#556B2F] px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <a 
                          href={tool.href} 
                          className="text-sm font-medium text-[#6B8E23] hover:text-[#556B2F] transition-colors"
                        >
                          Access Tool →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-10 p-6 bg-[#556B2F]/5 rounded-xl border border-[#556B2F]/10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Need a custom tool?</h2>
          <p className="text-gray-600 mb-4">
            We can help you find or develop specialized tools tailored to your organization's unique needs. 
            Contact our tech support team for personalized assistance.
          </p>
          <a 
            href="#" 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white font-medium rounded-lg hover:shadow-md transition-all duration-200"
          >
            Request Technical Support
          </a>
        </div>
      </div>
    </div>
  );
} 