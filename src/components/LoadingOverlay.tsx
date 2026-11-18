/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Loader2, ScanLine, FileText, CheckCircle2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const steps = [
    { titleBn: 'ছবি অপ্টিমাইজ ও ফ্রেম বিশ্লেষণ হচ্ছে...', titleEn: 'Optimizing image frame & orientation' },
    { titleBn: 'বাংলা হরফ, যুক্তাক্ষর ও সংখ্যা দ্রুত পড়া হচ্ছে...', titleEn: 'Reading Bengali ligatures & numerals' },
    { titleBn: 'আইডি নম্বর, জন্ম তারিখ ও নাম ফিল্ড রূপান্তর হচ্ছে...', titleEn: 'Extracting structured ID fields' },
    { titleBn: 'ফলাফল চূড়ান্ত করা হচ্ছে...', titleEn: 'Finalizing structured output' },
  ];

  useEffect(() => {
    if (!isLoading) {
      setStepIndex(0);
      setElapsedMs(0);
      return;
    }

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    return () => {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const seconds = (elapsedMs / 1000).toFixed(1);
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const bnSeconds = seconds.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        {/* Animated Scanner Graphic */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ScanLine className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>দ্রুত ওসিআর প্রসেস চলছে</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              ⏱️ {bnSeconds} সে.
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gemini AI মডেল দ্বারা অতি দ্রুত ছবি থেকে বাংলা হরফ ও তথ্য নিষ্কাশন হচ্ছে
          </p>
        </div>

        {/* Step Progress indicators */}
        <div className="space-y-2.5 text-left bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          {steps.map((step, idx) => {
            const isDone = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  isCurrent
                    ? 'font-bold text-emerald-700 dark:text-emerald-400 opacity-100'
                    : isDone
                    ? 'text-slate-500 dark:text-slate-400 line-through opacity-70'
                    : 'text-slate-400 dark:text-slate-600 opacity-50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                <span>{step.titleBn}</span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          সাধারণত ২-৪ সেকেন্ড সময় লাগতে পারে
        </p>
      </div>
    </div>
  );
};
