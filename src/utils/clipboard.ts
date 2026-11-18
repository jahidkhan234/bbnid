/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtractedField, OcrResultData } from '../types';

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, attempting fallback', err);
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed', err);
    return false;
  }
}

/**
 * Format all extracted fields into a clean Bengali plain-text report
 */
export function formatAllFieldsAsText(data: OcrResultData): string {
  const lines: string[] = [];
  lines.push(`=== ${data.documentType || 'ডকুমেন্ট তথ্য'} ===`);
  if (data.summary) {
    lines.push(`সারসংক্ষেপ: ${data.summary}`);
  }
  lines.push('----------------------------------------');

  data.fields.forEach((field) => {
    lines.push(`${field.labelBn} (${field.labelEn}): ${field.value || 'প্রযোজ্য নয়'}`);
  });

  lines.push('----------------------------------------');
  if (data.notes && data.notes.length > 0) {
    lines.push(`মন্তব্য: ${data.notes.join('; ')}`);
  }
  lines.push(`উৎস: বাংলা ডকুমেন্টস ওসিআর (Bangla OCR Engine)`);
  return lines.join('\n');
}

/**
 * Download text content as a file
 */
export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
