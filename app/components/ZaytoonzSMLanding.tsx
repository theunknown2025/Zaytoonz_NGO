'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { SOCIAL_LINKS } from '../lib/socialLinks';

interface ZaytoonzSMLandingProps {
  isAuthenticated: boolean;
  nextPath: string;
}

const slides = ['/Health.png', '/Water.png', '/Green.png', '/Education.png'];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ZaytoonzSMLanding({
  isAuthenticated,
  nextPath,
}: ZaytoonzSMLandingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessError, setAccessError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(!isAuthenticated);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setAccessError('');
    try {
      const res = await fetch(`${basePath}/api/access/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setAccessError('Invalid email or password.');
        setSubmitting(false);
        return;
      }
      window.location.assign(`${basePath}${nextPath}`);
    } catch {
      setAccessError('Unable to reach the server. Please try again.');
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${basePath}/api/access/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    window.location.assign(`${basePath}/`);
  };

  return (
    <div className="zaytoonz-sm-root">
      {!isAuthenticated && !showLogin && (
        <div className="access-toolbar">
          <button
            type="button"
            className="access-toolbar-button primary"
            onClick={() => setShowLogin(true)}
          >
            Access web app
          </button>
        </div>
      )}
      {isAuthenticated && (
        <div className="access-toolbar">
          <Link href="/app" className="access-toolbar-button primary">
            Open web app
          </Link>
          <button type="button" className="access-toolbar-button" onClick={handleLogout}>
            Lock
          </button>
        </div>
      )}

      {/* Background Slideshow */}
      <div className="background-slideshow">
        {slides.map((src, index) => (
          <div
            key={src}
            className={`bg-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div className="overlay" />

      <div className="container">
        {/* Header */}
        <div className="header">
          <img
            src="/image.png"
            alt="Zaytoonz Logo - Social Impact Organization"
            className="logo"
          />

          <p className="slogan">
            Fueling <span className="slogan-highlight">Social Impact</span> with
            Professional Expertise
          </p>

          <p className="subtitle">Connect With Our Community</p>
        </div>

        {/* Social Links Grid */}
        <div className="links-container">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-link ${link.key}`}
              aria-label={link.ariaLabel}
            >
              <div className="card-front">
                <div className="icon-wrapper">
                  <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={link.iconPath} />
                  </svg>
                </div>
                <div className="link-title">{link.title}</div>
                <div className="link-description">{link.description}</div>
              </div>
              <div className="card-back">
                <div className="qr-code">
                  <img
                    src={link.qr}
                    alt={`${link.title} QR Code`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML =
                          "<span class='qr-placeholder'>QR Code</span>";
                      }
                    }}
                  />
                </div>
                <span className="scan-text">{link.scanText}</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>© 2026 Zaytoonz. All rights reserved.</p>
        </div>
      </div>

      {/* Exclusive access login modal (cannot be dismissed) */}
      {showLogin && (
        <div className="entry-modal-backdrop" role="dialog" aria-modal="true">
          <form className="entry-modal" onSubmit={handleLogin}>
            <img src="/image.png" alt="Zaytoonz" className="entry-modal-logo" />
            <h2 className="entry-modal-title">Exclusive Access</h2>
            <p className="entry-modal-subtitle">
              This preview is restricted. Sign in with your access credentials to continue.
            </p>

            <div className="entry-fields">
              <label className="entry-label">
                Access
                <input
                  type="email"
                  className="entry-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAccessError('');
                  }}
                  placeholder="admin@zaytoonz.com"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </label>

              <label className="entry-label">
                Password
                <input
                  type="password"
                  className="entry-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAccessError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            {accessError && (
              <div className="entry-error">
                <p>{accessError}</p>
              </div>
            )}

            <div className="entry-modal-buttons">
              <button className="entry-button primary" type="submit" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                className="entry-button secondary"
                type="button"
                onClick={() => setShowLogin(false)}
              >
                Access Social Media
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        .zaytoonz-sm-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow-x: hidden;
        }

        .background-slideshow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -2;
        }

        .bg-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transition: opacity 1.5s ease-in-out;
        }

        .bg-slide.active {
          opacity: 1;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(26, 47, 26, 0.85) 0%,
            rgba(45, 74, 45, 0.8) 25%,
            rgba(61, 92, 61, 0.75) 50%,
            rgba(74, 107, 74, 0.8) 75%,
            rgba(85, 107, 47, 0.85) 100%
          );
          z-index: -1;
        }

        .container {
          max-width: 900px;
          width: 100%;
          position: relative;
          z-index: 1;
          margin-top: -100px;
        }

        .header {
          text-align: center;
          margin-bottom: 50px;
        }

        .logo {
          width: 260px;
          height: auto;
          margin-bottom: 12px;
          filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
        }

        .slogan {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          margin-bottom: 12px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .slogan-highlight {
          color: #a8d94a;
          font-weight: 700;
        }

        .subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 400;
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .links-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .social-link {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px;
          background: rgba(168, 217, 74, 0.3);
          border-radius: 20px;
          text-decoration: none;
          color: white;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          min-height: 180px;
          border: 1px solid rgba(168, 217, 74, 0.4);
          backdrop-filter: blur(10px);
        }

        .social-link:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          background: rgba(85, 107, 47, 0.95);
          border-color: rgba(85, 107, 47, 1);
        }

        .card-front {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .social-link:hover .card-front {
          opacity: 0;
          transform: scale(0.8);
        }

        .card-back {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .social-link:hover .card-back {
          opacity: 1;
          transform: scale(1);
        }

        .qr-code {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
          padding: 8px;
        }

        .qr-code img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qr-placeholder {
          font-size: 0.7rem;
          color: #556b2f;
          text-align: center;
          font-weight: 600;
        }

        .scan-text {
          font-size: 0.85rem;
          color: white;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-wrapper svg {
          width: 32px;
          height: 32px;
        }

        .whatsapp .icon-wrapper {
          background: linear-gradient(135deg, #25d366, #128c7e);
        }

        .telegram .icon-wrapper {
          background: linear-gradient(135deg, #0088cc, #229ed9);
        }

        .facebook .icon-wrapper {
          background: linear-gradient(135deg, #1877f2, #3b5998);
        }

        .linkedin .icon-wrapper {
          background: linear-gradient(135deg, #0077b5, #00a0dc);
        }

        .facebook-group .icon-wrapper {
          background: linear-gradient(135deg, #1877f2, #4267b2);
        }

        .linkedin-group .icon-wrapper {
          background: linear-gradient(135deg, #0077b5, #005582);
        }

        .link-title {
          font-weight: 700;
          font-size: 1rem;
          color: white;
          text-align: center;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .link-description {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
          text-align: center;
        }

        .footer {
          text-align: center;
          margin-top: 50px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .entry-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        form.entry-modal {
          max-width: 420px;
        }

        form.entry-modal .entry-error {
          margin: 0 0 16px;
        }

        .entry-modal-logo {
          width: 140px;
          height: auto;
          margin: 0 auto 12px;
          display: block;
        }

        .entry-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 18px;
        }

        .entry-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .access-toolbar {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 5;
        }

        .access-toolbar-button {
          border-radius: 999px;
          padding: 10px 18px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          color: white;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          transition: background-color 0.18s ease, transform 0.18s ease;
        }

        .access-toolbar-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .access-toolbar-button.primary {
          background: #a8d94a;
          border-color: #a8d94a;
          color: #1a2f1a;
        }

        .access-toolbar-button.primary:hover {
          background: #b8e65c;
        }

        .entry-modal {
          background: white;
          border-radius: 24px;
          padding: 32px 28px;
          max-width: 630px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(168, 217, 74, 0.4);
        }

        .entry-modal-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #1a2f1a;
          margin-bottom: 8px;
        }

        .entry-modal-subtitle {
          font-size: 0.95rem;
          color: #4a5d4a;
          margin-bottom: 24px;
        }

        .entry-options {
          display: flex;
          flex-direction: row;
          gap: 16px;
        }

        .entry-card {
          text-align: left;
          border-radius: 18px;
          padding: 18px 16px;
          border: 1px solid rgba(85, 107, 47, 0.2);
          background: #f5f8ee;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            border-color 0.18s ease, background-color 0.18s ease;
          flex: 1;
        }

        .entry-card--primary {
          /* same base color as secondary; visual privilege comes from copy */
        }

        .entry-card--secondary {
          /* same base color as primary */
        }

        .entry-card--primary .entry-card-text,
        .entry-card--primary .entry-card-note {
          color: #4a5d4a;
        }

        .entry-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
          border-color: rgba(85, 107, 47, 0.55);
          background-color: #e4f0d0;
        }

        .entry-card--primary:hover {
          background-color: #e4f0d0;
        }

        .entry-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          font-size: 13px;
          box-shadow: none;
          border: 1px solid rgba(85, 107, 47, 0.5);
          background: #f7fbf0;
        }

        .entry-card-icon--social {
          color: #556b2f;
        }

        .entry-card-icon--app {
          color: #556b2f;
        }

        .entry-card-icon-text {
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .entry-card-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .entry-card-text {
          font-size: 0.9rem;
          color: #4a5d4a;
        }

        .entry-card-note {
          margin-top: 4px;
          font-size: 0.8rem;
          color: #8a9a5b;
          font-weight: 600;
        }

        .entry-modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .entry-modal-buttons--inline {
          flex-direction: row;
          justify-content: space-between;
          margin-top: 20px;
        }

        .entry-button {
          border-radius: 999px;
          padding: 12px 18px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            background-color 0.18s ease, color 0.18s ease;
        }

        .entry-button.primary {
          background: #556b2f;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        }

        .entry-button.primary:hover {
          background: #455624;
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }

        .entry-button.secondary {
          background: white;
          color: #556b2f;
          border: 1px solid rgba(85, 107, 47, 0.3);
        }

        .entry-button.secondary:hover {
          background: #f3f7ec;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .entry-label {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          width: 100%;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1a2f1a;
          gap: 6px;
        }

        .entry-input {
          width: 100%;
          border-radius: 999px;
          border: 1px solid rgba(85, 107, 47, 0.35);
          padding: 10px 14px;
          font-size: 0.9rem;
          outline: none;
          background: #f8fbf2;
          color: #1a2f1a;
          transition: border-color 0.16s ease, box-shadow 0.16s ease,
            background-color 0.16s ease;
        }

        .entry-input:focus {
          border-color: #71893d;
          background: #ffffff;
          box-shadow: 0 0 0 1px rgba(168, 217, 74, 0.65);
        }

        .entry-error {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: #fff5f3;
          border: 1px solid #f2b3a3;
          font-size: 0.85rem;
          color: #8a3b2b;
          text-align: left;
        }

        .entry-error-link {
          margin-top: 6px;
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          font-weight: 600;
          color: #556b2f;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .links-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .logo {
            width: 180px;
          }

          .entry-options {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .links-container {
            grid-template-columns: 1fr;
            max-width: 320px;
            margin: 0 auto;
          }

          .logo {
            width: 150px;
          }

          .social-link {
            min-height: 160px;
          }

          .entry-modal {
            margin: 0 16px;
          }

          .entry-modal-buttons--inline {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

