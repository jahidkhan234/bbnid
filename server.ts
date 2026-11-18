import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High limit for high-resolution ID card and document scans
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  );
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// OCR Extraction Endpoint
app.post('/api/extract-ocr', async (req, res) => {
  try {
    const rawApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    const apiKey = rawApiKey ? rawApiKey.replace(/^["']|["']$/g, '').trim() : '';

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'জেমিনি এপিআই কি (GEMINI_API_KEY) কনফিগার করা নেই। অনুগ্রহ করে Render ড্যাশবোর্ডের Environment ট্যাবে GEMINI_API_KEY যুক্ত করুন।',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg', documentTypeHint = 'auto' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'কোনো ছবি পাওয়া যায়নি। অনুগ্রহ করে একটি বৈধ আইডি কার্ড বা জন্ম সনদের ছবি আপলোড করুন। (No image data received.)',
      });
    }

    // Strip data URL scheme if present
    let rawData = imageBase64;
    let finalMimeType = mimeType;

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const headerPart = parts[0];
      rawData = parts[1];
      const match = headerPart.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+)/);
      if (match && match[1]) {
        finalMimeType = match[1];
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are a high-precision, professional OCR and document extraction engine with world-class expertise in Bengali (বাংলা) and English documents, specifically:
1. Bangladesh National ID (বাংলাদেশ জাতীয় পরিচয়পত্র - NID): both new Smart NID cards and traditional laminated cards.
2. Bangladesh Birth Registration Certificate (জন্ম নিবন্ধন সনদপত্র / জন্ম ও মৃত্যু নিবন্ধন).
3. Bangladesh Passport (বাংলাদেশ পাসপোর্ট), Driving License (ড্রাইভিং লাইসেন্স), and Other Official ID Cards.

CRITICAL OCR & BENGALI ACCURACY RULES:
- Read Bengali characters, ligatures (যুক্তাক্ষর যেমন: ক্ষ, জ্ঞ, ষ্ণ, ঙ্গ, ত্র, ক্র, ভ্র, স্ম, হ্ম ইত্যাদি), vowel signs (কার/মাত্রা: া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ), diacritics (চন্দ্রবিন্দু ঁ, হসন্ত ্, অনুস্বার ং, বিসর্গ ঃ), and punctuation (দাড়ি ।) with utmost fidelity.
- Correctly recognize Bengali numerals (০, ১, ২, ৩, ৪, ৫, ৬, ৭, ৮, ৯) as well as Latin numerals (0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Maintain the original numerals as printed on the document.
- Preserve bilingual entries (Bengali and English) accurately. Many Bangladeshi IDs print names and addresses in both Bengali and English.
- For National ID (NID / Smart Card), extract key fields:
  * নাম (বাংলা) / Name (Bengali)
  * Name (English)
  * পিতার নাম / Father's Name
  * মাতার নাম / Mother's Name
  * স্বামী/স্ত্রীর নাম / Spouse's Name (if available)
  * জন্ম তারিখ / Date of Birth
  * এনআইডি নম্বর / NID No (10-digit Smart ID or 13/17-digit NID)
  * রক্তের গ্রুপ / Blood Group
  * জন্মস্থান / Place of Birth
  * প্রদানের তারিখ / Issue Date
  * ঠিকানা / Address (Village/Road, Post Office, Postal Code, Thana/Upazila, District)
- For Birth Registration Certificate (জন্ম নিবন্ধন সনদ), extract:
  * ১৭ সংখ্যার জন্ম নিবন্ধন নম্বর / 17-digit Birth Registration Number (BRN)
  * নিবন্ধনের তারিখ / Registration Date
  * সনদ প্রদানের / ইস্যুর তারিখ / Issuance Date
  * জন্ম তারিখ / Date of Birth (both in digits and Bengali words if printed)
  * নাম (বাংলা) / Name (Bengali)
  * নাম (ইংরেজি) / Name (English)
  * লিঙ্গ / Gender (পুরুষ / Female / Other)
  * পিতার নাম (বাংলা ও ইংরেজি) / Father's Name
  * পিতার জাতীয়তা ও এনআইডি / Father's Nationality & NID
  * মাতার নাম (বাংলা ও ইংরেজি) / Mother's Name
  * মাতার জাতীয়তা ও এনআইডি / Mother's Nationality & NID
  * জন্মস্থান / Place of Birth
  * স্থায়ী ঠিকানা / Permanent Address
  * বর্তমান ঠিকানা / Present Address
  * নিবন্ধন কার্যালয় / Issuing Authority (Union Parishad / Municipality / City Corporation Ward)
- If the document is another type of ID (Passport, Driving License, Student ID, Office ID), extract all visible identity fields with appropriate labels.
- In "fullText", provide the complete raw verbatim transcription of all text detected in the document, preserving line breaks.
- Ensure all labels are clearly provided in both Bengali (labelBn) and English (labelEn).
- If any text is partially cropped or blurry, extract as much as discernible and note any uncertainty in the "notes" array.`;

    const promptText = `Please examine this document image carefully. Document hint: ${documentTypeHint}.
Perform thorough OCR extraction for all Bengali (বাংলা) and English text and structured fields.
Ensure every key field (Name in Bengali & English, Identification/Registration Number, Date of Birth, Father's Name, Mother's Name, Address, Blood Group, Dates, Issuing Office) is populated into the 'fields' list with precise Bengali labels (labelBn) and English labels (labelEn).
Also provide the complete unformatted text in 'fullText'.`;

    // Resilient model tiering: gemini-4-hydrogen first (highest capacity), then gemini-2.5-flash and gemini-3.1-flash-lite
    const candidateModels = ['gemini-4-hydrogen', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText: string | undefined;

    for (const modelName of candidateModels) {
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const config: any = {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                documentType: {
                  type: Type.STRING,
                  description: 'Recognized document type in Bengali with English name in brackets (e.g. জাতীয় পরিচয়পত্র (NID) or জন্ম নিবন্ধন সনদ (Birth Certificate))',
                },
                documentCategory: {
                  type: Type.STRING,
                  description: 'One of: nid, smart_nid, birth_cert, passport, driving_license, other',
                },
                confidence: {
                  type: Type.STRING,
                  description: 'Overall reading confidence: High, Medium, or Low',
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: 'Detected language(s), e.g. বাংলা ও ইংরেজি (Bilingual), বাংলা (Bengali), English',
                },
                summary: {
                  type: Type.STRING,
                  description: 'A 1-2 sentence Bengali summary of the document and cardholder identity',
                },
                fields: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: {
                        type: Type.STRING,
                        description: 'Machine key like full_name_bn, nid_number, dob, address',
                      },
                      labelBn: {
                        type: Type.STRING,
                        description: 'Bengali label, e.g. নাম (বাংলা), জাতীয় পরিচয়পত্র নং, জন্ম তারিখ',
                      },
                      labelEn: {
                        type: Type.STRING,
                        description: 'English label, e.g. Name (Bengali), National ID No, Date of Birth',
                      },
                      value: {
                        type: Type.STRING,
                        description: 'Extracted text value as printed on the document',
                      },
                      category: {
                        type: Type.STRING,
                        description: 'One of: personal, identity, family, address, dates, other',
                      },
                      isImportant: {
                        type: Type.BOOLEAN,
                        description: 'True if this is a primary identifying field like ID number, full name, or DOB',
                      },
                    },
                    required: ['id', 'labelBn', 'labelEn', 'value'],
                  },
                },
                fullText: {
                  type: Type.STRING,
                  description: 'Complete unformatted verbatim OCR text found on the document',
                },
                notes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Observations or notes in Bengali about image clarity, barcode, seal, or caveats',
                },
              },
              required: ['documentType', 'documentCategory', 'fields', 'fullText'],
            },
          };

          // Only Gemini 3 & 4 models support thinkingLevel
          if (modelName.startsWith('gemini-4') || modelName.startsWith('gemini-3')) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: finalMimeType,
                    data: rawData,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
            config,
          });

          responseText = response.text;
          if (responseText) {
            break; // Succeeded!
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} attempt ${attempts} failed:`, err?.message || err);
          // Wait 1.2s before retrying to let transient 503 spikes drain
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1200));
          }
        }
      }

      if (responseText) {
        break; // Successfully got response from this model
      }
    }

    if (!responseText) {
      let errMsg = lastError?.message || 'মডেল থেকে ফলাফল পাওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        errMsg = 'গুগল সার্ভারে সাময়িক ট্র্যাফিক চাপের কারণে (503 High Demand) সংযোগ ব্যাহত হয়েছে। অনুগ্রহ করে ১-২ সেকেন্ড পর আবার চেষ্টা করুন। (Google model experienced a transient 503 spike, please retry in a moment.)';
      }
      return res.status(502).json({
        success: false,
        error: `ওসিআর নিষ্কাশন সম্পন্ন করা যায়নি: ${errMsg}`,
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini OCR JSON response:', parseErr, responseText);
      return res.status(502).json({
        success: false,
        error: 'ফলাফল প্রক্রিয়াকরণে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন। (Failed to parse structured JSON from model.)',
        rawText: responseText,
      });
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error during OCR extraction:', error);
    const errorMessage = error?.message || 'একটি অজানা ত্রুটি ঘটেছে (An unexpected error occurred)';
    return res.status(500).json({
      success: false,
      error: `ওসিআর নিষ্কাশন ব্যর্থ হয়েছে: ${errorMessage}`,
      details: error?.statusText || error?.code || undefined,
    });
  }
});

// Vite / Static setup
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bangla OCR Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
