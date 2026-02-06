'use client';

import React, { useEffect, useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

interface ZaytoonzSMLandingProps {
  initialShowModal?: boolean;
}

const slides = ['/Health.png', '/Water.png', '/Green.png', '/Education.png'];

export default function ZaytoonzSMLanding({
  initialShowModal = false,
}: ZaytoonzSMLandingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showModal, setShowModal] = useState(initialShowModal);
  const [modalStep, setModalStep] = useState<'choice' | 'code'>('choice');
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGoToSocial = () => {
    setShowModal(false);
    router.push('/social');
  };

  const handleSelectTestApp = () => {
    setModalStep('code');
    setAccessError('');
    setAccessCode('');
  };

  const VALID_CODE = 'test@ZAYTOONZ2026';

  const submitAccessCode = () => {
    if (accessCode.trim() === VALID_CODE) {
      setShowModal(false);
      router.push('/app');
    } else {
      setAccessError(
        'Incorrect access code. You can continue by exploring our social media channels.',
      );
    }
  };

  const handleCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAccessCode();
    }
  };

  return (
    <div className="zaytoonz-sm-root">
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
          {/* WhatsApp */}
          <a
            href="https://chat.whatsapp.com/GlJyFL0Cxvm3AYUQRP4b9G"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link whatsapp"
            aria-label="Join our WhatsApp community chat"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="link-title">WhatsApp</div>
              <div className="link-description">Community Chat</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-whatsapp.png"
                  alt="WhatsApp QR Code"
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
              <span className="scan-text">Scan to Join</span>
            </div>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/zaytoonz"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link telegram"
            aria-label="Join our Telegram channel"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>
              <div className="link-title">Telegram</div>
              <div className="link-description">Channel</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-telegram.png"
                  alt="Telegram QR Code"
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
              <span className="scan-text">Scan to Join</span>
            </div>
          </a>

          {/* Facebook Page */}
          <a
            href="https://www.facebook.com/zaytoonz/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link facebook"
            aria-label="Follow our Facebook page"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="link-title">Facebook</div>
              <div className="link-description">Official Page</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-facebook.png"
                  alt="Facebook QR Code"
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
              <span className="scan-text">Scan to Follow</span>
            </div>
          </a>

          {/* LinkedIn Page */}
          <a
            href="https://www.linkedin.com/company/zaytoonz/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link linkedin"
            aria-label="Connect on LinkedIn company page"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div className="link-title">LinkedIn</div>
              <div className="link-description">Company Page</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-linkedin.png"
                  alt="LinkedIn QR Code"
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
              <span className="scan-text">Scan to Connect</span>
            </div>
          </a>

          {/* Facebook Group */}
          <a
            href="https://www.facebook.com/groups/654692163266122"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link facebook-group"
            aria-label="Join our Facebook community group"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div className="link-title">FB Group</div>
              <div className="link-description">Community</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-facebookgroupe.png"
                  alt="Facebook Group QR Code"
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
              <span className="scan-text">Scan to Join</span>
            </div>
          </a>

          {/* LinkedIn Group */}
          <a
            href="https://www.linkedin.com/groups/12864122/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link linkedin-group"
            aria-label="Join our LinkedIn networking group"
          >
            <div className="card-front">
              <div className="icon-wrapper">
                <svg fill="white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <div className="link-title">LI Group</div>
              <div className="link-description">Networking</div>
            </div>
            <div className="card-back">
              <div className="qr-code">
                <img
                  src="/sm/zz-linkedin.png"
                  alt="LinkedIn Group QR Code"
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
              <span className="scan-text">Scan to Join</span>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>© 2026 Zaytoonz. All rights reserved.</p>
        </div>
      </div>

      {/* Entry Modal */}
      {showModal && (
        <div className="entry-modal-backdrop" role="dialog" aria-modal="true">
          {modalStep === 'choice' ? (
            <div className="entry-modal">
              <h2 className="entry-modal-title">Welcome to Zaytoonz</h2>
              <p className="entry-modal-subtitle">
                Choose how you would like to connect with us.
              </p>

              <div className="entry-options">
                <button
                  type="button"
                  className="entry-card entry-card--secondary"
                  onClick={handleGoToSocial}
                >
                  <div className="entry-card-icon entry-card-icon--social">
                    <span className="entry-card-icon-text">SM</span>
                  </div>
                  <h3 className="entry-card-title">Navigate Zaytoonz Social media</h3>
                  <p className="entry-card-text">
                    Join our community on WhatsApp, Telegram, Facebook and LinkedIn.
                  </p>
                </button>

                <button
                  type="button"
                  className="entry-card entry-card--primary"
                  onClick={handleSelectTestApp}
                >
                  <div className="entry-card-icon entry-card-icon--app">
                    <span className="entry-card-icon-text">APP</span>
                  </div>
                  <h3 className="entry-card-title">Test Zaytoonz web app</h3>
                  <p className="entry-card-text">
                    Access a privileged preview of the Zaytoonz matching platform.
                  </p>
                  <p className="entry-card-note">
                    NB: Testing access is limited and requires an access code.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div className="entry-modal">
              <h2 className="entry-modal-title">Enter Access Code</h2>
              <p className="entry-modal-subtitle">
                Testing access is reserved. Use the provided access code to continue.
              </p>

              <label className="entry-label">
                Access Code
                <input
                  type="password"
                  className="entry-input"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setAccessError('');
                  }}
                  onKeyDown={handleCodeKeyDown}
                  placeholder="Enter your access code"
                />
              </label>

              {accessError && (
                <div className="entry-error">
                  <p>{accessError}</p>
                  <button
                    type="button"
                    className="entry-error-link"
                    onClick={handleGoToSocial}
                  >
                    Go to social media instead
                  </button>
                </div>
              )}

              <div className="entry-modal-buttons entry-modal-buttons--inline">
                <button
                  className="entry-button secondary"
                  type="button"
                  onClick={() => {
                    setModalStep('choice');
                    setAccessError('');
                    setAccessCode('');
                  }}
                >
                  Back
                </button>
                <button
                  className="entry-button primary"
                  type="button"
                  onClick={submitAccessCode}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
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
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
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

