/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Resolves the backend API endpoint URL.
 * Supports:
 * 1. Default relative path (e.g. '/api/extract-ocr') for full-stack hosting (AI Studio, Cloud Run, Render, Express).
 * 2. VITE_API_BASE_URL environment variable if set during build.
 * 3. User-configured custom backend URL stored in localStorage for static hosts like GitHub Pages.
 */
export function getApiEndpoint(path: string): string {
  const customUrl =
    (typeof window !== 'undefined' && localStorage.getItem('bangla_ocr_backend_url')) ||
    import.meta.env.VITE_API_BASE_URL ||
    '';

  if (customUrl && typeof customUrl === 'string' && customUrl.trim() !== '') {
    const cleanBase = customUrl.trim().replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }

  return path;
}

export function getCustomBackendUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bangla_ocr_backend_url') || '';
}

export function setCustomBackendUrl(url: string): void {
  if (typeof window === 'undefined') return;
  if (!url || url.trim() === '') {
    localStorage.removeItem('bangla_ocr_backend_url');
  } else {
    localStorage.setItem('bangla_ocr_backend_url', url.trim());
  }
}
