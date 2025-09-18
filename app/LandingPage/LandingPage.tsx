'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Users, 
  Target, 
  Globe, 
  Award,
  Shield, 
  Search, 
  BarChart3, 
  Briefcase,
  UserPlus,
  Lightbulb,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import RecentOpportunities from './components/RecentOpportunities';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    '/Health.png',
    '/Water.png', 
    '/Green.png',
    '/Education.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);



  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Home
              </a>
              <a href="#jobs" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Jobs
              </a>
              <a href="#training" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Training
              </a>
              <a href="#funding" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Funding
              </a>
              <a href="#resources" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                Resources
              </a>
              <a href="#about" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                About us
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
                <a href="#jobs" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Jobs
                </a>
                <a href="#training" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Training
                </a>
                <a href="#funding" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Funding
                </a>
                <a href="#resources" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  Resources
                </a>
                <a href="#about" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  About us
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
      <section id="home" className="pt-16 min-h-screen relative overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-70' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          ))}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-olive-50/80 z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-block bg-olive-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                🌍 Connecting Global Changemakers Since 2020
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-olive-800 mb-6 leading-tight">
              Fueling <span className="text-olive-600">Social Impact</span> with 
              <br />
              <span className="text-olive-600">Professional Expertise</span>
            </h1>
            
            <p className="text-xl text-olive-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Zaytoonz is the leading platform connecting skilled professionals with mission-driven non-profit entities across the globe. We enable impactful careers that contribute to social change, strengthening the capacity of organizations while advancing sustainable development and community resilience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                              <a
                  href="/seeker"
                  className="bg-olive-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                Discover Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="/"
                className="border-2 border-olive-500 text-olive-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-50 transition-all duration-300 flex items-center justify-center"
              >
                Post Opportunities
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
                <p className="text-olive-600 font-medium">Partner Organizations</p>
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
            
            {/* Image Carousel Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {backgroundImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-olive-700 shadow-lg' 
                      : 'bg-olive-300 hover:bg-olive-500'
                  }`}
                  aria-label={`Switch to background image ${index + 1}`}
                />
              ))}
            </div>
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
            
          </div>

          <RecentOpportunities />
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
            Zaytoonz offers a streamlined platform that connects skilled professionals with mission-driven non-profit entities, enabling impactful collaborations that drive meaningful social change.            </p>
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
                <h3 className="text-2xl font-bold text-olive-800 mb-2">For Organizations</h3>
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


        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              About Zaytoonz
            </h2>
            <p className="text-xl text-olive-600 max-w-4xl mx-auto">
              We are dedicated to creating a world where young talents can build meaningful careers 
              while contributing to positive social change through strategic Organization partnerships. 
              Our mission is to democratize access to impactful career opportunities globally.
            </p>
          </div>

          <div className="mb-07">
            <h3 className="text-3xl font-bold text-olive-800 mb-6 text-center">Our Mission & Vision</h3>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 text-olive-600 mr-3" />
                  <h4 className="text-xl font-bold text-olive-800">Mission</h4>
                </div>
                <p className="text-olive-600 leading-relaxed">
                To inspire and empower skilled professionals to collaborate with mission-driven non-profits worldwide, forging meaningful careers that spark lasting social change and strengthen communities globally.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-olive-600 mr-3" />
                  <h4 className="text-xl font-bold text-olive-800">Vision</h4>
                </div>
                <p className="text-olive-600 leading-relaxed">
                  A world where every young professional has access to meaningful career opportunities 
                  that align with their values, and every Organization has the talented workforce needed to 
                  maximize their social impact.
                </p>
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

          <div className="bg-olive-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-olive-800 mb-6 text-center">Send us a Message</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  Send to
                </label>
                <input
                  type="email"
                  value="hello@zaytoonz.org"
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-olive-300 bg-olive-50 text-olive-600 cursor-not-allowed"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-olive-700 mb-2">
                  I am a...
                </label>
                <select className="w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all">
                  <option>Select your role</option>
                  <option>Young Talent</option>
                  <option>Organization Representative</option>
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
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-olive-200 mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto mb-4" />
              <p className="text-olive-600 mb-4 max-w-md">
              Zaytoonz offers a streamlined platform that connects skilled professionals with mission-driven non-profit entities, enabling impactful collaborations that drive meaningful social change.              </p>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">Platform</h3>
              <ul className="space-y-2 text-olive-600">
                <li><a href="/seeker" className="hover:text-olive-700">For Seekers</a></li>
                <li><a href="/ngo" className="hover:text-olive-700">For Organizations</a></li>
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
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-olive-600 hover:text-olive-700 transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-olive-600 hover:text-olive-700 transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-olive-600 hover:text-olive-700 transition-colors">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="#" className="text-olive-600 hover:text-olive-700 transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
                <a href="#" className="text-olive-600 hover:text-olive-700 transition-colors">
                  <Youtube className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-olive-200 mt-8 pt-8 text-center text-olive-600">
            <p>&copy; 2025 Zaytoonz Organization. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
