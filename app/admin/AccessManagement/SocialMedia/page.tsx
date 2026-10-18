'use client';

import { useEffect, useState } from 'react';
import {
  PhotoIcon,
  LinkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  getSocialMediaLinks,
  updateSocialMediaLink,
  uploadSocialQrCode,
  type EditableSocialLink,
} from '../services/accessManagementService';

export default function SocialMediaManagementPage() {
  const [links, setLinks] = useState<EditableSocialLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { href: string; qr: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getSocialMediaLinks();
      setLinks(data);
      const next: Record<string, { href: string; qr: string }> = {};
      data.forEach((link) => {
        next[link.key] = { href: link.href, qr: link.qr };
      });
      setDrafts(next);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load social media links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string) => {
    const draft = drafts[key];
    if (!draft?.href?.trim()) {
      toast.error('Link URL is required');
      return;
    }
    setSavingKey(key);
    try {
      const { error } = await updateSocialMediaLink(key, {
        href: draft.href,
        qr_url: draft.qr,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Social media link updated');
      await load();
    } finally {
      setSavingKey(null);
    }
  };

  const handleQrUpload = async (key: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setUploadingKey(key);
    try {
      const { url, error } = await uploadSocialQrCode(key, file);
      if (error || !url) {
        toast.error(error || 'Upload failed');
        return;
      }
      setDrafts((prev) => ({
        ...prev,
        [key]: { href: prev[key]?.href || '', qr: url },
      }));
      const { error: saveError } = await updateSocialMediaLink(key, {
        href: drafts[key]?.href || '',
        qr_url: url,
      });
      if (saveError) {
        toast.error(saveError);
        return;
      }
      toast.success('QR code uploaded');
      await load();
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Social Media</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the link and QR code for each platform. Changes appear on the SM page and the
          landing page Get in Touch section.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
          Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const draft = drafts[link.key] || { href: link.href, qr: link.qr };
            return (
              <div
                key={link.key}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex items-start gap-3 sm:w-48 shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: link.gradient }}
                    >
                      <svg fill="white" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                        <path d={link.iconPath} />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{link.title}</div>
                      <div className="text-xs text-gray-500">{link.description}</div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="flex items-center text-xs font-medium text-gray-600 mb-1.5">
                        <LinkIcon className="h-3.5 w-3.5 mr-1" />
                        Link URL
                      </label>
                      <input
                        type="url"
                        value={draft.href}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [link.key]: { ...draft, href: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#556B2F]/30 focus:border-[#556B2F]"
                        placeholder="https://"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      <div className="flex-1">
                        <label className="flex items-center text-xs font-medium text-gray-600 mb-1.5">
                          <PhotoIcon className="h-3.5 w-3.5 mr-1" />
                          QR Code
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                            {draft.qr ? (
                              <img
                                src={draft.qr}
                                alt={`${link.title} QR`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <PhotoIcon className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <label className="cursor-pointer inline-flex items-center px-3 py-2 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                            {uploadingKey === link.key ? 'Uploading…' : 'Upload QR'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingKey === link.key}
                              onChange={(e) =>
                                handleQrUpload(link.key, e.target.files?.[0] || null)
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSave(link.key)}
                        disabled={savingKey === link.key}
                        className="px-4 py-2 text-sm font-medium text-white rounded-xl bg-[#556B2F] hover:bg-[#445624] disabled:opacity-60"
                      >
                        {savingKey === link.key ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
