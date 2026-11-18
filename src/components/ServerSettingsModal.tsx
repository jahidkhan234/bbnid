/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Server, Check, Globe, HelpCircle } from 'lucide-react';
import { getCustomBackendUrl, setCustomBackendUrl } from '../utils/apiConfig';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(getCustomBackendUrl());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomBackendUrl(url);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
    }, 1000);
  };

  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ব্যাকএন্ড এপিআই সার্ভার সেটিংস
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backend API Server Configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Note for GitHub Pages */}
        {isGitHubPages && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>GitHub Pages ডিপ্লয়মেন্ট সংক্রান্ত তথ্য:</span>
            </div>
            <p className="leading-relaxed">
              GitHub Pages শুধুমাত্র স্ট্যাটিক এইচটিএমএল/সিএসএস ফাইল হোস্ট করে, কোনো Node.js ব্যাকএন্ড চালাতে পারে না।
              আপনার হোস্ট করা ক্লাউড রান (Cloud Run), রেন্ডার (Render) বা ভেরসেল (Vercel) ব্যাকএন্ডের URL নিচে প্রদান করুন।
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              ব্যাকএন্ড সার্ভার URL (Backend Server Base URL)
            </label>
            <input
              type="url"
              placeholder="যেমন: https://my-ocr-backend.run.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ফাঁকা রাখলে বর্তমান ওয়েবসাইটের সাথে ডিফল্টভাবে যুক্ত ব্যাকএন্ড ব্যবহার করা হবে (<code className="font-mono">/api/extract-ocr</code>)।
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>সার্ভার URL সফলভাবে সংরক্ষিত হয়েছে!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              বন্ধ করুন
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
