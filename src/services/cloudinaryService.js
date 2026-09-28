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
 * Compress image to high-efficiency WebP/JPEG Data URL (<70KB)
 */
export async function compressImageToDataUrl(file, maxWidth = 600, maxHeight = 800, quality = 0.75) {
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
        if (webpData.startsWith('data:image/webp') && webpData.length < 300000) {
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
 * Re-compress any existing Base64 Data URL if it exceeds 300KB
 */
export async function ensureSmallPhotoUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.startsWith('data:image/')) {
    return photoUrl || '';
  }
  if (photoUrl.length < 300000) {
    return photoUrl;
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxW = 600;
        const maxH = 800;
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
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressed);
      };
      img.onerror = () => resolve(photoUrl);
      img.src = photoUrl;
    } catch (e) {
      resolve(photoUrl);
    }
  });
}

/**
 * Upload an image file directly to Cloudinary
 * @param {File} file 
 * @returns {Promise<string>} Secure HTTPS URL from Cloudinary
 */
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('No file selected.');
  }

  // Basic size & format validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file (PNG, JPG, WebP).');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  let lastErrorMsg = '';

  // Attempt 1: Signed upload
  if (CLOUD_NAME && API_KEY && API_SECRET) {
    try {
      const folder = 'csi_kare_members';
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
      const signature = await sha1(stringToSign);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', API_KEY);
      formData.append('timestamp', timestamp);
      formData.append('folder', folder);
      formData.append('signature', signature);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let secureUrl = data.secure_url;
        if (secureUrl && secureUrl.includes('/upload/')) {
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_1000,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastErrorMsg = errJson.error?.message || response.statusText;
      }
    } catch (err) {
      lastErrorMsg = err.message;
    }
  }

  // Attempt 2: Unsigned preset upload (trying configured preset, then common fallbacks)
  const presetsToTry = [UPLOAD_PRESET, 'CSI-ID-INFO', 'ml_default', 'unsigned'].filter(Boolean);
  for (const preset of presetsToTry) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let secureUrl = data.secure_url;
        if (secureUrl && secureUrl.includes('/upload/')) {
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_1000,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastErrorMsg = errJson.error?.message || response.statusText;
      }
    } catch (err) {
      lastErrorMsg = err.message;
    }
  }

  // If Cloudinary rejects, throw an informative error so the admin knows exactly how to configure the upload preset
  throw new Error(
    `Cloudinary upload error (${lastErrorMsg || 'Upload failed'}). Please create an Unsigned Upload Preset named '${UPLOAD_PRESET}' in your Cloudinary Dashboard under Settings -> Upload -> Upload presets.`
  );
}
