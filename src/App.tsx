/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { OcrResultData, ExtractionHistoryItem, DocumentCategory } from './types';
import { SampleDoc } from './utils/sampleData';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Zap,
  Camera,
  FolderOpen,
  Eye,
  Lock,
} from 'lucide-react';

export default function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [currentMimeType, setCurrentMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResultData | null>(null);
  const [history, setHistory] = useState<ExtractionHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [autoExtractEnabled, setAutoExtractEnabled] = useState<boolean>(true);
  const [lastDurationMs, setLastDurationMs] = useState<number | null>(null);

  // Load history & preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bangla_ocr_history_v1');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
      const storedPref = localStorage.getItem('bangla_ocr_auto_extract');
      if (storedPref !== null) {
        setAutoExtractEnabled(storedPref === 'true');
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  const saveHistory = (newItems: ExtractionHistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem('bangla_ocr_history_v1', JSON.stringify(newItems));
    } catch (e) {
      console.warn('Could not write history to localStorage', e);
    }
  };

  const handleToggleAutoExtract = (enabled: boolean) => {
    setAutoExtractEnabled(enabled);
    try {
      localStorage.setItem('bangla_ocr_auto_extract', String(enabled));
    } catch (e) {
      console.warn('Could not save preference', e);
    }
  };

  const executeExtraction = async (
    imageData: string,
    mimeType: string,
    docTypeHint: DocumentCategory | 'auto' = 'auto'
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/extract-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageData,
          mimeType: mimeType,
          documentTypeHint: docTypeHint,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(
          resJson?.error || 'ওসিআর প্রক্রিয়া সম্পন্ন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        );
      }

      const extractedData: OcrResultData = resJson.data;
      const duration = Date.now() - startTime;
      setLastDurationMs(duration);
      setOcrResult(extractedData);

      // Prepend to history
      const historyItem: ExtractionHistoryItem = {
        id: `ocr_${Date.now()}`,
        timestamp: Date.now(),
        documentType: extractedData.documentType,
        documentCategory: extractedData.documentCategory,
        thumbnail: imageData,
        fieldCount: extractedData.fields.length,
        data: extractedData,
      };

      const updatedHistory = [historyItem, ...history.slice(0, 19)];
      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setErrorMessage(
        err?.message || 'ছবিটি পাঠ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ছবিটি পরিষ্কার কি না যাচাই করুন।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (
    base64: string,
    mimeType: string,
    filename: string,
    autoExtract = true
  ) => {
    setCurrentImage(base64);
    setCurrentMimeType(mimeType);
    setCurrentFilename(filename);
    setErrorMessage(null);
    setOcrResult(null);

    // If autoExtract is enabled, run immediately without forcing user to click Extract!
    if (autoExtract) {
      executeExtraction(base64, mimeType, 'auto');
    }
  };

  const handleSampleSelected = async (sample: SampleDoc, autoExtract = true) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const base64 = await sample.generateImage();
      setCurrentImage(base64);
      setCurrentMimeType('image/png');
      setCurrentFilename(`${sample.id}.png`);
      setOcrResult(null);

      if (autoExtract) {
        executeExtraction(base64, 'image/png', sample.category);
      }
    } catch (err: any) {
      setErrorMessage('নমুনা ডকুমেন্ট লোড করতে সমস্যা হয়েছে: ' + (err?.message || 'অজানা ত্রুটি'));
      setIsLoading(false);
    }
  };

  const handleManualExtract = (docTypeHint: DocumentCategory | 'auto') => {
    if (currentImage) {
      executeExtraction(currentImage, currentMimeType, docTypeHint);
    }
  };

  const handleReset = () => {
    setCurrentImage(null);
    setCurrentFilename('');
    setOcrResult(null);
    setErrorMessage(null);
    setLastDurationMs(null);
  };

  const handleHistorySelect = (item: ExtractionHistoryItem) => {
    setCurrentImage(item.thumbnail);
    setCurrentFilename(`${item.documentCategory}_archived.png`);
    setCurrentMimeType('image/png');
    setOcrResult(item.data);
    setErrorMessage(null);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const formatBnDuration = (ms: number) => {
    const sec = (ms / 1000).toFixed(1);
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return sec.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onReset={handleReset}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner Header */}
        {!currentImage && !ocrResult && (
          <div className="text-center max-w-2xl mx-auto space-y-3 pt-2 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>তাৎক্ষণিক ক্যামেরা ও গ্যালারি ওসিআর (Instant Vision)</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
              জাতীয় পরিচয়পত্র ও জন্ম নিবন্ধন তাৎক্ষণিক ওসিআর
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              সরাসরি ক্যামেরা দিয়ে ছবি তুলুন বা গ্যালারি থেকে ছবি দিন—দেওয়া মাত্রই ২ সেকেন্ডে বাংলা ও ইংরেজি নাম, আইডি নম্বর, জন্ম তারিখ এবং ঠিকানাসহ সকল ফিল্ড নির্ভুলভাবে চলে আসবে।
            </p>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-bold">সমস্যা পরিলক্ষিত হয়েছে</h4>
              <p className="text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1 text-xs font-semibold bg-white dark:bg-red-900/50 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200"
            >
              বাতিল
            </button>
          </div>
        )}

        {/* Stage 1: Upload Area (shown if no image is uploaded yet) */}
        {!currentImage && (
          <ImageUploader
            onImageSelected={handleImageSelected}
            onSampleSelected={handleSampleSelected}
            isLoading={isLoading}
            autoExtractEnabled={autoExtractEnabled}
            onToggleAutoExtract={handleToggleAutoExtract}
          />
        )}

        {/* Stage 2 & 3: Image Preview & Results (shown when image is selected) */}
        {currentImage && (
          <div className="space-y-6">
            {/* Quick action bar to take another photo or replace */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentFilename || 'আইডি কার্ড / জন্ম সনদ'}
                </span>
                {lastDurationMs && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                    ⏱️ {formatBnDuration(lastDurationMs)} সেকেন্ডে সম্পন্ন
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>নতুন ছবি তুলুন / বদলান</span>
                </button>
              </div>
            </div>

            <ImagePreview
              imageSrc={currentImage}
              filename={currentFilename}
              mimeType={currentMimeType}
              onExtract={handleManualExtract}
              onReset={handleReset}
              isLoading={isLoading}
            />

            {/* Extracted OCR Results Display */}
            {ocrResult && (
              <ResultDisplay
                originalData={ocrResult}
                onReset={handleReset}
              />
            )}
          </div>
        )}

        {/* Help & User Guide Section */}
        <section id="guide-section" className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                দ্রুত ও নিখুঁত ওসিআর পাওয়ার নিয়মাবলী
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>১-ট্যাপ তাৎক্ষণিক প্রসেসিং</span>
                </div>
                <p className="leading-relaxed">
                  ক্যামেরা দিয়ে ছবি তোলা মাত্রই ছবি স্বয়ংক্রিয়ভাবে কম্প্রেস হয়ে দ্রুত সার্ভারে পাঠানো হয়, ফলে ১-২ সেকেন্ডেই সম্পূর্ণ বাংলা টেক্সট বের হয়ে আসে।
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>সোজা অ্যাঙ্গেল ও আলোর ঝলকানি পরিহার</span>
                </div>
                <p className="leading-relaxed">
                  সোজা করে ছবি তুলুন। ল্যামিনেশন প্লাস্টিকের ওপর ফ্ল্যাশ বা টিউবলাইটের অতিরিক্ত আলো সরাসরি পড়লে অক্ষর অস্পষ্ট হতে পারে, তাই সাধারণ দিনের আলোতে ছবি তুললে শতভাগ নিখুঁত ফলাফল পাবেন।
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>গোপনীয়তা ও ডেটা সুরক্ষা</span>
                </div>
                <p className="leading-relaxed">
                  ছবি শুধুমাত্র ওসিআর নিষ্কাশনের জন্য প্রসেস হয় এবং কোনো ডাটাবেজে স্থায়ীভাবে সংরক্ষণ করা হয় না। আপনার তথ্য সম্পূর্ণ ব্যক্তিগত ও নিরাপদ।
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 বাংলা ডকুমেন্টস ও আইডি ওসিআর ইঞ্জিন · দ্রুত ও স্বয়ংক্রিয় প্রসেসিং</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
            <span>Ultra Fast Gemini Vision</span>
            <span>·</span>
            <span>Auto Extract</span>
            <span>·</span>
            <span>Bangla Script OCR</span>
          </div>
        </div>
      </footer>

      {/* Loading Overlay Modal */}
      <LoadingOverlay isLoading={isLoading} />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onSelectItem={handleHistorySelect}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
