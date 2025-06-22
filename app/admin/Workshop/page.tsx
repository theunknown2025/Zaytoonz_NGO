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
  ChartPieIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const customTools = [
  {
    title: 'Form Maker',
    description: 'Create custom forms for volunteer applications, event registrations, feedback surveys, and more.',
    icon: DocumentTextIcon,
    href: '/admin/Workshop/FormMaker',
    category: 'Forms',
    status: 'Available'
  },
  {
    title: 'Offre Maker',
    description: 'Create and manage volunteer opportunity listings with templates and customizable fields.',
    icon: ClipboardDocumentListIcon,
    href: '/admin/Workshop/OffreMaker',
    category: 'Opportunities',
    status: 'Available'
  },
  {
    title: 'Process Makers',
    description: 'Design and manage your organization\'s workflow processes with customizable stages.',
    icon: Cog6ToothIcon,
    href: '/admin/Workshop/ProcessMakers',
    category: 'Workflow',
    status: 'Available'
  },
  {
    title: 'Evaluation Maker',
    description: 'Create comprehensive evaluation templates with custom criteria and visual radar charts for applicant assessment.',
    icon: ChartPieIcon,
    href: '/admin/Workshop/EvaluationMaker',
    category: 'Assessment',
    status: 'Available'
  }
];

const externalTools = [
  {
    title: 'Project Management Tool',
    description: 'Free task management system specially designed for NGOs and nonprofit projects.',
    icon: WrenchScrewdriverIcon,
    href: '#',
    category: 'Management',
    status: 'External'
  },
  {
    title: 'Volunteer Scheduling Software',
    description: 'Easy-to-use calendar tool for coordinating volunteer schedules and shifts.',
    icon: CalendarDaysIcon,
    href: '#',
    category: 'Planning',
    status: 'External'
  },
  {
    title: 'Data Collection App',
    description: 'Mobile-friendly solution for gathering field data and generating reports.',
    icon: ComputerDesktopIcon,
    href: '#',
    category: 'Technology',
    status: 'External'
  },
  {
    title: 'Impact Assessment Dashboard',
    description: 'Visualize your program outcomes with customizable charts and metrics.',
    icon: ChartBarIcon,
    href: '#',
    category: 'Analytics',
    status: 'External'
  },
  {
    title: 'Digital Storytelling Suite',
    description: 'Create compelling visual narratives about your work and impact.',
    icon: CameraIcon,
    href: '#',
    category: 'Media',
    status: 'External'
  },
  {
    title: 'Donor Management System',
    description: 'Track donations, generate reports, and manage donor relationships.',
    icon: PresentationChartLineIcon,
    href: '#',
    category: 'Fundraising',
    status: 'External'
  }
];

const workshopSessions = [
  {
    title: 'NGO Tools Mastery Workshop',
    description: 'Learn to effectively use all Zaytoonz custom tools for maximum organizational efficiency.',
    duration: '2 hours',
    level: 'Beginner',
    participants: 24,
    icon: WrenchScrewdriverIcon,
    status: 'Upcoming'
  },
  {
    title: 'Digital Transformation for NGOs',
    description: 'Comprehensive guide to digitizing your NGO operations and improving workflow efficiency.',
    duration: '3 hours',
    level: 'Intermediate',
    participants: 18,
    icon: ComputerDesktopIcon,
    status: 'Available'
  },
  {
    title: 'Data-Driven Impact Assessment',
    description: 'Master the art of measuring and visualizing your organization\'s social impact.',
    duration: '2.5 hours',
    level: 'Advanced',
    participants: 15,
    icon: ChartBarIcon,
    status: 'Available'
  },
  {
    title: 'Volunteer Management Best Practices',
    description: 'Strategies for recruiting, training, and retaining volunteers using digital tools.',
    duration: '1.5 hours',
    level: 'Beginner',
    participants: 32,
    icon: UserGroupIcon,
    status: 'Upcoming'
  }
];

export default function Workshop() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-50 text-green-700 border-green-200';
      case 'External': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Upcoming': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-8 h-8 text-[#556B2F]" />
              <h1 className="text-2xl font-bold text-[#556B2F]">Workshop & Tools</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-[#556B2F] text-white px-4 py-2 rounded-lg hover:bg-[#6B8E23] transition-colors font-medium flex items-center gap-2">
                <PlayIcon className="w-4 h-4" />
                Start Workshop
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Workshop Sessions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-[#556B2F]" />
                Workshop Sessions
              </h2>
              <p className="text-sm text-gray-600 mt-1">Interactive learning sessions to master NGO tools and best practices</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshopSessions.map((session) => {
                  const Icon = session.icon;
                  
                  return (
                    <div 
                      key={session.title}
                      className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-[#556B2F]/10 rounded-lg text-[#556B2F]">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{session.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getLevelColor(session.level)}`}>
                                {session.level}
                              </span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>⏱️ {session.duration}</span>
                          <span>👥 {session.participants} participants</span>
                        </div>
                        <button className="text-[#556B2F] hover:text-[#6B8E23] font-medium">
                          Join Session →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zaytoonz Custom Tools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Cog6ToothIcon className="w-5 h-5 text-[#556B2F]" />
                Zaytoonz Custom Tools
              </h2>
              <p className="text-sm text-gray-600 mt-1">Powerful tools designed specifically for NGO operations</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customTools.map((tool) => {
                  const Icon = tool.icon;
                  
                  return (
                    <Link 
                      key={tool.title}
                      href={tool.href}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#556B2F]/20 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-[#556B2F]/10 rounded-lg text-[#556B2F] group-hover:bg-[#556B2F] group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-[#556B2F] transition-colors">{tool.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium bg-[#556B2F]/10 text-[#556B2F] px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <span className="text-sm font-medium text-[#6B8E23] group-hover:text-[#556B2F] transition-colors flex items-center gap-1">
                          Access Tool
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Third-Party Tools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-[#556B2F]" />
                Third-Party Tools
              </h2>
              <p className="text-sm text-gray-600 mt-1">Recommended external tools to enhance your NGO operations</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {externalTools.map((tool) => {
                  const Icon = tool.icon;
                  
                  return (
                    <div 
                      key={tool.title}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {tool.category}
                        </span>
                        <a 
                          href={tool.href} 
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          Learn More
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-r from-[#556B2F]/5 to-[#6B8E23]/5 rounded-lg border border-[#556B2F]/10 p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Need Help Getting Started?</h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our workshop facilitators are here to help you make the most of these tools. 
                Join a live session or request personalized training for your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center px-6 py-3 bg-[#556B2F] text-white font-medium rounded-lg hover:bg-[#6B8E23] transition-colors">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Join Live Workshop
                </button>
                <button className="inline-flex items-center px-6 py-3 bg-white text-[#556B2F] font-medium rounded-lg border border-[#556B2F] hover:bg-[#556B2F]/5 transition-colors">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Request Training
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}