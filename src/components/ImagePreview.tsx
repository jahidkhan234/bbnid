/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  X,
  Sparkles,
  RefreshCw,
  Maximize2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { DocumentCategory } from '../types';

interface ImagePreviewProps {
  imageSrc: string;
  filename: string;
  mimeType: string;
  onExtract: (docTypeHint: DocumentCategory | 'auto') => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageSrc,
  filename,
  mimeType,
  onExtract,
  onReset,
  isLoading,
}) => {
  const [rotation, setRotation] = useState(0);
  const [docTypeHint, setDocTypeHint] = useState<DocumentCategory | 'auto'>('auto');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleExtract = () => {
    onExtract(docTypeHint);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Top Bar inside preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {filename || 'ডকুমেন্ট প্রিভিউ'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {mimeType.toUpperCase()} · ঘূর্ণন: {rotation}°
            </p>
          </div>
        </div>

        {/* Image tool buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRotate}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="ছবি ৯০° ঘোরান"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>ঘোরান (Rotate)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="পূর্ণ আকারে জুম করুন"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span>জুম</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="ছবি বাতিল করে নতুন ছবি দিন"
          >
            <X className="w-3.5 h-3.5" />
            <span>মুছুন</span>
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Dark Backdrop for High Contrast */}
      <div className="relative w-full h-72 sm:h-96 rounded-xl bg-slate-900/95 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800/60 p-4">
        <div
          className="relative max-w-full max-h-full transition-transform duration-300 ease-out flex items-center justify-center cursor-pointer"
          onClick={() => setIsModalOpen(true)}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
          title="বড় করে দেখতে ক্লিক করুন"
        >
          <img
            src={imageSrc}
            alt="আইডি কার্ড বা সনদের প্রিভিউ"
            className="max-h-64 sm:max-h-88 max-w-full object-contain rounded-lg shadow-lg shadow-black/40"
          />
        </div>

        {/* Watermark badge on bottom left of viewport */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-slate-300 font-mono">
          প্রিভিউ মোড · ক্লিক করে বড় করুন
        </div>
      </div>

      {/* Configuration & Action Area */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label
              htmlFor="doc-type-select"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1"
            >
              ডকুমেন্টের ধরন (ঐচ্ছিক নির্বাচন)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সঠিক ধরন বেছে দিলে ওসিআর অ্যালগরিদম আরও দ্রুত ও নিখুঁতভাবে ফিল্ড শনাক্ত করতে পারে
            </p>
          </div>

          <select
            id="doc-type-select"
            value={docTypeHint}
            onChange={(e) => setDocTypeHint(e.target.value as any)}
            disabled={isLoading}
            className="px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0"
          >
            <option value="auto">স্বয়ংক্রিয় সনাক্তকরণ (Auto Detect)</option>
            <option value="smart_nid">স্মার্ট জাতীয় পরিচয়পত্র (Smart NID)</option>
            <option value="birth_cert">জন্ম নিবন্ধন সনদ (Birth Certificate)</option>
            <option value="nid">পুরাতন জাতীয় পরিচয়পত্র (Laminated NID)</option>
            <option value="passport">বাংলাদেশ পাসপোর্ট (Passport)</option>
            <option value="driving_license">ড্রাইভিং লাইসেন্স (Driving License)</option>
            <option value="other">অন্যান্য পরিচয়পত্র (Other Document)</option>
          </select>
        </div>

        {/* Extract OCR Trigger Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            মডেল: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Gemini 4 Hydrogen (বাংলা ভার্সন)</span>
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 disabled:opacity-60 shadow-sm shadow-emerald-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>টেক্সট ও ফিল্ড নিষ্কাশন হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ওসিআর দিয়ে তথ্য নিষ্কাশন করুন (Extract OCR)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col border border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 text-white">
              <span className="text-sm font-semibold truncate">{filename} (জুম মোড)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                  title="ঘোরান"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setZoomLevel(1);
                  }}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 ml-3"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Body with scroll & zoom */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[50vh]">
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
              >
                <img
                  src={imageSrc}
                  alt="জুম প্রিভিউ"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
