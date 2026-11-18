/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  FileCode,
  CreditCard,
  LayoutGrid,
  Info,
  CheckCircle2,
  Languages,
  Sparkles,
} from 'lucide-react';
import { ExtractedField, OcrResultData, FieldCategory } from '../types';
import { copyToClipboard, formatAllFieldsAsText, downloadTextFile } from '../utils/clipboard';
import { DigitalCardPreview } from './DigitalCardPreview';

interface ResultDisplayProps {
  originalData: OcrResultData;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalData, onReset }) => {
  // Working copy of data allowing manual user corrections
  const [data, setData] = useState<OcrResultData>(originalData);
  const [activeTab, setActiveTab] = useState<'structured' | 'card' | 'raw' | 'json'>('structured');
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);
  const [copyAllStatus, setCopyAllStatus] = useState<string | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabelBn, setNewFieldLabelBn] = useState('');
  const [newFieldLabelEn, setNewFieldLabelEn] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<FieldCategory>('personal');
  const [convertToBnDigits, setConvertToBnDigits] = useState(false);

  // Keep local data in sync if new originalData arrives
  useEffect(() => {
    setData(JSON.parse(JSON.stringify(originalData)));
  }, [originalData]);

  // Convert English digits to Bengali digits
  const toBengaliNumber = (str: string) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
  };

  const handleFieldValueChange = (id: string, newValue: string) => {
    setData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, value: newValue } : f)),
    }));
  };

  const handleFieldLabelChange = (id: string, newLabelBn: string) => {
    setData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === id ? { ...f, labelBn: newLabelBn } : f)),
    }));
  };

  const handleDeleteField = (id: string) => {
    setData((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== id),
    }));
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabelBn.trim() || !newFieldValue.trim()) return;

    const newField: ExtractedField = {
      id: `custom_${Date.now()}`,
      labelBn: newFieldLabelBn.trim(),
      labelEn: newFieldLabelEn.trim() || newFieldLabelBn.trim(),
      value: newFieldValue.trim(),
      category: newFieldCategory,
      isImportant: false,
    };

    setData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    setNewFieldLabelBn('');
    setNewFieldLabelEn('');
    setNewFieldValue('');
    setIsAddingField(false);
  };

  const handleCopySingleField = async (field: ExtractedField) => {
    const val = convertToBnDigits ? toBengaliNumber(field.value) : field.value;
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedFieldId(field.id);
      setTimeout(() => setCopiedFieldId(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const textReport = formatAllFieldsAsText(data);
    const ok = await copyToClipboard(textReport);
    if (ok) {
      setCopyAllStatus('সব তথ্য সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!');
      setTimeout(() => setCopyAllStatus(null), 3000);
    }
  };

  const handleCopyJson = async () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const ok = await copyToClipboard(jsonStr);
    if (ok) {
      setCopyAllStatus('সম্পূর্ণ JSON ডাটা ক্লিপবোর্ডে কপি করা হয়েছে!');
      setTimeout(() => setCopyAllStatus(null), 3000);
    }
  };

  const handleDownloadTxt = () => {
    const textReport = formatAllFieldsAsText(data);
    const filename = `${data.documentCategory || 'document'}_ocr_${Date.now()}.txt`;
    downloadTextFile(filename, textReport);
  };

  const handleResetToOriginal = () => {
    setData(JSON.parse(JSON.stringify(originalData)));
  };

  // Group fields by category
  const categories: { key: FieldCategory; titleBn: string; titleEn: string }[] = [
    { key: 'identity', titleBn: 'পরিচিতি ও আইডি নম্বর', titleEn: 'Identity Numbers' },
    { key: 'personal', titleBn: 'ব্যক্তিগত তথ্য', titleEn: 'Personal Information' },
    { key: 'family', titleBn: 'পারিবারিক তথ্য', titleEn: 'Family Details' },
    { key: 'dates', titleBn: 'তারিখ সংক্রান্ত', titleEn: 'Dates & Deadlines' },
    { key: 'address', titleBn: 'ঠিকানা ও স্থান', titleEn: 'Address & Location' },
    { key: 'other', titleBn: 'অন্যান্য তথ্য', titleEn: 'Other Details' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-5 sm:p-7">
      {/* Document Overview Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {data.documentType || 'শনাক্তকৃত ডকুমেন্ট'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              নির্ভুলতা: {data.confidence || 'High'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ভাষা: {data.detectedLanguage || 'বাংলা ও ইংরেজি'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {data.documentType}
          </h2>
          {data.summary && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {data.summary}
            </p>
          )}
        </div>

        {/* Primary Action Buttons (Copy All, Download, Reset) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="সব টেক্সট ক্লিপবোর্ডে কপি করুন"
          >
            <Copy className="w-4 h-4" />
            <span>সব কপি করুন (Copy All)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="টেক্সট ফাইল (.txt) ডাউনলোড করুন"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">ডাউনলোড .txt</span>
          </button>

          <button
            type="button"
            onClick={handleResetToOriginal}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="সংশোধন বাতিল করে মূল তথ্যে ফিরুন"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">রিসেট</span>
          </button>
        </div>
      </div>

      {/* Copy All Toast Feedback */}
      {copyAllStatus && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{copyAllStatus}</span>
        </div>
      )}

      {/* View Tabs & Numeral Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Segmented Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('structured')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'structured'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>কাঠামোগত তথ্য ({data.fields.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'card'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>কার্ড প্রিভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'raw'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>সম্পূর্ণ টেক্সট</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'json'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>

        {/* Bengali Number formatting toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={convertToBnDigits}
              onChange={(e) => setConvertToBnDigits(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <span>সংখ্যা বাংলায় রূপান্তর (০-৯)</span>
          </label>
        </div>
      </div>

      {/* TAB 1: STRUCTURED FIELDS */}
      {activeTab === 'structured' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              যেকোনো ফিল্ডে ক্লিক করে তথ্য সংশোধন বা পরিমার্জন করতে পারেন। এরপর পাশের কপি বাটনে ক্লিক করে কপি করুন।
            </p>
            <button
              type="button"
              onClick={() => setIsAddingField((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ফিল্ড যোগ করুন</span>
            </button>
          </div>

          {/* New Field Form (Collapsible) */}
          {isAddingField && (
            <form
              onSubmit={handleAddField}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in"
            >
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                নতুন তথ্য ফিল্ড যোগ করুন
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="লেবেল (যেমন: ভোটার এলাকা)"
                  value={newFieldLabelBn}
                  onChange={(e) => setNewFieldLabelBn(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="ইংরেজি লেবেল (ঐচ্ছিক)"
                  value={newFieldLabelEn}
                  onChange={(e) => setNewFieldLabelEn(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <select
                  value={newFieldCategory}
                  onChange={(e) => setNewFieldCategory(e.target.value as FieldCategory)}
                  className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="identity">পরিচিতি / নম্বর</option>
                  <option value="personal">ব্যক্তিগত তথ্য</option>
                  <option value="family">পারিবারিক তথ্য</option>
                  <option value="address">ঠিকানা</option>
                  <option value="dates">তারিখ</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>
              <textarea
                placeholder="ফিল্ডের মান / তথ্য (যেমন: ধানমন্ডি, ঢাকা)"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingField(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          )}

          {/* Categorized Field Cards */}
          <div className="space-y-6">
            {categories.map((cat) => {
              const categoryFields = data.fields.filter(
                (f) => (f.category || 'other') === cat.key
              );
              if (categoryFields.length === 0) return null;

              return (
                <div key={cat.key} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {cat.titleBn}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      ({cat.titleEn})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {categoryFields.map((field) => {
                      const displayVal = convertToBnDigits
                        ? toBengaliNumber(field.value)
                        : field.value;
                      const isCopied = copiedFieldId === field.id;

                      return (
                        <div
                          key={field.id}
                          className={`group rounded-xl border p-3.5 transition-all ${
                            field.isImportant
                              ? 'border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                              : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900'
                          } hover:border-emerald-400 dark:hover:border-emerald-600`}
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                {field.labelBn}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate hidden sm:inline">
                                · {field.labelEn}
                              </span>
                            </div>

                            {/* Actions: Copy & Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopySingleField(field)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-slate-700'
                                }`}
                                title="এই ফিল্ডটি কপি করুন"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>কপি হয়েছে</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>কপি</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteField(field.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="ফিল্ডটি মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Field Input / Textarea */}
                          {field.value.length > 50 || field.category === 'address' ? (
                            <textarea
                              value={displayVal}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              rows={2}
                              className="w-full text-sm font-semibold text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                            />
                          ) : (
                            <input
                              type="text"
                              value={displayVal}
                              onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                              className={`w-full text-sm font-bold text-slate-900 dark:text-white bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors ${
                                field.isImportant || field.category === 'identity'
                                  ? 'font-mono text-base tracking-wide text-emerald-800 dark:text-emerald-300'
                                  : ''
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Extraction Notes & Observation */}
          {data.notes && data.notes.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>ওসিআর পর্যবেক্ষণ ও বিশেষ নোট:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
                {data.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIGITAL CARD PREVIEW */}
      {activeTab === 'card' && (
        <div className="py-4">
          <div className="text-center mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              নিষ্কাশিত তথ্যের ভিত্তিতে তৈরি ডিজিটাল কার্ড ভিউ।
            </p>
          </div>
          <DigitalCardPreview data={data} />
        </div>
      )}

      {/* TAB 3: FULL RAW TEXT OCR */}
      {activeTab === 'raw' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ডকুমেন্টের সম্পূর্ণ অবিকৃত পাঠ্যাংশ (Unformatted Verbatim Text):
            </p>
            <button
              type="button"
              onClick={async () => {
                await copyToClipboard(data.fullText);
                setCopyAllStatus('সম্পূর্ণ টেক্সট সফলভাবে কপি হয়েছে!');
                setTimeout(() => setCopyAllStatus(null), 3000);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>টেক্সট কপি করুন</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
            {data.fullText || 'কোনো টেক্সট পাওয়া যায়নি।'}
          </div>
        </div>
      )}

      {/* TAB 4: JSON DEVELOPER VIEW */}
      {activeTab === 'json' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ডেভেলপার ও ডেটাবেজ ইন্টিগ্রেশনের জন্য স্ট্রাকচার্ড JSON:
            </p>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>JSON কপি করুন</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 shadow-inner max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
