'use client';

import React, { useEffect, useState } from 'react';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ShareOpportunityProps {
  title: string;
  pageUrl?: string;
  logoSrc?: string;
}

const defaultLogo = '/image.png';

export default function ShareOpportunity({ title, pageUrl, logoSrc }: ShareOpportunityProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(pageUrl || '');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pageUrl && typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [pageUrl]);

  const encodedUrl = encodeURIComponent(currentUrl || '');
  const encodedTitle = encodeURIComponent(title || 'Opportunity');
  const shareText = `${title} — ${currentUrl}`;

  const shareOptions = [
    { name: 'Instagram', url: `https://www.instagram.com/?url=${encodedUrl}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'WhatsApp', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}` },
    { name: 'Email', url: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(shareText)}` },
  ];

  const handleCopy = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = (url: string) => {
    if (!currentUrl) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-olive-200 text-olive-800 hover:bg-olive-50 transition text-sm font-medium"
      >
        <ShareIcon className="h-5 w-5" />
        Share
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-olive-500 hover:text-olive-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoSrc || defaultLogo}
                alt="Zaytoonz"
                className="h-12 w-12 rounded-lg object-contain bg-olive-50 border border-olive-100"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-olive-500">Share opportunity</p>
                <p className="text-base font-semibold text-olive-900 line-clamp-2">{title}</p>
                <p className="text-xs text-olive-600 truncate">{currentUrl}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => handleShare(opt.url)}
                  className="w-full px-4 py-3 rounded-xl border border-olive-100 bg-olive-50 text-olive-800 hover:border-olive-200 hover:bg-olive-100 transition text-sm font-medium"
                >
                  {opt.name}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-olive-700 text-white text-sm font-semibold hover:bg-olive-800 transition"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <p className="text-xs text-olive-600">Includes Zaytoonz logo, title, and page URL.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

