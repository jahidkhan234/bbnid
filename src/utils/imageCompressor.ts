/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimizes and resizes an image on the client side before upload.
 * Scales large mobile photos down to a max dimension (e.g. 1600px),
 * keeping Bengali characters, ligatures, and numbers razor sharp,
 * while reducing transfer size from 15MB down to ~250-400KB for near-instant upload.
 */
export async function optimizeImageForOcr(
  fileOrDataUrl: File | string,
  maxDimension = 1600,
  quality = 0.85
): Promise<{ dataUrl: string; mimeType: string; originalSize: number; optimizedSize: number }> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let originalSize = 0;

    if (typeof fileOrDataUrl === 'string') {
      srcUrl = fileOrDataUrl;
      originalSize = Math.round((fileOrDataUrl.length * 3) / 4);
    } else {
      originalSize = fileOrDataUrl.size;
      srcUrl = URL.createObjectURL(fileOrDataUrl);
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        // Fallback to original
        if (typeof fileOrDataUrl !== 'string') {
          URL.revokeObjectURL(srcUrl);
        }
        resolve({
          dataUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
          mimeType: 'image/jpeg',
          originalSize,
          optimizedSize: originalSize,
        });
        return;
      }

      // Draw with smooth bicubic interpolation for sharp text
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Clean up blob URL if created
      if (typeof fileOrDataUrl !== 'string') {
        URL.revokeObjectURL(srcUrl);
      }

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const optimizedSize = Math.round((optimizedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: optimizedDataUrl,
        mimeType: 'image/jpeg',
        originalSize,
        optimizedSize,
      });
    };

    img.onerror = (err) => {
      if (typeof fileOrDataUrl !== 'string') {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error('ছবি প্রসেস করতে ব্যর্থ হয়েছে'));
    };

    img.src = srcUrl;
  });
}
