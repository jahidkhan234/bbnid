/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OcrResultData } from '../types';
import { ShieldCheck, Award, QrCode } from 'lucide-react';

interface DigitalCardPreviewProps {
  data: OcrResultData;
}

export const DigitalCardPreview: React.FC<DigitalCardPreviewProps> = ({ data }) => {
  const getFieldVal = (ids: string[], fallback = '—') => {
    for (const id of ids) {
      const match = data.fields.find(
        (f) =>
          f.id.toLowerCase().includes(id.toLowerCase()) ||
          f.labelBn.toLowerCase().includes(id.toLowerCase()) ||
          f.labelEn.toLowerCase().includes(id.toLowerCase())
      );
      if (match && match.value) return match.value;
    }
    return fallback;
  };

  const isBirthCert =
    data.documentCategory === 'birth_cert' ||
    data.documentType.toLowerCase().includes('birth') ||
    data.documentType.toLowerCase().includes('জন্ম');

  if (isBirthCert) {
    return (
      <div className="max-w-2xl mx-auto bg-[#fffdf5] text-slate-800 p-6 sm:p-8 rounded-xl border-4 border-emerald-800 shadow-md font-sans text-sm relative">
        {/* Decorative inner border */}
        <div className="border border-dashed border-emerald-700/60 p-4 sm:p-6 rounded-lg space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-emerald-800 text-white mx-auto flex items-center justify-center font-bold text-xs shadow-inner">
              <span className="text-red-500 text-lg">★</span>
            </div>
            <h3 className="text-lg font-bold text-emerald-900 tracking-tight">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </h3>
            <p className="text-xs font-semibold text-emerald-800">
              স্থানীয় সরকার বিভাগ / জন্ম ও মৃত্যু নিবন্ধন কার্যালয়
            </p>
            <div className="inline-block px-4 py-1 bg-emerald-100/80 rounded border border-emerald-300 text-emerald-900 font-bold text-xs mt-1">
              জন্ম নিবন্ধন সনদপত্র / BIRTH REGISTRATION CERTIFICATE
            </div>
          </div>

          {/* BRN Number Box */}
          <div className="bg-emerald-50 border border-emerald-500/70 rounded-lg p-2.5 text-center my-3">
            <div className="text-[11px] font-semibold text-emerald-800">
              জন্ম নিবন্ধন নম্বর (BRN)
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-wider">
              {getFieldVal(['brn', 'registration_no', 'নম্বর'], '1995 2692 0150 12345')}
            </div>
          </div>

          {/* Structured Table */}
          <div className="divide-y divide-emerald-200/60 text-xs sm:text-sm">
            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">নাম (বাংলা ও ইংরেজি):</span>
              <span className="col-span-2 font-bold text-slate-900">
                {getFieldVal(['name_bn', 'নাম', 'name'], '—')}
                {getFieldVal(['name_en'], '') && (
                  <span className="block text-xs font-normal text-slate-600">
                    {getFieldVal(['name_en'])}
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">জন্ম তারিখ (DOB):</span>
              <span className="col-span-2 font-semibold text-slate-900">
                {getFieldVal(['dob', 'জন্ম তারিখ', 'birth'], '—')}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">লিঙ্গ (Gender):</span>
              <span className="col-span-2 text-slate-900">
                {getFieldVal(['gender', 'লিঙ্গ'], '—')}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">পিতার নাম:</span>
              <span className="col-span-2 text-slate-900 font-medium">
                {getFieldVal(['father', 'পিতা'], '—')}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">মাতার নাম:</span>
              <span className="col-span-2 text-slate-900 font-medium">
                {getFieldVal(['mother', 'মাতা'], '—')}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">স্থায়ী ঠিকানা:</span>
              <span className="col-span-2 text-slate-900 leading-snug">
                {getFieldVal(['permanent_address', 'address', 'ঠিকানা'], '—')}
              </span>
            </div>

            <div className="grid grid-cols-3 py-1.5">
              <span className="text-slate-600 font-medium">নিবন্ধন কার্যালয়:</span>
              <span className="col-span-2 text-slate-900">
                {getFieldVal(['office', 'issuing', 'কার্যালয়'], 'ইউনিয়ন পরিষদ / পৌরসভা')}
              </span>
            </div>
          </div>

          {/* Footer Seals */}
          <div className="pt-4 flex justify-between items-end text-[11px] text-slate-500 border-t border-emerald-200">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-8 h-8 text-slate-700" />
              <span>ডিজিটাল ভেরিফিকেশন কোড</span>
            </div>
            <div className="text-right">
              <div className="font-serif italic font-bold text-slate-700">স্বাক্ষরিত</div>
              <div className="border-t border-slate-400 pt-0.5 font-semibold text-emerald-900">
                নিবন্ধক কর্মকর্তা
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Smart Card / NID Card Replica
  return (
    <div className="max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 relative">
      {/* Top Green Ribbon */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 py-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-yellow-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            ★
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h4>
            <p className="text-[10px] text-emerald-100 font-medium tracking-wide font-sans">
              Government of the People's Republic of Bangladesh
            </p>
          </div>
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-200">
          NATIONAL ID CARD
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Section with Gold Chip */}
        <div className="flex items-center justify-between">
          {/* Smart Chip representation */}
          <div className="w-12 h-9 rounded bg-amber-400 border border-amber-600 flex flex-col justify-around p-1 shadow-xs">
            <div className="h-0.5 bg-amber-700 rounded-full"></div>
            <div className="h-0.5 bg-amber-700 rounded-full"></div>
            <div className="h-0.5 bg-amber-700 rounded-full"></div>
          </div>

          <div className="text-xs font-bold text-emerald-800">
            জাতীয় পরিচয়পত্র
          </div>
        </div>

        {/* Content Split: Left Photo Dummy, Right Information */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="sm:col-span-1 flex flex-col items-center">
            <div className="w-24 h-28 rounded-lg bg-slate-200 border-2 border-slate-400 flex flex-col items-center justify-center text-slate-500 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600">ছবি (Photo)</span>
            </div>
            <div className="text-[10px] font-mono text-red-600 font-bold mt-1.5">
              Blood: {getFieldVal(['blood', 'রক্ত'], 'N/A')}
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 font-medium">নাম: </span>
              <span className="font-bold text-slate-900 text-base">
                {getFieldVal(['name_bn', 'নাম'], '—')}
              </span>
            </div>

            {getFieldVal(['name_en'], '') && (
              <div>
                <span className="text-slate-500 font-medium">Name: </span>
                <span className="font-semibold text-slate-800 tracking-wide font-sans">
                  {getFieldVal(['name_en'])}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-500 font-medium">পিতা: </span>
              <span className="text-slate-800 font-medium">
                {getFieldVal(['father', 'পিতা'], '—')}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium">মাতা: </span>
              <span className="text-slate-800 font-medium">
                {getFieldVal(['mother', 'মাতা'], '—')}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Date of Birth: </span>
              <span className="font-bold text-slate-900 font-mono">
                {getFieldVal(['dob', 'জন্ম'], '—')}
              </span>
            </div>
          </div>
        </div>

        {/* Prominent NID Number Banner */}
        <div className="bg-white rounded-xl border-2 border-emerald-600/70 p-2.5 sm:p-3 text-center shadow-xs">
          <div className="text-[10px] font-bold text-emerald-800 tracking-wider">
            NID NO / জাতীয় পরিচয়পত্র নম্বর
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-slate-900 mt-0.5">
            {getFieldVal(['nid', 'id_no', 'নম্বর'], '—')}
          </div>
        </div>
      </div>
    </div>
  );
};
