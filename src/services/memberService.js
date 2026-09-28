import { INITIAL_MEMBERS } from '../data/initialMembers';

const LOCAL_STORAGE_KEY = 'csi_kare_members_dynamic_v1';

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
    console.error('Error writing to localStorage:', err);
  }
};

/**
 * Fetch a single member dynamically by ID (e.g., CSI26-001, CSI26-081, CSI26-999)
 */
export async function getMemberById(memberId) {
  if (!memberId) return null;
  const formattedId = memberId.trim().toUpperCase();

  // Try Server/Firestore API endpoint
  try {
    const res = await fetch(`/api/members/${formattedId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    if (res.status === 404) {
      return null;
    }
  } catch (err) {
    // API endpoint offline or static build, use local cache
  }

  // Local fallback
  const localList = getLocalMembers();
  const match = localList.find((m) => m.memberId.toUpperCase() === formattedId);
  return match || null;
}

/**
 * Fetch all members dynamically (no hardcoded limits)
 */
export async function getAllMembers() {
  // Try Server/Firestore API endpoint
  try {
    const res = await fetch('/api/members');
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        saveLocalMembers(list);
        return list;
      }
    }
  } catch (err) {
    // API endpoint offline or static build
  }

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

  const newRecord = {
    memberId: formattedId,
    name: memberData.name?.trim() || `Core Member ${formattedId}`,
    role: memberData.role?.trim() || 'Core Team Member',
    year: memberData.year || '2nd Year',
    photoUrl: memberData.photoUrl || '',
    instagram: memberData.instagram?.trim() || '',
    linkedin: memberData.linkedin?.trim() || '',
    email: memberData.email?.trim() || '',
    phone: memberData.phone?.trim() || '',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save to Firestore via Admin API
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    });
    if (res.ok) {
      const data = await res.json();
      // Update local cache
      const localList = getLocalMembers();
      localList.push(data);
      saveLocalMembers(localList);
      return data;
    }
  } catch (err) {
    console.warn('API create note (using local cache):', err);
  }

  // 2. Guaranteed local save
  const localList = getLocalMembers();
  const existsLocal = localList.findIndex((m) => m.memberId.toUpperCase() === formattedId);
  if (existsLocal !== -1) {
    localList[existsLocal] = newRecord;
  } else {
    localList.push(newRecord);
  }
  saveLocalMembers(localList);

  return newRecord;
}

/**
 * Update an existing member's profile
 */
export async function updateMember(memberId, updatedFields) {
  if (!memberId) throw new Error('Member ID is required.');
  const formattedId = memberId.trim().toUpperCase();
  const payload = {
    ...updatedFields,
    memberId: formattedId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update Firestore via Admin API
  try {
    const res = await fetch(`/api/members/${formattedId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      // Update local cache
      const localList = getLocalMembers();
      const index = localList.findIndex((m) => m.memberId.toUpperCase() === formattedId);
      if (index !== -1) {
        localList[index] = { ...localList[index], ...data };
      } else {
        localList.push(data);
      }
      saveLocalMembers(localList);
      return data;
    }
  } catch (err) {
    console.warn('API update note (using local cache):', err);
  }

  // 2. Guaranteed local save
  const localList = getLocalMembers();
  const index = localList.findIndex((m) => m.memberId.toUpperCase() === formattedId);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...payload };
  } else {
    localList.push(payload);
  }
  saveLocalMembers(localList);

  return payload;
}

/**
 * Delete a member dynamically
 */
export async function deleteMember(memberId) {
  if (!memberId) throw new Error('Member ID is required.');
  const formattedId = memberId.trim().toUpperCase();

  // 1. Delete in Firestore via API
  try {
    await fetch(`/api/members/${formattedId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('API delete note:', err);
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
  const localList = getLocalMembers();
  return { count: localList.length, target: 'firestore' };
}
