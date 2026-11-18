/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OcrResultData } from '../types';

export interface SampleDoc {
  id: string;
  titleBn: string;
  titleEn: string;
  category: 'smart_nid' | 'birth_cert' | 'nid';
  descriptionBn: string;
  generateImage: () => Promise<string>;
  presetData: OcrResultData;
}

/**
 * Render an SVG to a canvas and return a base64 PNG data URL
 */
function svgToDataUrl(svgString: string, width = 1000, height = 630): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString));
    };

    img.src = url;
  });
}

/**
 * Generate Smart NID Card Sample Image
 */
export async function generateSmartNidImage(): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 630" width="1000" height="630">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="50%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="flagGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#006a4e"/>
        <stop offset="100%" stop-color="#00503b"/>
      </linearGradient>
    </defs>
    <!-- Background Card Frame -->
    <rect x="15" y="15" width="970" height="600" rx="28" fill="url(#cardBg)" stroke="#cbd5e1" stroke-width="4"/>
    
    <!-- Top Green Header Ribbon -->
    <path d="M 15 43 Q 15 15 43 15 L 957 15 Q 985 15 985 43 L 985 110 L 15 110 Z" fill="url(#flagGreen)"/>
    
    <!-- National Seal Emblem -->
    <circle cx="95" cy="62" r="34" fill="#ffffff" stroke="#f59e0b" stroke-width="3"/>
    <circle cx="95" cy="62" r="26" fill="#f43f5e"/>
    <polygon points="95,44 102,59 118,59 105,69 110,84 95,74 80,84 85,69 72,59 88,59" fill="#fde047"/>

    <!-- Header Text in Bengali and English -->
    <text x="500" y="55" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
    <text x="500" y="88" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="19" font-weight="600" fill="#fef08a" text-anchor="middle" letter-spacing="1">Government of the People's Republic of Bangladesh</text>
    
    <!-- Sub-header -->
    <text x="500" y="145" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="22" font-weight="bold" fill="#006a4e" text-anchor="middle">জাতীয় পরিচয়পত্র / National ID Card</text>
    
    <!-- Chip Icon (Smart Card Gold Chip) -->
    <rect x="75" y="175" width="95" height="75" rx="10" fill="#facc15" stroke="#ca8a04" stroke-width="2.5"/>
    <line x1="75" y1="212" x2="170" y2="212" stroke="#a16207" stroke-width="2"/>
    <line x1="122" y1="175" x2="122" y2="250" stroke="#a16207" stroke-width="2"/>
    <rect x="95" y="195" width="55" height="35" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>

    <!-- Photo Placeholder Frame -->
    <rect x="70" y="275" width="200" height="250" rx="14" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>
    <!-- Stylized Silhouette Face -->
    <circle cx="170" cy="360" r="48" fill="#64748b"/>
    <path d="M 105 485 C 105 425 235 425 235 485 Z" fill="#64748b"/>

    <!-- Card Fields with Crisp Bengali and English Text -->
    <g transform="translate(300, 195)" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif">
      <!-- Name (Bengali) -->
      <text x="0" y="25" font-size="20" font-weight="600" fill="#475569">নাম:</text>
      <text x="85" y="25" font-size="24" font-weight="bold" fill="#0f172a">মোঃ রফিকুল ইসলাম</text>
      
      <!-- Name (English) -->
      <text x="0" y="65" font-size="18" font-weight="600" fill="#475569">Name:</text>
      <text x="85" y="65" font-size="22" font-weight="600" fill="#0f172a">MD RAFIQUL ISLAM</text>

      <!-- Father's Name -->
      <text x="0" y="110" font-size="19" font-weight="600" fill="#475569">পিতা:</text>
      <text x="85" y="110" font-size="21" font-weight="600" fill="#1e293b">মোঃ আব্দুল করিম</text>

      <!-- Mother's Name -->
      <text x="0" y="155" font-size="19" font-weight="600" fill="#475569">মাতা:</text>
      <text x="85" y="155" font-size="21" font-weight="600" fill="#1e293b">মোসাম্মৎ খাদিজা বেগম</text>

      <!-- Date of Birth -->
      <text x="0" y="200" font-size="19" font-weight="600" fill="#475569">Date of Birth:</text>
      <text x="140" y="200" font-size="22" font-weight="bold" fill="#0f172a">12 Mar 1988</text>

      <!-- NID Number (Prominent Box) -->
      <rect x="0" y="235" width="630" height="75" rx="12" fill="#f8fafc" stroke="#006a4e" stroke-width="2.5"/>
      <text x="25" y="280" font-size="20" font-weight="bold" fill="#006a4e">NID NO:</text>
      <text x="135" y="282" font-family="'JetBrains Mono', monospace" font-size="34" font-weight="bold" fill="#0f172a" letter-spacing="4">782 459 3012</text>
    </g>

    <!-- Bottom Bar with Signature and Blood Group -->
    <g transform="translate(300, 520)">
      <text x="0" y="30" font-size="16" font-family="'Hind Siliguri', sans-serif" fill="#64748b">রক্তের গ্রুপ / Blood Group:</text>
      <text x="180" y="30" font-size="20" font-weight="bold" fill="#dc2626" font-family="'Plus Jakarta Sans', sans-serif">B+ (ve)</text>

      <text x="360" y="30" font-size="16" font-family="'Hind Siliguri', sans-serif" fill="#64748b">স্বাক্ষর / Signature:</text>
      <!-- Stylized signature line -->
      <path d="M 490 25 Q 520 10 540 28 T 580 15 T 620 22" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    </g>
  </svg>`;

  return svgToDataUrl(svg, 1000, 630);
}

/**
 * Generate Birth Certificate Sample Image
 */
export async function generateBirthCertificateImage(): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200">
    <defs>
      <linearGradient id="paperBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="100%" stop-color="#fef3c7"/>
      </linearGradient>
    </defs>
    <!-- Certificate Border with Dual Frames -->
    <rect x="20" y="20" width="860" height="1160" rx="12" fill="#fffef7" stroke="#065f46" stroke-width="6"/>
    <rect x="35" y="35" width="830" height="1130" rx="8" fill="none" stroke="#047857" stroke-width="2" stroke-dasharray="8,4"/>

    <!-- National Emblem Watermark / Seal -->
    <circle cx="450" cy="120" r="45" fill="#fef2f2" stroke="#dc2626" stroke-width="3"/>
    <circle cx="450" cy="120" r="35" fill="#15803d"/>
    <circle cx="450" cy="120" r="14" fill="#dc2626"/>

    <!-- Header Text -->
    <text x="450" y="200" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="26" font-weight="bold" fill="#065f46" text-anchor="middle">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
    <text x="450" y="235" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="20" font-weight="600" fill="#047857" text-anchor="middle">স্থানীয় সরকার বিভাগ / জন্ম ও মৃত্যু নিবন্ধন কার্যালয়</text>
    <text x="450" y="265" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="18" fill="#334155" text-anchor="middle">সখিপুর ইউনিয়ন পরিষদ, ভেদরগঞ্জ, শরীয়তপুর</text>

    <!-- Certificate Title -->
    <rect x="220" y="290" width="460" height="48" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
    <text x="450" y="323" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="23" font-weight="bold" fill="#065f46" text-anchor="middle">জন্ম নিবন্ধন সনদপত্র</text>
    <text x="450" y="360" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" fill="#475569" text-anchor="middle" letter-spacing="1">BIRTH REGISTRATION CERTIFICATE</text>

    <!-- Top Metadata Grid (Registration & Issue Date) -->
    <g transform="translate(60, 395)" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="16">
      <text x="0" y="0" fill="#475569">নিবন্ধনের তারিখ: <tspan font-weight="bold" fill="#0f172a">০৫-০২-২০০৫</tspan></text>
      <text x="0" y="22" font-size="13" fill="#64748b">Date of Registration: 05/02/2005</text>

      <text x="520" y="0" fill="#475569">সনদ ইস্যুর তারিখ: <tspan font-weight="bold" fill="#0f172a">১০-০২-২০০৫</tspan></text>
      <text x="520" y="22" font-size="13" fill="#64748b">Date of Issuance: 10/02/2005</text>
    </g>

    <!-- 17-digit Birth Registration Number Box -->
    <rect x="60" y="445" width="780" height="70" rx="10" fill="#f0fdf4" stroke="#059669" stroke-width="2.5"/>
    <text x="85" y="488" font-family="'Hind Siliguri', sans-serif" font-size="19" font-weight="bold" fill="#065f46">জন্ম নিবন্ধন নম্বর:</text>
    <text x="250" y="492" font-family="'JetBrains Mono', monospace" font-size="30" font-weight="bold" fill="#0f172a" letter-spacing="3">1995 2692 0150 12345</text>

    <!-- Detailed Form Fields -->
    <g transform="translate(60, 560)" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif">
      <!-- Name (Bengali & English) -->
      <line x1="0" y1="0" x2="780" y2="0" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="32" font-size="18" fill="#475569">নাম (বাংলা):</text>
      <text x="190" y="32" font-size="22" font-weight="bold" fill="#0f172a">তানিয়া আক্তার</text>
      
      <text x="15" y="72" font-size="17" fill="#475569">Name (English):</text>
      <text x="190" y="72" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="600" fill="#0f172a">TANIA AKTER</text>

      <!-- Date of Birth -->
      <line x1="0" y1="95" x2="780" y2="95" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="125" font-size="18" fill="#475569">জন্ম তারিখ:</text>
      <text x="190" y="125" font-size="20" font-weight="bold" fill="#065f46">১৫-০৮-১৯৯৫</text>
      <text x="320" y="125" font-size="16" fill="#475569">(পনেরই আগস্ট উনিশশত পঁচানব্বই)</text>
      <text x="190" y="152" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" fill="#64748b">15th August 1995</text>

      <!-- Gender -->
      <text x="560" y="125" font-size="18" fill="#475569">লিঙ্গ:</text>
      <text x="615" y="125" font-size="19" font-weight="bold" fill="#0f172a">মহিলা (Female)</text>

      <!-- Father Details -->
      <line x1="0" y1="175" x2="780" y2="175" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="205" font-size="18" fill="#475569">পিতার নাম:</text>
      <text x="190" y="205" font-size="20" font-weight="600" fill="#0f172a">আবুল হোসেন (ABUL HOSSAIN)</text>
      <text x="560" y="205" font-size="16" fill="#475569">জাতীয়তা: <tspan font-weight="bold" fill="#0f172a">বাংলাদেশী</tspan></text>

      <!-- Mother Details -->
      <line x1="0" y1="230" x2="780" y2="230" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="260" font-size="18" fill="#475569">মাতার নাম:</text>
      <text x="190" y="260" font-size="20" font-weight="600" fill="#0f172a">রাশিদা পারভীন (RASHIDA PARVIN)</text>
      <text x="560" y="260" font-size="16" fill="#475569">জাতীয়তা: <tspan font-weight="bold" fill="#0f172a">বাংলাদেশী</tspan></text>

      <!-- Birth Place -->
      <line x1="0" y1="285" x2="780" y2="285" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="315" font-size="18" fill="#475569">জন্মস্থান:</text>
      <text x="190" y="315" font-size="19" font-weight="500" fill="#0f172a">গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর</text>

      <!-- Permanent Address -->
      <line x1="0" y1="345" x2="780" y2="345" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="15" y="375" font-size="18" fill="#475569">স্থায়ী ঠিকানা:</text>
      <text x="190" y="375" font-size="19" font-weight="500" fill="#0f172a">গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর</text>
    </g>

    <!-- Signatures and QR Code representation -->
    <g transform="translate(60, 1020)" font-family="'Hind Siliguri', sans-serif">
      <!-- QR mock -->
      <rect x="0" y="0" width="90" height="90" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <rect x="15" y="15" width="25" height="25" fill="#0f172a"/>
      <rect x="50" y="15" width="25" height="25" fill="#0f172a"/>
      <rect x="15" y="50" width="25" height="25" fill="#0f172a"/>
      <rect x="52" y="52" width="20" height="20" fill="#0f172a"/>

      <!-- Officer 1 -->
      <g transform="translate(260, 45)">
        <path d="M 0 0 Q 30 -25 70 5 T 120 -10" fill="none" stroke="#1e293b" stroke-width="2"/>
        <line x1="0" y1="15" x2="160" y2="15" stroke="#64748b" stroke-width="1"/>
        <text x="80" y="32" font-size="14" fill="#64748b" text-anchor="middle">প্রস্তুতকারীর স্বাক্ষর ও সীল</text>
      </g>

      <!-- Registrar -->
      <g transform="translate(560, 45)">
        <path d="M 0 0 Q 40 -30 90 10 T 140 -5" fill="none" stroke="#047857" stroke-width="2.5"/>
        <line x1="0" y1="15" x2="180" y2="15" stroke="#64748b" stroke-width="1"/>
        <text x="90" y="32" font-size="14" font-weight="600" fill="#047857" text-anchor="middle">নিবন্ধক এর স্বাক্ষর ও অফিসিয়াল সীল</text>
      </g>
    </g>
  </svg>`;

  return svgToDataUrl(svg, 900, 1200);
}

/**
 * Traditional Laminated NID Card Sample Image
 */
export async function generateOldNidImage(): Promise<string> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 630" width="1000" height="630">
    <defs>
      <linearGradient id="nidBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdfbf7"/>
        <stop offset="100%" stop-color="#f5efe6"/>
      </linearGradient>
    </defs>
    <!-- Background Frame with lamination edge -->
    <rect x="10" y="10" width="980" height="610" rx="16" fill="#fefae0" stroke="#a3e635" stroke-width="5" opacity="0.8"/>
    <rect x="25" y="25" width="950" height="580" rx="12" fill="url(#nidBg)" stroke="#bbf7d0" stroke-width="2"/>

    <!-- Header Seal and Text -->
    <circle cx="110" cy="85" r="38" fill="#15803d" stroke="#dc2626" stroke-width="3"/>
    <circle cx="110" cy="85" r="22" fill="#dc2626"/>

    <text x="520" y="70" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="28" font-weight="bold" fill="#166534" text-anchor="middle">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
    <text x="520" y="102" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="17" font-weight="600" fill="#334155" text-anchor="middle">Government of the People's Republic of Bangladesh</text>
    <text x="520" y="135" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif" font-size="22" font-weight="bold" fill="#dc2626" text-anchor="middle">জাতীয় পরিচয়পত্র</text>

    <!-- Photo Placeholder Frame -->
    <rect x="75" y="165" width="200" height="250" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2.5"/>
    <circle cx="175" cy="250" r="45" fill="#475569"/>
    <path d="M 110 380 C 110 320 240 320 240 380 Z" fill="#475569"/>

    <!-- Fields in Bengali and English -->
    <g transform="translate(315, 175)" font-family="'Hind Siliguri', 'Noto Sans Bengali', Arial, sans-serif">
      <text x="0" y="25" font-size="20" font-weight="600" fill="#475569">নাম:</text>
      <text x="90" y="25" font-size="24" font-weight="bold" fill="#0f172a">বেগম সালমা খাতুন</text>

      <text x="0" y="65" font-size="18" font-weight="600" fill="#475569">Name:</text>
      <text x="90" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="600" fill="#0f172a">BEGUM SALMA KHATUN</text>

      <text x="0" y="110" font-size="19" font-weight="600" fill="#475569">পিতা:</text>
      <text x="90" y="110" font-size="21" font-weight="600" fill="#1e293b">মোজাম্মেল হক</text>

      <text x="0" y="155" font-size="19" font-weight="600" fill="#475569">মাতা:</text>
      <text x="90" y="155" font-size="21" font-weight="600" fill="#1e293b">মরিয়ম বেগম</text>

      <text x="0" y="200" font-size="19" font-weight="600" fill="#475569">Date of Birth:</text>
      <text x="140" y="200" font-size="22" font-weight="bold" fill="#0f172a">04 Nov 1982</text>

      <!-- 13 or 17 digit NID Number -->
      <rect x="0" y="240" width="610" height="70" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <text x="25" y="284" font-size="20" font-weight="bold" fill="#166534">ID NO:</text>
      <text x="110" y="286" font-family="'JetBrains Mono', monospace" font-size="30" font-weight="bold" fill="#0f172a" letter-spacing="3">1982 2692 0150 00192</text>
    </g>

    <!-- Bottom Signature -->
    <g transform="translate(315, 520)" font-family="'Hind Siliguri', sans-serif">
      <text x="0" y="25" font-size="16" fill="#64748b">স্বাক্ষর / Signature:</text>
      <path d="M 130 20 Q 160 5 190 25 T 240 10 T 280 20" fill="none" stroke="#0f172a" stroke-width="2.5"/>
    </g>
  </svg>`;

  return svgToDataUrl(svg, 1000, 630);
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample_smart_nid',
    titleBn: 'স্মার্ট জাতীয় পরিচয়পত্র (Smart NID)',
    titleEn: 'Smart National ID Card',
    category: 'smart_nid',
    descriptionBn: '১০ ডিজিটের স্মার্ট এনআইডি কার্ডের নমুনা ছবি (নাম, পিতা, মাতা, জন্ম তারিখ, রক্তের গ্রুপ)',
    generateImage: generateSmartNidImage,
    presetData: {
      documentType: 'জাতীয় পরিচয়পত্র (Smart NID)',
      documentCategory: 'smart_nid',
      confidence: 'High',
      detectedLanguage: 'বাংলা ও ইংরেজি (Bilingual)',
      summary: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক ইস্যুকৃত স্মার্ট জাতীয় পরিচয়পত্র। কার্ডধারীর নাম মোঃ রফিকুল ইসলাম।',
      fields: [
        { id: 'nid_number', labelBn: 'জাতীয় পরিচয়পত্র নং', labelEn: 'National ID No', value: '782 459 3012', category: 'identity', isImportant: true },
        { id: 'name_bn', labelBn: 'নাম (বাংলা)', labelEn: 'Name (Bengali)', value: 'মোঃ রফিকুল ইসলাম', category: 'personal', isImportant: true },
        { id: 'name_en', labelBn: 'নাম (ইংরেজি)', labelEn: 'Name (English)', value: 'MD RAFIQUL ISLAM', category: 'personal', isImportant: true },
        { id: 'father_name', labelBn: 'পিতার নাম', labelEn: "Father's Name", value: 'মোঃ আব্দুল করিম', category: 'family' },
        { id: 'mother_name', labelBn: 'মাতার নাম', labelEn: "Mother's Name", value: 'মোসাম্মৎ খাদিজা বেগম', category: 'family' },
        { id: 'dob', labelBn: 'জন্ম তারিখ', labelEn: 'Date of Birth', value: '12 Mar 1988', category: 'dates', isImportant: true },
        { id: 'blood_group', labelBn: 'রক্তের গ্রুপ', labelEn: 'Blood Group', value: 'B+ (ve)', category: 'personal' },
        { id: 'authority', labelBn: 'ইস্যুকারী কর্তৃপক্ষ', labelEn: 'Issuing Authority', value: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (বাংলাদেশ নির্বাচন কমিশন)', category: 'other' },
      ],
      fullText: `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nGovernment of the People's Republic of Bangladesh\nজাতীয় পরিচয়পত্র / National ID Card\nনাম: মোঃ রফিকুল ইসলাম\nName: MD RAFIQUL ISLAM\nপিতা: মোঃ আব্দুল করিম\nমাতা: মোসাম্মৎ খাদিজা বেগম\nDate of Birth: 12 Mar 1988\nNID NO: 782 459 3012\nরক্তের গ্রুপ: B+ (ve)`,
      notes: ['স্মার্ট কার্ডের চিপ ও ডিজিটাল তথ্য সুস্পষ্টভাবে দৃশ্যমান।'],
    },
  },
  {
    id: 'sample_birth_cert',
    titleBn: 'জন্ম নিবন্ধন সনদ (Birth Certificate)',
    titleEn: 'Birth Registration Certificate',
    category: 'birth_cert',
    descriptionBn: '১৭ সংখ্যার জন্ম নিবন্ধন সনদপত্র (নাম, পিতা, মাতা, নিবন্ধনের তারিখ, স্থায়ী ঠিকানা)',
    generateImage: generateBirthCertificateImage,
    presetData: {
      documentType: 'জন্ম নিবন্ধন সনদপত্র (Birth Registration Certificate)',
      documentCategory: 'birth_cert',
      confidence: 'High',
      detectedLanguage: 'বাংলা ও ইংরেজি (Bilingual)',
      summary: 'স্থানীয় সরকার বিভাগ কর্তৃক প্রদত্ত ১৭ সংখ্যার ডিজিটাল জন্ম নিবন্ধন সনদপত্র। নিবন্ধনকারী তানিয়া আক্তার।',
      fields: [
        { id: 'brn_number', labelBn: 'জন্ম নিবন্ধন নম্বর', labelEn: 'Birth Registration No (BRN)', value: '1995 2692 0150 12345', category: 'identity', isImportant: true },
        { id: 'name_bn', labelBn: 'নাম (বাংলা)', labelEn: 'Name (Bengali)', value: 'তানিয়া আক্তার', category: 'personal', isImportant: true },
        { id: 'name_en', labelBn: 'নাম (ইংরেজি)', labelEn: 'Name (English)', value: 'TANIA AKTER', category: 'personal', isImportant: true },
        { id: 'dob', labelBn: 'জন্ম তারিখ', labelEn: 'Date of Birth', value: '১৫-০৮-১৯৯৫ (15th August 1995)', category: 'dates', isImportant: true },
        { id: 'gender', labelBn: 'লিঙ্গ', labelEn: 'Gender', value: 'মহিলা (Female)', category: 'personal' },
        { id: 'reg_date', labelBn: 'নিবন্ধনের তারিখ', labelEn: 'Registration Date', value: '০৫-০২-২০০৫', category: 'dates' },
        { id: 'issue_date', labelBn: 'সনদ ইস্যুর তারিখ', labelEn: 'Issuance Date', value: '১০-০২-২০০৫', category: 'dates' },
        { id: 'father_name_bn', labelBn: 'পিতার নাম', labelEn: "Father's Name", value: 'আবুল হোসেন (ABUL HOSSAIN)', category: 'family' },
        { id: 'father_nationality', labelBn: 'পিতার জাতীয়তা', labelEn: "Father's Nationality", value: 'বাংলাদেশী', category: 'family' },
        { id: 'mother_name_bn', labelBn: 'মাতার নাম', labelEn: "Mother's Name", value: 'রাশিদা পারভীন (RASHIDA PARVIN)', category: 'family' },
        { id: 'mother_nationality', labelBn: 'মাতার জাতীয়তা', labelEn: "Mother's Nationality", value: 'বাংলাদেশী', category: 'family' },
        { id: 'place_of_birth', labelBn: 'জন্মস্থান', labelEn: 'Place of Birth', value: 'গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর', category: 'address' },
        { id: 'permanent_address', labelBn: 'স্থায়ী ঠিকানা', labelEn: 'Permanent Address', value: 'গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর', category: 'address' },
        { id: 'issuing_office', labelBn: 'নিবন্ধন কার্যালয়', labelEn: 'Issuing Office', value: 'সখিপুর ইউনিয়ন পরিষদ, ভেদরগঞ্জ, শরীয়তপুর', category: 'other' },
      ],
      fullText: `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nস্থানীয় সরকার বিভাগ / জন্ম ও মৃত্যু নিবন্ধন কার্যালয়\nসখিপুর ইউনিয়ন পরিষদ, ভেদরগঞ্জ, শরীয়তপুর\nজন্ম নিবন্ধন সনদপত্র / BIRTH REGISTRATION CERTIFICATE\nনিবন্ধনের তারিখ: ০৫-০২-২০০৫ (05/02/2005)\nসনদ ইস্যুর তারিখ: ১০-০২-২০০৫ (10/02/2005)\nজন্ম নিবন্ধন নম্বর: 1995 2692 0150 12345\nনাম (বাংলা): তানিয়া আক্তার\nName (English): TANIA AKTER\nজন্ম তারিখ: ১৫-০৮-১৯৯৫ (পনেরই আগস্ট উনিশশত পঁচানব্বই)\nলিঙ্গ: মহিলা (Female)\nপিতার নাম: আবুল হোসেন (ABUL HOSSAIN) - জাতীয়তা: বাংলাদেশী\nমাতার নাম: রাশিদা পারভীন (RASHIDA PARVIN) - জাতীয়তা: বাংলাদেশী\nজন্মস্থান: গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর\nস্থায়ী ঠিকানা: গ্রাম: চরভাগা, ডাকঘর: সখিপুর, উপজেলা: ভেদরগঞ্জ, জেলা: শরীয়তপুর`,
      notes: ['১৭ ডিজিটের জন্ম নিবন্ধন সনদ সম্পূর্ণ স্পষ্ট এবং সকল বাংলা তথ্য পাঠযোগ্য।'],
    },
  },
  {
    id: 'sample_old_nid',
    titleBn: 'ল্যামিনেটেড জাতীয় পরিচয়পত্র (Old NID)',
    titleEn: 'Laminated National ID Card',
    category: 'nid',
    descriptionBn: '১৩/১৭ সংখ্যার ঐতিহ্যবাহী ল্যামিনেটেড জাতীয় পরিচয়পত্রের নমুনা',
    generateImage: generateOldNidImage,
    presetData: {
      documentType: 'জাতীয় পরিচয়পত্র (Laminated NID)',
      documentCategory: 'nid',
      confidence: 'High',
      detectedLanguage: 'বাংলা ও ইংরেজি (Bilingual)',
      summary: 'বাংলাদেশ নির্বাচন কমিশন কর্তৃক প্রদত্ত ল্যামিনেটেড জাতীয় পরিচয়পত্র। কার্ডধারীর নাম বেগম সালমা খাতুন।',
      fields: [
        { id: 'nid_number', labelBn: 'জাতীয় পরিচয়পত্র নং', labelEn: 'National ID No', value: '1982 2692 0150 00192', category: 'identity', isImportant: true },
        { id: 'name_bn', labelBn: 'নাম (বাংলা)', labelEn: 'Name (Bengali)', value: 'বেগম সালমা খাতুন', category: 'personal', isImportant: true },
        { id: 'name_en', labelBn: 'নাম (ইংরেজি)', labelEn: 'Name (English)', value: 'BEGUM SALMA KHATUN', category: 'personal', isImportant: true },
        { id: 'father_name', labelBn: 'পিতার নাম', labelEn: "Father's Name", value: 'মোজাম্মেল হক', category: 'family' },
        { id: 'mother_name', labelBn: 'মাতার নাম', labelEn: "Mother's Name", value: 'মরিয়ম বেগম', category: 'family' },
        { id: 'dob', labelBn: 'জন্ম তারিখ', labelEn: 'Date of Birth', value: '04 Nov 1982', category: 'dates', isImportant: true },
        { id: 'authority', labelBn: 'ইস্যুকারী কর্তৃপক্ষ', labelEn: 'Issuing Authority', value: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', category: 'other' },
      ],
      fullText: `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nGovernment of the People's Republic of Bangladesh\nজাতীয় পরিচয়পত্র\nনাম: বেগম সালমা খাতুন\nName: BEGUM SALMA KHATUN\nপিতা: মোজাম্মেল হক\nমাতা: মরিয়ম বেগম\nDate of Birth: 04 Nov 1982\nID NO: 1982 2692 0150 00192`,
      notes: ['ল্যামিনেটেড আইডি কার্ডের ১৭ ডিজিটের পরিচিতি নম্বর সনাক্ত করা হয়েছে।'],
    },
  },
];
