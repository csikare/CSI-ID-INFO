import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

const LOCAL_ADMIN_KEY = 'csi_kare_admin_auth';

export async function loginAdmin(email, password) {
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Firebase login error:', error);
      let message = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed login attempts. Try again later.';
      }
      throw new Error(message);
    }
  }

  // Fallback demo admin authentication if Firebase credentials are not yet entered in .env
  if (email.trim() && password.trim()) {
    const mockUser = {
      uid: 'demo-admin-id',
      email: email,
      displayName: 'CSI KARE Admin',
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(mockUser));
    return mockUser;
  }
  throw new Error('Please enter valid email and password.');
}

export async function logoutAdmin() {
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Local fallback check
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    callback(raw ? JSON.parse(raw) : null);
  } catch {
    callback(null);
  }
  return () => {};
}
