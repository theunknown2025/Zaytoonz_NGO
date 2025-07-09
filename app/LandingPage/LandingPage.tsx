'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Users, 
  Target, 
  Globe, 
  Award,
  Shield, 
  Clock, 
  Search, 
  MessageSquare, 
  BarChart3, 
  Zap,
  Star,
  Briefcase,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  Heart,
  CheckCircle,
  UserPlus,
  Handshake,
  Quote,
  Mail,
  Phone,
  MapPin,
  Send
} from 'lucide-react';
import RecentOpportunities from './components/RecentOpportunities';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Smart Matching Algorithm",
      description: "Our AI-powered system matches talents with NGOs based on skills, interests, location, and organizational culture fit.",
      highlight: "99% accuracy rate"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Verified Organizations", 
      description: "All NGOs undergo thorough verification to ensure legitimacy, impact, and commitment to youth development.",
      highlight: "100% verified partners"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Integrated Communication",
      description: "Built-in messaging, video calls, and collaboration tools to streamline the connection process.",
      highlight: "Real-time messaging"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Impact Tracking",
      description: "Monitor your career growth and social impact with detailed analytics and progress reports.",
      highlight: "Comprehensive analytics"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Opportunities",
      description: "From part-time volunteering to full-time careers, find opportunities that fit your schedule and goals.",
      highlight: "All commitment levels"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Notifications",
      description: "Get real-time alerts for new opportunities, application updates, and important messages.",
      highlight: "Lightning fast updates"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-8 w-auto" />
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Home
              </a>
              <a href="#services" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Services
              </a>
              <a href="#about" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Contact
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/auth/signin"
                className="text-olive-700 hover:text-olive-600 font-medium transition-colors"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="bg-olive-700 text-white px-6 py-2 rounded-full font-medium hover:bg-olive-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-olive-200">
                <a href="#home" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Home
                </a>
                <a href="#services" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Services
                </a>
                <a href="#about" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  About
                </a>
                <a href="#contact" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Contact
                </a>
                <div className="pt-4 pb-3 border-t border-olive-200">
                  <a href="/auth/signin" className="block w-full text-left px-3 py-2 text-olive-700 hover:text-olive-600">
                    Sign In
                  </a>
                  <a href="/auth/signup" className="block w-full mt-2 bg-olive-700 text-white px-3 py-2 rounded-full font-medium text-center hover:bg-olive-800">
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-olive-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                🌍 Connecting Global Changemakers Since 2020
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-olive-800 mb-6 leading-tight">
              Connecting <span className="text-olive-600">NGOs</span> with 
              <br />
              <span className="text-olive-600">Youth Talents</span>
            </h1>
            
            <p className="text-xl text-olive-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Zaytoonz is the premier platform bridging the gap between passionate young talents and impactful NGOs worldwide. 
              We create opportunities for meaningful careers while driving positive change across communities, 
              empowering the next generation of social impact leaders.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                              <a
                  href="/seeker"
                  className="bg-olive-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                Find Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/ngo"
                className="border-2 border-olive-500 text-olive-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-50 transition-all duration-300 flex items-center justify-center"
              >
                Post a Position
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mt-20">
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">15,000+</h3>
                <p className="text-olive-600 font-medium">Active Talents</p>
                <p className="text-sm text-olive-500 mt-1">From 85+ countries</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">750+</h3>
                <p className="text-olive-600 font-medium">Partner NGOs</p>
                <p className="text-sm text-olive-500 mt-1">Across 6 continents</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">2.5M+</h3>
                <p className="text-olive-600 font-medium">Lives Impacted</p>
                <p className="text-sm text-olive-500 mt-1">Through our partnerships</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">97%</h3>
                <p className="text-olive-600 font-medium">Success Rate</p>
                <p className="text-sm text-olive-500 mt-1">Successful placements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              Powerful Features for Meaningful Connections
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              Our platform is designed with cutting-edge technology to ensure the best possible experience 
              for both talents and NGOs seeking to create positive change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-olive-100">
                <div className="bg-olive-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {React.cloneElement(feature.icon, { className: "h-8 w-8 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-olive-800 mb-3">{feature.title}</h3>
                <p className="text-olive-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-olive-500">
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  <span className="text-sm font-medium">{feature.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section id="services" className="py-20 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-olive-600 max-w-4xl mx-auto">
              Everything you need to find meaningful opportunities or discover passionate talent through our integrated platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Job Seekers */}
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="bg-olive-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">For Job Seekers</h3>
                <p className="text-olive-600 text-lg">Discover opportunities that match your passion and skills</p>
              </div>

              <div className="space-y-6">
                <div className="border border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-olive-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-olive-800 mb-2">Smart Job Search & Navigation</h4>
                      <p className="text-olive-600 mb-3">Browse and filter opportunities with advanced search features and personalized recommendations.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          Advanced filtering
                        </div>
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          Job alerts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-olive-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-olive-800 mb-2">Application Management & CV Tools</h4>
                      <p className="text-olive-600 mb-3">Track your applications and create professional CVs with our built-in CV maker and analyzer tools.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          CV maker & analyzer
                        </div>
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          Application tracking
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-olive-300">
                  <div className="flex items-start space-x-4">
                    <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-olive-800 mb-2">Professional Profile & Services</h4>
                      <p className="text-olive-600 mb-3">Build a comprehensive professional profile and access career services and resources.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          Profile management
                        </div>
                        <div className="flex items-center text-sm text-olive-500">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-400" />
                          Career resources
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <a
                  href="/seeker"
                  className="bg-olive-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center mx-auto w-fit"
                >
                  Start Job Search
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>

            {/* For NGOs */}
            <div className="bg-olive-800 rounded-3xl p-8 text-white shadow-xl">
              <div className="text-center mb-8">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2">For NGOs</h3>
                <p className="text-olive-100 text-lg">Manage opportunities and find the right talent</p>
              </div>

              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">Opportunity Management System</h4>
                      <p className="text-olive-100 mb-3">Create, publish, and manage volunteer and job opportunities with our comprehensive management tools.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Create opportunities
                        </div>
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Manage listings
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">Application Tracking & Analytics</h4>
                      <p className="text-olive-100 mb-3">Track applications, review candidates, and analyze your recruitment performance with detailed insights.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Application review
                        </div>
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Performance analytics
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/10">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2">Organization Profile & Resources</h4>
                      <p className="text-olive-100 mb-3">Build your organization's profile, manage resources, and access tools to streamline your operations.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Profile management
                        </div>
                        <div className="flex items-center text-sm text-olive-200">
                          <CheckCircle className="h-4 w-4 mr-2 text-olive-300" />
                          Resource center
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <a
                  href="/ngo"
                  className="bg-white text-olive-800 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center mx-auto w-fit"
                >
                  Start Posting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              How Zaytoonz Works
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy for talents and NGOs to find their perfect match 
              and start creating positive change together.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Job Seekers */}
            <div>
              <div className="text-center mb-8">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-olive-800 mb-2">For Job Seekers</h3>
                <p className="text-olive-600">From profile to placement in 4 simple steps</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <UserPlus className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Build Your Professional Profile</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Create a detailed profile highlighting your skills, experience, and career goals using our profile management tools.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <Search className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Navigate & Search Opportunities</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Use our opportunity navigation system to browse jobs, set up alerts, and discover roles that match your passion.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Apply with Professional CVs</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Create tailored CVs using our CV maker and analyzer, then submit applications and track their progress.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <TrendingUp className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Manage & Track Progress</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Monitor your applications, access career services, and utilize resources to advance your professional journey.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For NGOs */}
            <div>
              <div className="text-center mb-8">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-olive-800 mb-2">For NGOs</h3>
                <p className="text-olive-600">From opportunity creation to talent acquisition</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <Shield className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Set Up Organization Profile</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Create your organization profile, manage resources, and access tools to streamline your operations.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <Lightbulb className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Create & Manage Opportunities</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Use our opportunity management system to create new postings and manage your existing job listings.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <BarChart3 className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Review & Track Applications</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Access our comprehensive application management system to review candidates and track your recruitment process.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">Connect & Hire Talent</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">Utilize analytics to make informed decisions and connect with candidates who align with your mission and values.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-olive-100 rounded-2xl p-8 max-w-4xl mx-auto">
              <CheckCircle className="h-16 w-16 text-olive-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-olive-800 mb-4">Ready to Get Started?</h3>
              <p className="text-olive-600 text-lg mb-6">
                Join thousands of talents and NGOs who have already found their perfect match through Zaytoonz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/seeker"
                  className="bg-olive-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-olive-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Join as Talent
                </a>
                <a
                  href="/ngo"
                  className="border-2 border-olive-500 text-olive-700 px-8 py-3 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300"
                >
                  Register Your NGO
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-olive-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-olive-100 mb-8">
            Join thousands of changemakers who are already using Zaytoonz to create positive change worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/seeker/opportunities/navigate"
              className="bg-white text-olive-700 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Opportunities
            </a>
            <a
              href="/ngo/opportunities/new"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-olive-700 transition-all duration-300"
            >
              Post an Opportunity
            </a>
          </div>
        </div>
      </section>

      {/* Recent Opportunities Section */}
      <section className="py-20 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              Latest Opportunities
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              Discover the most recent opportunities from our partner NGOs and external sources worldwide. 
              Find jobs, funding, and training programs that match your interests and career goals.
            </p>
          </div>

          <RecentOpportunities />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              Stories of Impact and Growth
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              Hear from the talents and NGOs who have found their perfect match through Zaytoonz 
              and are now creating meaningful change around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mr-4">
                  <span className="text-olive-600 font-bold text-lg">AM</span>
                </div>
                <div>
                  <h4 className="font-bold text-olive-800">Ahmed Mohamed</h4>
                  <p className="text-olive-600 text-sm">Job Seeker</p>
                  <p className="text-olive-500 text-xs">Egypt</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="h-8 w-8 text-olive-300 absolute -top-2 -left-2" />
                <p className="text-olive-700 italic leading-relaxed pl-6">
                  The CV maker tool helped me create a professional resume that landed me my dream job. The platform's job navigation system made it easy to find opportunities that matched my skills.
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-olive-200">
                <p className="text-olive-500 text-sm font-medium">Now working at Relief International</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mr-4">
                  <span className="text-olive-600 font-bold text-lg">JW</span>
                </div>
                <div>
                  <h4 className="font-bold text-olive-800">Jennifer Wilson</h4>
                  <p className="text-olive-600 text-sm">NGO Director</p>
                  <p className="text-olive-500 text-xs">Canada</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="h-8 w-8 text-olive-300 absolute -top-2 -left-2" />
                <p className="text-olive-700 italic leading-relaxed pl-6">
                  The opportunity management system streamlined our recruitment process completely. We can now post positions, track applications, and manage candidates all in one place. Game changer!
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-olive-200">
                <p className="text-olive-500 text-sm font-medium">Community Development Foundation</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-olive-100 flex items-center justify-center mr-4">
                  <span className="text-olive-600 font-bold text-lg">RS</span>
                </div>
                <div>
                  <h4 className="font-bold text-olive-800">Raj Sharma</h4>
                  <p className="text-olive-600 text-sm">Program Coordinator</p>
                  <p className="text-olive-500 text-xs">India</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="h-8 w-8 text-olive-300 absolute -top-2 -left-2" />
                <p className="text-olive-700 italic leading-relaxed pl-6">
                  I found my current role through Zaytoonz's job alerts feature. The application tracking system helped me stay organized and follow up on multiple opportunities simultaneously.
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-olive-200">
                <p className="text-olive-500 text-sm font-medium">Save the Children India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              About Zaytoonz
            </h2>
            <p className="text-xl text-olive-600 max-w-4xl mx-auto">
              We are dedicated to creating a world where young talents can build meaningful careers 
              while contributing to positive social change through strategic NGO partnerships. 
              Our mission is to democratize access to impactful career opportunities globally.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-3xl font-bold text-olive-800 mb-6">Our Mission & Vision</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-olive-600 mr-3" />
                    <h4 className="text-xl font-bold text-olive-800">Mission</h4>
                  </div>
                  <p className="text-olive-600 leading-relaxed">
                    To bridge the gap between passionate young professionals and impactful NGOs worldwide, 
                    creating sustainable career pathways that drive positive social change and community development.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-olive-600 mr-3" />
                    <h4 className="text-xl font-bold text-olive-800">Vision</h4>
                  </div>
                  <p className="text-olive-600 leading-relaxed">
                    A world where every young professional has access to meaningful career opportunities 
                    that align with their values, and every NGO has the talented workforce needed to 
                    maximize their social impact.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="bg-olive-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <img src="/image.png" alt="Zaytoonz" className="h-16 w-auto" />
                </div>
                <h4 className="text-3xl font-bold text-olive-800 mb-2">Since 2020</h4>
                <p className="text-olive-600 text-lg mb-6">Connecting talents with NGOs worldwide</p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-olive-50 rounded-lg p-4">
                    <h5 className="text-2xl font-bold text-olive-800">85+</h5>
                    <p className="text-olive-600 text-sm">Countries</p>
                  </div>
                  <div className="bg-olive-50 rounded-lg p-4">
                    <h5 className="text-2xl font-bold text-olive-800">750+</h5>
                    <p className="text-olive-600 text-sm">NGO Partners</p>
                  </div>
                  <div className="bg-olive-50 rounded-lg p-4">
                    <h5 className="text-2xl font-bold text-olive-800">15K+</h5>
                    <p className="text-olive-600 text-sm">Active Talents</p>
                  </div>
                  <div className="bg-olive-50 rounded-lg p-4">
                    <h5 className="text-2xl font-bold text-olive-800">2.5M+</h5>
                    <p className="text-olive-600 text-sm">Lives Impacted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              Ready to start your journey? We're here to help you connect with the right opportunities.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-olive-800 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-olive-800">Email</h4>
                    <p className="text-olive-600">hello@zaytoonz.org</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-olive-800">Phone</h4>
                    <p className="text-olive-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-olive-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-olive-800">Address</h4>
                    <p className="text-olive-600">123 Impact Street, Global City, GC 12345</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-olive-100 rounded-xl">
                <h4 className="text-xl font-semibold text-olive-800 mb-3">Office Hours</h4>
                <div className="space-y-2 text-olive-600">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="bg-olive-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-olive-800 mb-6">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-olive-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    I am a...
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all">
                    <option>Select your role</option>
                    <option>Young Talent</option>
                    <option>NGO Representative</option>
                    <option>Partner Organization</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-olive-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-olive-200 mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img src="/image.png" alt="Zaytoonz" className="h-8 w-auto mb-4" />
              <p className="text-olive-600 mb-4 max-w-md">
                Connecting passionate youth with impactful NGOs to create meaningful careers and drive positive change worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">Platform</h3>
              <ul className="space-y-2 text-olive-600">
                <li><a href="/seeker" className="hover:text-olive-700">For Seekers</a></li>
                <li><a href="/ngo" className="hover:text-olive-700">For NGOs</a></li>
                <li><a href="#services" className="hover:text-olive-700">Services</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">Support</h3>
              <ul className="space-y-2 text-olive-600">
                <li><a href="#contact" className="hover:text-olive-700">Contact</a></li>
                <li><a href="#about" className="hover:text-olive-700">About</a></li>
                <li><a href="/auth/signup" className="hover:text-olive-700">Get Started</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-olive-200 mt-8 pt-8 text-center text-olive-600">
            <p>&copy; 2025 Zaytoonz NGO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
