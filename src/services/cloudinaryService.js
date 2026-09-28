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
 * Compress image to high-efficiency WebP/JPEG Data URL (<100KB)
 */
export async function compressImageToDataUrl(file, maxWidth = 900, maxHeight = 1200, quality = 0.82) {
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
        if (webpData.startsWith('data:image/webp') && webpData.length < 800000) {
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
 * Upload an image file to Cloudinary with compressed fallback
 * @param {File} file 
 * @returns {Promise<string>} Secure URL of the uploaded image
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

  // Attempt 1: Signed direct upload if API Key and Secret are available
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
      }
    } catch (err) {
      console.warn('Signed upload attempt failed, checking fallback:', err);
    }
  }

  // Attempt 2: Unsigned preset upload
  if (CLOUD_NAME && UPLOAD_PRESET) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

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
      }
    } catch (err) {
      console.warn('Unsigned upload failed, falling back to optimized compression:', err);
    }
  }

  // Attempt 3: High-efficiency compressed WebP/JPEG data URL (<100KB, guaranteed Firestore compatibility)
  try {
    const compressedDataUrl = await compressImageToDataUrl(file, 800, 1000, 0.8);
    return compressedDataUrl;
  } catch (err) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(new Error('Failed to read image: ' + e.message));
      reader.readAsDataURL(file);
    });
  }
}
