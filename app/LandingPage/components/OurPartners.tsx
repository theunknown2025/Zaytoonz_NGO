'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, GraduationCap, DollarSign, Building2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface NGO {
  id: string;
  name: string;
  logo_url?: string;
  profile_image_url?: string;
  jobs_count: number;
  fundings_count: number;
  trainings_count: number;
  total_opportunities: number;
}

interface OurPartnersProps {
  translations?: {
    title: string;
    subtitle: string;
    viewProfile: string;
    opportunities: string;
  };
}

export default function OurPartners({ translations }: OurPartnersProps) {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/ngos');
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setNgos(data.ngos || []);
        }
      } catch (err) {
        console.error('Error fetching NGOs:', err);
        setError('Failed to load partners');
      } finally {
        setLoading(false);
      }
    };

    fetchNGOs();
  }, []);

  const defaultTranslations = {
    title: 'Our Partners',
    subtitle: 'Meet the organizations making a difference',
    viewProfile: 'View Profile',
    opportunities: 'Opportunities'
  };

  const t = translations || defaultTranslations;

  const itemsPerView = 3;
  const maxIndex = Math.max(0, ngos.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (ngos.length <= itemsPerView) return 0;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (ngos.length <= itemsPerView) return 0;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const goToSlide = (index: number) => {
    if (ngos.length <= itemsPerView) return;
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  // Auto-play slider
  useEffect(() => {
    if (ngos.length <= itemsPerView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [ngos.length, maxIndex]);

  if (loading) {
    return (
      <section id="partners" className="py-20 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || ngos.length === 0) {
    return null; // Don't show section if no partners
  }

  // Get visible NGOs - show 3 centered items
  const getVisibleNGOs = () => {
    if (ngos.length <= itemsPerView) {
      // If we have 3 or fewer, show all and center them
      return ngos;
    }
    
    // Get the slice of items to show
    const visible = ngos.slice(currentIndex, currentIndex + itemsPerView);
    
    // If we're at the end and need to wrap, add items from the beginning
    if (visible.length < itemsPerView) {
      const remaining = itemsPerView - visible.length;
      return [...visible, ...ngos.slice(0, remaining)];
    }
    
    return visible;
  };

  const visibleNGOs = getVisibleNGOs();

  return (
    <section id="partners" className="py-20 bg-olive-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-olive-800 mb-4">
            {t.title}
          </h2>
          <p className="text-xl text-olive-600 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          {ngos.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-olive-50 border border-olive-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-olive-700" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-olive-50 border border-olive-200"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-olive-700" />
              </button>
            </>
          )}

          {/* Slider */}
          <div 
            ref={sliderRef}
            className="overflow-hidden px-12"
          >
            <div className="flex justify-center gap-8 transition-transform duration-500 ease-in-out">
              {visibleNGOs.map((ngo, index) => (
                <Link
                  key={`${ngo.id}-${currentIndex + index}`}
                  href={`/public/ngo/${ngo.id}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-olive-100 hover:border-olive-300 flex-shrink-0 w-full max-w-sm"
                >
                  <div className="p-6">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-olive-100 to-olive-200 flex items-center justify-center border-4 border-white shadow-lg">
                        {ngo.logo_url || ngo.profile_image_url ? (
                          <img
                            src={ngo.logo_url || ngo.profile_image_url}
                            alt={ngo.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: ngo.logo_url || ngo.profile_image_url ? 'none' : 'flex' }}>
                          <img
                            src="/image.png"
                            alt="Zaytoonz"
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* NGO Name */}
                    <h3 className="text-xl font-bold text-olive-800 text-center mb-4 group-hover:text-olive-600 transition-colors">
                      {ngo.name}
                    </h3>

                    {/* Opportunity Counts */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                      {ngo.jobs_count > 0 && (
                        <div className="flex flex-col items-center">
                          <Briefcase className="w-5 h-5 text-olive-600 mb-1" />
                          <span className="text-sm font-semibold text-olive-800">{ngo.jobs_count}</span>
                        </div>
                      )}
                      {ngo.fundings_count > 0 && (
                        <div className="flex flex-col items-center">
                          <DollarSign className="w-5 h-5 text-olive-600 mb-1" />
                          <span className="text-sm font-semibold text-olive-800">{ngo.fundings_count}</span>
                        </div>
                      )}
                      {ngo.trainings_count > 0 && (
                        <div className="flex flex-col items-center">
                          <GraduationCap className="w-5 h-5 text-olive-600 mb-1" />
                          <span className="text-sm font-semibold text-olive-800">{ngo.trainings_count}</span>
                        </div>
                      )}
                    </div>

                    {/* Total Opportunities */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-olive-600">
                        {ngo.total_opportunities} {t.opportunities}
                      </p>
                    </div>

                    {/* View Profile Link */}
                    <div className="flex items-center justify-center text-olive-600 group-hover:text-olive-700 transition-colors">
                      <span className="text-sm font-medium mr-2">{t.viewProfile}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          {ngos.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(ngos.length / itemsPerView) }).map((_, index) => {
                const slideIndex = index * itemsPerView;
                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / itemsPerView) === index
                        ? 'bg-olive-600 w-8'
                        : 'bg-olive-300 hover:bg-olive-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Navigate All Organizations Button */}
        <div className="text-center mt-12">
          <Link
            href="/public/organizations"
            className="inline-flex items-center px-8 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="mr-2">Navigate all Organizations</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
