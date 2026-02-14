'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Youtube,
  ChevronDown,
  Languages,
  Sparkles,
  MessageCircle,
  FileText,
  Compass,
  GraduationCap,
  Bot,
  Zap
} from 'lucide-react';
import RecentOpportunities from './components/RecentOpportunities';
import OurPartners from './components/OurPartners';
import { languages, getTranslations, getLanguageByCode, type LanguageCode, type Language } from './translations';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(languages[0]);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Get translations based on selected language
  const t = getTranslations(selectedLang.code);
  const isRTL = selectedLang.dir === 'rtl';

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleLanguageChange = (lang: Language) => {
    setSelectedLang(lang);
    setIsLangOpen(false);
  };

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-olive-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/image.png" alt="Zaytoonz" className="h-12 w-auto" />
            </div>
            
            <nav className={`hidden md:flex ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
              <a href="#home" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.home}
              </a>
              <a href="#jobs" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.jobs}
              </a>
              <a href="#training" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.training}
              </a>
              <a href="#funding" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.funding}
              </a>
              <a href="#resources" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.resources}
              </a>
              <a href="#about" className="text-olive-700 hover:text-olive-600 font-medium transition-colors">
                {t.nav.aboutUs}
              </a>
            </nav>

            <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {/* Language Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} text-olive-700 hover:text-olive-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-olive-50`}
                >
                  <Languages className="h-5 w-5" />
                  <span className="text-lg">{selectedLang.flag}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLangOpen && (
                  <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-44 bg-white rounded-xl shadow-lg border border-olive-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`w-full flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-2.5 text-${isRTL ? 'right' : 'left'} hover:bg-olive-50 transition-colors ${
                          selectedLang.code === lang.code ? 'bg-olive-100 text-olive-800' : 'text-olive-700'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/auth/signin"
                className="text-olive-700 hover:text-olive-600 font-medium transition-colors"
              >
                {t.nav.signIn}
              </a>
              <a
                href="/auth/signup"
                className="bg-olive-700 text-white px-6 py-2 rounded-full font-medium hover:bg-olive-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {t.nav.getStarted}
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
                  {t.nav.home}
                </a>
                <a href="#jobs" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  {t.nav.jobs}
                </a>
                <a href="#training" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  {t.nav.training}
                </a>
                <a href="#funding" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  {t.nav.funding}
                </a>
                <a href="#resources" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  {t.nav.resources}
                </a>
                <a href="#about" className="block px-3 py-2 text-olive-700 hover:text-olive-600">
                  {t.nav.aboutUs}
                </a>
                
                {/* Mobile Language Selector */}
                <div className="pt-4 pb-3 border-t border-olive-200">
                  <p className="px-3 py-2 text-sm font-semibold text-olive-500 uppercase tracking-wide">{t.nav.language}</p>
                  <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-3 py-2`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} px-3 py-2 rounded-lg transition-colors ${
                          selectedLang.code === lang.code 
                            ? 'bg-olive-700 text-white' 
                            : 'bg-olive-100 text-olive-700 hover:bg-olive-200'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 pb-3 border-t border-olive-200">
                  <a href="/auth/signin" className={`block w-full text-${isRTL ? 'right' : 'left'} px-3 py-2 text-olive-700 hover:text-olive-600`}>
                    {t.nav.signIn}
                  </a>
                  <a href="/auth/signup" className="block w-full mt-2 bg-olive-700 text-white px-3 py-2 rounded-full font-medium text-center hover:bg-olive-800">
                    {t.nav.getStarted}
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
                {t.hero.badge}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-olive-800 mb-6 leading-tight">
              {t.hero.title1} <span className="text-olive-600">{t.hero.title2}</span> {t.hero.title3}
              <br />
              <span className="text-olive-600">{t.hero.title4}</span>
            </h1>
            
            <p className="text-xl text-olive-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t.hero.description}
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16`}>
              <a
                href="/seeker"
                className={`bg-olive-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center`}
              >
                {t.hero.discoverOpportunities}
                <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
              </a>
              <a
                href="/auth/signup"
                className={`border-2 border-olive-500 text-olive-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-50 transition-all duration-300 flex items-center justify-center`}
              >
                {t.hero.postOpportunities}
                <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
              </a>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mt-20">
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">15,000+</h3>
                <p className="text-olive-600 font-medium">{t.stats.activeTalents}</p>
                <p className="text-sm text-olive-500 mt-1">{t.stats.fromCountries}</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">750+</h3>
                <p className="text-olive-600 font-medium">{t.stats.partnerOrgs}</p>
                <p className="text-sm text-olive-500 mt-1">{t.stats.acrossContinents}</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">2.5M+</h3>
                <p className="text-olive-600 font-medium">{t.stats.livesImpacted}</p>
                <p className="text-sm text-olive-500 mt-1">{t.stats.throughPartnerships}</p>
              </div>
              <div className="text-center">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-olive-800 mb-2">97%</h3>
                <p className="text-olive-600 font-medium">{t.stats.successRate}</p>
                <p className="text-sm text-olive-500 mt-1">{t.stats.successfulPlacements}</p>
              </div>
            </div>
            
            {/* Image Carousel Indicators */}
            <div className={`flex justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} mt-8`}>
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
              {t.opportunities.latestTitle}
            </h2>
          </div>

          <RecentOpportunities lang={selectedLang.code} translations={t.opportunities} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              {t.howItWorks.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Job Seekers */}
            <div>
              <div className="text-center mb-8">
                <div className="bg-olive-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-olive-800 mb-2">{t.howItWorks.forSeekers}</h3>
                <p className="text-olive-600">{t.howItWorks.seekersSubtitle}</p>
              </div>

              <div className="space-y-6">
                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <UserPlus className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.seeker1Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.seeker1Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Search className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.seeker2Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.seeker2Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Briefcase className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.seeker3Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.seeker3Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <TrendingUp className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.seeker4Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.seeker4Desc}</p>
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
                <h3 className="text-2xl font-bold text-olive-800 mb-2">{t.howItWorks.forOrgs}</h3>
                <p className="text-olive-600">{t.howItWorks.orgsSubtitle}</p>
              </div>

              <div className="space-y-6">
                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Shield className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.org1Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.org1Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Lightbulb className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.org2Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.org2Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <BarChart3 className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.org3Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.org3Desc}</p>
                  </div>
                </div>

                <div className={`flex items-start ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                  <div className="bg-olive-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`bg-olive-100 w-10 h-10 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'}`}>
                        <Users className="h-5 w-5 text-olive-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-olive-800">{t.howItWorks.org4Title}</h4>
                    </div>
                    <p className="text-olive-600 leading-relaxed">{t.howItWorks.org4Desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Morchid AI Section */}
      <section id="morchid" className="py-20 bg-gradient-to-br from-olive-50 via-white to-olive-100 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-olive-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-olive-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-olive-100/40 rounded-full blur-3xl"></div>
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23556B2F' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-olive-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              {t.morchid?.badge || '✨ AI-Powered Career Assistant'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
              {t.morchid?.title || 'Meet Morchid'}
            </h2>
            <p className="text-2xl text-olive-600 font-medium mb-4">
              {t.morchid?.subtitle || 'Your Intelligent Career Companion'}
            </p>
            <p className="text-lg text-olive-600 max-w-3xl mx-auto leading-relaxed">
              {t.morchid?.description || 'Morchid is your personal AI career assistant that understands your skills, analyzes opportunities, and provides personalized guidance to accelerate your professional journey.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Chat Illustration */}
            <div className={`relative ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="bg-white rounded-3xl shadow-2xl border border-olive-200 overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-olive-600 to-olive-700 px-6 py-4 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Morchid AI</h3>
                    <p className="text-olive-100 text-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Online & Ready to Help
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 bg-gradient-to-b from-olive-50/50 to-white min-h-[320px]">
                  {/* User Message */}
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex items-end gap-2 max-w-[80%] ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="bg-olive-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md">
                        <p className="text-sm">{t.morchid?.chatPreview1 || "Hi! I'm looking for jobs in project management..."}</p>
                      </div>
                      <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-olive-600" />
                      </div>
                    </div>
                  </div>

                  {/* Bot Message */}
                  <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-[85%] ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white border border-olive-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md">
                        <p className="text-sm text-olive-700 leading-relaxed">
                          {t.morchid?.chatPreview2 || "I found 12 opportunities matching your profile! Based on your 5 years of experience and your skills in Agile and team leadership, here are the top matches..."}
                        </p>
                        {/* Opportunity Cards Preview */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 bg-olive-50 rounded-lg px-3 py-2 border border-olive-100">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-olive-800">Senior Project Manager</p>
                              <p className="text-[10px] text-olive-500">UNICEF • Remote</p>
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">95%</span>
                          </div>
                          <div className="flex items-center gap-2 bg-olive-50 rounded-lg px-3 py-2 border border-olive-100">
                            <div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-olive-800">Program Coordinator</p>
                              <p className="text-[10px] text-olive-500">Save the Children • Morocco</p>
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">88%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white border border-olive-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="px-6 py-4 bg-white border-t border-olive-100">
                  <div className="flex items-center gap-3 bg-olive-50 rounded-xl px-4 py-3">
                    <input 
                      type="text" 
                      placeholder="Ask Morchid anything..." 
                      className="flex-1 bg-transparent text-olive-700 placeholder-olive-400 text-sm focus:outline-none"
                      disabled
                    />
                    <button className="bg-olive-600 text-white rounded-lg p-2 hover:bg-olive-700 transition-colors">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-olive-200/50 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-olive-300/40 rounded-full blur-xl"></div>
            </div>

            {/* Right Side - Features */}
            <div className={`space-y-6 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
              {/* Feature 1 */}
              <div className={`flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-olive-100 hover:shadow-xl hover:border-olive-300 transition-all duration-300 transform hover:-translate-y-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-olive-800 mb-2">{t.morchid?.feature1Title || 'Smart Job Matching'}</h4>
                  <p className="text-olive-600 text-sm leading-relaxed">{t.morchid?.feature1Desc || 'Morchid analyzes your CV and profile to find opportunities that perfectly match your skills and career goals.'}</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className={`flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-olive-100 hover:shadow-xl hover:border-olive-300 transition-all duration-300 transform hover:-translate-y-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="bg-gradient-to-br from-olive-500 to-olive-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-olive-500/25">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-olive-800 mb-2">{t.morchid?.feature2Title || 'CV Optimization'}</h4>
                  <p className="text-olive-600 text-sm leading-relaxed">{t.morchid?.feature2Desc || 'Get AI-powered feedback on your resume with specific suggestions to improve your chances of success.'}</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className={`flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-olive-100 hover:shadow-xl hover:border-olive-300 transition-all duration-300 transform hover:-translate-y-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                  <Compass className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-olive-800 mb-2">{t.morchid?.feature3Title || 'Career Guidance'}</h4>
                  <p className="text-olive-600 text-sm leading-relaxed">{t.morchid?.feature3Desc || 'Receive personalized career advice based on your experience, skills, and industry trends.'}</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className={`flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg border border-olive-100 hover:shadow-xl hover:border-olive-300 transition-all duration-300 transform hover:-translate-y-1 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-olive-800 mb-2">{t.morchid?.feature4Title || 'Interview Prep'}</h4>
                  <p className="text-olive-600 text-sm leading-relaxed">{t.morchid?.feature4Desc || 'Practice with AI-generated interview questions tailored to your target roles and industries.'}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 pt-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                <a
                  href="/seeker/Morchid"
                  className="bg-olive-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  {t.morchid?.tryMorchid || 'Try Morchid Now'}
                </a>
                <a
                  href="#about"
                  className="border-2 border-olive-500 text-olive-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-olive-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t.morchid?.learnMore || 'Learn More'}
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-20 grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-olive-100">
              <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-olive-600" />
              </div>
              <h4 className="text-3xl font-bold text-olive-800 mb-1">50K+</h4>
              <p className="text-olive-600 text-sm">Conversations</p>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-olive-100">
              <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-olive-600" />
              </div>
              <h4 className="text-3xl font-bold text-olive-800 mb-1">10K+</h4>
              <p className="text-olive-600 text-sm">CVs Analyzed</p>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-olive-100">
              <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="h-6 w-6 text-olive-600" />
              </div>
              <h4 className="text-3xl font-bold text-olive-800 mb-1">85%</h4>
              <p className="text-olive-600 text-sm">Match Accuracy</p>
            </div>
            <div className="text-center p-6 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-olive-100">
              <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-olive-600" />
              </div>
              <h4 className="text-3xl font-bold text-olive-800 mb-1">&lt;2s</h4>
              <p className="text-olive-600 text-sm">Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <OurPartners translations={t.partners} />

      {/* About Section */}
      <section id="about" className="py-12 bg-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              {t.about.title}
            </h2>
            <p className="text-xl text-olive-600 max-w-4xl mx-auto">
              {t.about.description}
            </p>
          </div>

          <div className="mb-07">
            <h3 className="text-3xl font-bold text-olive-800 mb-6 text-center">{t.about.missionVisionTitle}</h3>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Target className={`h-8 w-8 text-olive-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  <h4 className="text-xl font-bold text-olive-800">{t.about.missionTitle}</h4>
                </div>
                <p className="text-olive-600 leading-relaxed">
                  {t.about.missionText}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Award className={`h-8 w-8 text-olive-600 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  <h4 className="text-xl font-bold text-olive-800">{t.about.visionTitle}</h4>
                </div>
                <p className="text-olive-600 leading-relaxed">
                  {t.about.visionText}
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
              {t.contact.title}
            </h2>
            <p className="text-xl text-olive-600 max-w-3xl mx-auto">
              {t.contact.description}
            </p>
          </div>

          <div className="bg-olive-100 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-olive-800 mb-6 text-center">{t.contact.formTitle}</h3>
            
            <form className="space-y-6">
              <div>
                <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {t.contact.sendTo}
                </label>
                <input
                  type="email"
                  value="hello@zaytoonz.org"
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border border-olive-300 bg-olive-50 text-olive-600 cursor-not-allowed ${isRTL ? 'text-right' : ''}`}
                  dir="ltr"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {t.contact.firstName}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all ${isRTL ? 'text-right' : ''}`}
                    placeholder={t.contact.firstNamePlaceholder}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {t.contact.lastName}
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all ${isRTL ? 'text-right' : ''}`}
                    placeholder={t.contact.lastNamePlaceholder}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {t.contact.email}
                  </label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all`}
                    placeholder={t.contact.emailPlaceholder}
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {t.contact.iAmA}
                </label>
                <select className={`w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all ${isRTL ? 'text-right' : ''}`}>
                  <option>{t.contact.selectRole}</option>
                  <option>{t.contact.youngTalent}</option>
                  <option>{t.contact.orgRepresentative}</option>
                  <option>{t.contact.partnerOrg}</option>
                  <option>{t.contact.other}</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium text-olive-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {t.contact.message}
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border border-olive-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all ${isRTL ? 'text-right' : ''}`}
                  placeholder={t.contact.messagePlaceholder}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className={`w-full bg-olive-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-olive-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center`}
              >
                {t.contact.sendMessage}
                <Send className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} h-5 w-5`} />
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
                {t.footer.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">{t.footer.platform}</h3>
              <ul className="space-y-2 text-olive-600">
                <li><a href="/seeker" className="hover:text-olive-700">{t.footer.forSeekers}</a></li>
                <li><a href="/ngo" className="hover:text-olive-700">{t.footer.forOrganizations}</a></li>
                <li><a href="#services" className="hover:text-olive-700">{t.footer.services}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">{t.footer.support}</h3>
              <ul className="space-y-2 text-olive-600">
                <li><a href="#contact" className="hover:text-olive-700">{t.footer.contact}</a></li>
                <li><a href="#about" className="hover:text-olive-700">{t.footer.about}</a></li>
                <li><a href="/auth/signup" className="hover:text-olive-700">{t.nav.getStarted}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-olive-800 mb-4">{t.footer.followUs}</h3>
              <div className={`flex ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
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
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
