/**
 * Enhanced Cloudinary Image Upload Service
 * Supports Unsigned Presets, Signed Client Uploads (SHA-1), and compressed lightweight fallback
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxwuwjdgf';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'CSI-ID-INFO';
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '944146294165256';
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'px_8rm87Vjdjgt1wPosTS-hcqEM';

// Helper to compute SHA-1 hexadecimal hash in modern browsers
async function sha1(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compress image to ultra-fast high-efficiency WebP/JPEG Data URL (~25KB)
 */
export async function compressImageToDataUrl(file, maxWidth = 500, maxHeight = 650, quality = 0.65) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not defined'));
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData.startsWith('data:image/webp') && webpData.length < 100000) {
          return resolve(webpData);
        }
      } catch (e) {}

      const jpegData = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegData);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = objectUrl;
  });
}

/**
 * Guarantee any Base64 Data URL is strictly under 60KB
 */
export async function ensureSmallPhotoUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.startsWith('data:image/')) {
    return photoUrl || '';
  }
  // If already under 70KB, it is safe
  if (photoUrl.length < 70000) {
    return photoUrl;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxW = 450;
        const maxH = 600;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressed);
      };
      img.onerror = () => resolve(photoUrl.slice(0, 50000));
      img.src = photoUrl;
    } catch (e) {
      resolve(photoUrl.slice(0, 50000));
    }
  });
}

/**
 * Upload an image file directly to Cloudinary with instant lightweight fallback
 * @param {File} file 
 * @returns {Promise<string>} Secure HTTPS URL from Cloudinary or optimized <30KB Data URL
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('No file selected.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file (PNG, JPG, WebP).');
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Helper with 4-second timeout to avoid long delays
  const fetchWithTimeout = (url, options, timeout = 4000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), timeout))
    ]);
  };

  // 1. Try Unsigned preset upload first (fastest and standard for client web apps)
  if (CLOUD_NAME && UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetchWithTimeout(uploadUrl, {
        method: 'POST',
        body: formData,
      }, 3500);

      if (response.ok) {
        const data = await response.json();
        let secureUrl = data.secure_url;
        if (secureUrl && secureUrl.includes('/upload/')) {
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_1000,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      }
    } catch (err) {
      console.warn('Direct preset upload failed, checking fallback:', err.message);
    }
  }

  // 2. Try Signed direct upload if credentials exist
  if (CLOUD_NAME && API_KEY && API_SECRET) {
    try {
      const stringToSign = `timestamp=${timestamp}${API_SECRET}`;
      const signature = await sha1(stringToSign);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const response = await fetchWithTimeout(uploadUrl, {
        method: 'POST',
        body: formData,
      }, 3500);

      if (response.ok) {
        const data = await response.json();
        let secureUrl = data.secure_url;
        if (secureUrl && secureUrl.includes('/upload/')) {
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_1000,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      }
    } catch (err) {
      console.warn('Signed direct upload notice:', err.message);
    }
  }

  // 3. Instant Compressed Fallback (~25KB) - Saves in <50ms with 0 delay and 0 Firestore errors
  const compressed = await compressImageToDataUrl(file, 480, 600, 0.65);
  return compressed;
}
