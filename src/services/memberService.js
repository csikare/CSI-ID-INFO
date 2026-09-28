import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { INITIAL_MEMBERS } from '../data/initialMembers';
import { ensureSmallPhotoUrl } from './cloudinaryService';

const LOCAL_STORAGE_KEY = 'csi_kare_members_cache_v2';

// Helper to get local fallback storage
const getLocalMembers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return [...INITIAL_MEMBERS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return [...INITIAL_MEMBERS];
    }
    return parsed;
  } catch {
    return [...INITIAL_MEMBERS];
  }
};

const saveLocalMembers = (members) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Error writing to localStorage cache:', err);
  }
};

/**
 * Fetch a single member dynamically by ID (e.g., CSI26-001, CSI26-081, CSI26-999)
 * Directly from Firebase Firestore
 */
export async function getMemberById(memberId) {
  if (!memberId) return null;
  const formattedId = memberId.trim().toUpperCase();

  // 1. Query Firestore directly
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'members', formattedId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        // Update local cache
        const localList = getLocalMembers();
        const idx = localList.findIndex(m => m.memberId?.toUpperCase() === formattedId);
        if (idx !== -1) localList[idx] = data;
        else localList.push(data);
        saveLocalMembers(localList);
        return data;
      }
      // If doc does not exist in Firestore
      return null;
    } catch (err) {
      console.warn('Firestore getMemberById error (falling back to local cache):', err);
    }
  }

  // 2. Fallback to local cache
  const localList = getLocalMembers();
  const match = localList.find((m) => m.memberId?.toUpperCase() === formattedId);
  return match || null;
}

/**
 * Fetch all members dynamically (no hardcoded limits)
 * Directly from Firebase Firestore
 */
export async function getAllMembers() {
  // 1. Query Firestore directly
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'members');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.memberId || '').localeCompare(b.memberId || '', undefined, { numeric: true }));
        saveLocalMembers(list);
        return list;
      }
    } catch (err) {
      console.warn('Firestore getAllMembers error (falling back to local cache):', err);
    }
  }

  // 2. Fallback to local cache
  const localList = getLocalMembers();
  localList.sort((a, b) => (a.memberId || '').localeCompare(b.memberId || '', undefined, { numeric: true }));
  return localList;
}

/**
 * Create a new member dynamically (e.g., CSI26-081, CSI26-082, etc.)
 */
export async function createMember(memberData) {
  if (!memberData.memberId) {
    throw new Error('Member ID is required.');
  }

  const formattedId = memberData.memberId.trim().toUpperCase();
  const now = new Date().toISOString();
  const safePhotoUrl = await ensureSmallPhotoUrl(memberData.photoUrl || '');

  const newRecord = {
    memberId: formattedId,
    name: memberData.name?.trim() || `Core Member ${formattedId}`,
    role: memberData.role?.trim() || 'Core Team Member',
    year: memberData.year || '2nd Year',
    department: memberData.department || 'CSE (AIML) | KARE',
    quote: memberData.quote || '',
    photoUrl: safePhotoUrl,
    photoScale: typeof memberData.photoScale === 'number' ? memberData.photoScale : 1,
    photoPosX: typeof memberData.photoPosX === 'number' ? memberData.photoPosX : 0,
    photoPosY: typeof memberData.photoPosY === 'number' ? memberData.photoPosY : 0,
    instagram: memberData.instagram?.trim() || '',
    linkedin: memberData.linkedin?.trim() || '',
    email: memberData.email?.trim() || '',
    phone: memberData.phone?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Update local cache immediately for instant UI responsiveness
  const localList = getLocalMembers();
  const existsLocal = localList.findIndex((m) => m.memberId.toUpperCase() === formattedId);
  if (existsLocal !== -1) {
    localList[existsLocal] = newRecord;
  } else {
    localList.push(newRecord);
  }
  saveLocalMembers(localList);

  // 2. Sync to Firestore with 2.5s safety timeout (resilient to SSL/proxy blocks)
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'members', formattedId);
      const writePromise = setDoc(docRef, newRecord);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sync timeout')), 2500));
      await Promise.race([writePromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firestore create notice (saved locally):', err.message);
    }
  }

  return newRecord;
}

/**
 * Update an existing member's profile
 */
export async function updateMember(memberId, updatedFields) {
  if (!memberId) throw new Error('Member ID is required.');
  const formattedId = memberId.trim().toUpperCase();
  
  let safeUpdatedFields = { ...updatedFields };
  if (updatedFields.photoUrl) {
    safeUpdatedFields.photoUrl = await ensureSmallPhotoUrl(updatedFields.photoUrl);
  }

  const payload = {
    ...safeUpdatedFields,
    memberId: formattedId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local cache immediately for instant UI responsiveness
  const localList = getLocalMembers();
  const index = localList.findIndex((m) => m.memberId.toUpperCase() === formattedId);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...payload };
  } else {
    localList.push(payload);
  }
  saveLocalMembers(localList);

  // 2. Sync to Firestore with 2.5s safety timeout (resilient to SSL/proxy blocks)
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'members', formattedId);
      const writePromise = setDoc(docRef, payload, { merge: true });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Sync timeout')), 2500));
      await Promise.race([writePromise, timeoutPromise]);
    } catch (err) {
      console.warn('Firestore update notice (saved locally):', err.message);
    }
  }

  return payload;
}

/**
 * Delete a member dynamically
 */
export async function deleteMember(memberId) {
  if (!memberId) throw new Error('Member ID is required.');
  const formattedId = memberId.trim().toUpperCase();

  // 1. Delete from Firestore directly
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'members', formattedId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  }

  // 2. Update local cache
  const localList = getLocalMembers();
  const filtered = localList.filter((m) => m.memberId.toUpperCase() !== formattedId);
  saveLocalMembers(filtered);
}

/**
 * Helper to suggest the next dynamic member ID
 */
export function getNextSuggestedMemberId(members = []) {
  let highestNumber = 0;
  const prefix = 'CSI26-';

  members.forEach((m) => {
    const id = m.memberId || '';
    if (id.startsWith(prefix)) {
      const numPart = parseInt(id.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > highestNumber) {
        highestNumber = numPart;
      }
    }
  });

  const nextNum = highestNumber + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

/**
 * Seed initial 80 members if database is fresh
 */
export async function seedInitial80Members(force = false) {
  if (isFirebaseConfigured && db) {
    try {
      const batch = writeBatch(db);
      for (const member of INITIAL_MEMBERS) {
        const docRef = doc(db, 'members', member.memberId);
        batch.set(docRef, member, { merge: true });
      }
      await batch.commit();
    } catch (err) {
      console.error('Firestore batch seed error:', err);
    }
  }
  saveLocalMembers(INITIAL_MEMBERS);
  return { count: INITIAL_MEMBERS.length, target: 'firestore' };
}
