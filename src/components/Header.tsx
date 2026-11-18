/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, History, Server, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenServerSettings: () => void;
  historyCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenServerSettings,
  historyCount,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single line, single element) */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                বাংলা ডকুমেন্টস ওসিআর
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-tight leading-none hidden sm:block">
              NID & Birth Certificate Bengali OCR
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, subtle hover) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#uploader-section"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            ফাইল আপলোড
          </a>
          <a
            href="#demo-section"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            নমুনা ডকুমেন্টস
          </a>
          <a
            href="#guide-section"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            সহায়িকা ও নিয়ম
          </a>
        </nav>

        {/* Zone 3: Primary Actions (Single-line controls) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenServerSettings}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="সার্ভার এপিআই সেটিংস (GitHub Pages সংযোগ)"
          >
            <Server className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="পূর্ববর্তী এক্সট্র্যাকশন ইতিহাস"
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ইতিহাস</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 text-[11px] font-bold rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono tabular-nums">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
