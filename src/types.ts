/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentCategory =
  | 'nid'
  | 'smart_nid'
  | 'birth_cert'
  | 'passport'
  | 'driving_license'
  | 'other';

export type FieldCategory =
  | 'personal'
  | 'identity'
  | 'family'
  | 'address'
  | 'dates'
  | 'other';

export interface ExtractedField {
  id: string;
  labelBn: string;
  labelEn: string;
  value: string;
  category?: FieldCategory;
  isImportant?: boolean;
}

export interface OcrResultData {
  documentType: string;
  documentCategory: DocumentCategory;
  confidence: 'High' | 'Medium' | 'Low' | string;
  detectedLanguage: string;
  summary?: string;
  fields: ExtractedField[];
  fullText: string;
  notes?: string[];
}

export interface ExtractionHistoryItem {
  id: string;
  timestamp: number;
  documentType: string;
  documentCategory: DocumentCategory;
  thumbnail: string;
  fieldCount: number;
  data: OcrResultData;
}
