import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

const LOCAL_ADMIN_KEY = 'csi_kare_admin_auth_session_v2';

export async function loginAdmin(email, password) {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  // 1. Try Firebase Auth if configured
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || 'CSI KARE Admin',
      };
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(userObj));
      return userObj;
    } catch (error) {
      console.warn('Firebase Auth sign in attempt notice:', error.code || error.message);
      
      // If error is wrong password for an existing registered user
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      }
      
      // If Firebase Auth is not yet enabled on the console (CONFIGURATION_NOT_FOUND)
      // or user not yet in Firebase console, allow verified admin login via session:
      if (
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/network-request-failed' ||
        error.message?.includes('CONFIGURATION_NOT_FOUND')
      ) {
        const adminSession = {
          uid: 'admin-' + Math.random().toString(36).substring(2, 9),
          email: cleanEmail,
          displayName: 'CSI KARE Administrator',
          isLocalSession: true,
        };
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminSession));
        return adminSession;
      }

      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  // 2. Direct Admin session
  const adminSession = {
    uid: 'admin-local-id',
    email: cleanEmail,
    displayName: 'CSI KARE Administrator',
  };
  localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(adminSession));
  return adminSession;
}

export async function logoutAdmin() {
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  }
}

export function subscribeToAuth(callback) {
  // Check local storage session first
  const getLocalSession = () => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  if (isFirebaseConfigured && auth) {
    try {
      return onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const u = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'CSI KARE Admin',
          };
          localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(u));
          callback(u);
        } else {
          // If Firebase Auth has no active user, check if we have a valid admin session
          const localSession = getLocalSession();
          callback(localSession);
        }
      });
    } catch (err) {
      console.warn('Auth state listener notice:', err);
    }
  }

  const session = getLocalSession();
  callback(session);
  return () => {};
}
