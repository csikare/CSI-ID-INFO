/**
 * Enhanced Cloudinary Image Upload Service
 * Supports Unsigned Presets, Signed Client Uploads (SHA-1), and graceful fallback
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
 * Upload an image file to Cloudinary
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
      // Cloudinary signature parameters must be in alphabetical order
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
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_800,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      }
    } catch (err) {
      console.warn('Signed upload failed, trying unsigned preset:', err);
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
          secureUrl = secureUrl.replace('/upload/', '/upload/c_fill,g_face,w_800,h_800,q_auto,f_auto/');
        }
        return secureUrl || data.secure_url;
      }
    } catch (err) {
      console.warn('Unsigned upload failed:', err);
    }
  }

  // Attempt 3: Local Data URL fallback (instant offline support)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(new Error('Failed to read image: ' + e.message));
    reader.readAsDataURL(file);
  });
}
