'use client';

import { useState } from 'react';
import { SOCIAL_LINKS, type SocialLink } from '@/app/lib/socialLinks';

function SocialCard({ link }: { link: SocialLink }) {
  const [qrFailed, setQrFailed] = useState(false);

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.ariaLabel}
      className="group relative flex flex-col items-center justify-center min-h-[160px] p-5 rounded-2xl bg-white border border-olive-200 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-olive-400"
    >
      <div className="flex flex-col items-center gap-3 transition-all duration-300 group-hover:opacity-0 group-hover:scale-90">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: link.gradient }}
        >
          <svg fill="white" viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7">
            <path d={link.iconPath} />
          </svg>
        </div>
        <div className="text-center">
          <div className="font-bold text-olive-800">{link.title}</div>
          <div className="text-sm text-olive-600">{link.description}</div>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 scale-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
        <div className="w-24 h-24 bg-white rounded-xl border border-olive-200 p-1.5 flex items-center justify-center mb-2">
          {qrFailed ? (
            <span className="text-xs font-semibold text-olive-600">QR Code</span>
          ) : (
            <img
              src={link.qr}
              alt={`${link.title} QR Code`}
              className="w-full h-full object-cover"
              onError={() => setQrFailed(true)}
            />
          )}
        </div>
        <span className="text-sm font-semibold text-olive-700">{link.scanText}</span>
      </div>
    </a>
  );
}

export default function SocialMediaLinks() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
      {SOCIAL_LINKS.map((link) => (
        <SocialCard key={link.key} link={link} />
      ))}
    </div>
  );
}
