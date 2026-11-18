/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trash2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { ExtractionHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: ExtractionHistoryItem[];
  onSelectItem: (item: ExtractionHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ওসিআর এক্সট্র্যাকশন ইতিহাস
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                এই সেশনে মোট {items.length} টি ডকুমেন্ট সংরক্ষিত
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  এখনো কোনো ইতিহাস নেই
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  আইডি বা সনদের ছবি আপলোড করে এক্সট্র্যাক্ট করলে তা এখানে সংরক্ষিত থাকবে।
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all flex items-center gap-3.5 group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt="ডকুমেন্ট থাম্বনেইল"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block truncate">
                      {item.documentType}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                      {item.data.summary || `${item.fieldCount} টি ফিল্ড শনাক্ত`}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>·</span>
                      <span>{item.fieldCount} ফিল্ড</span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              ))
            )}
          </div>

          {/* Footer with Clear All */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={onClearHistory}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>সব ইতিহাস মুছে ফেলুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
