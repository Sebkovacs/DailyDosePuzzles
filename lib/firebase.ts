import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig, addGameStat, upsertUser } from './dataconnect';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Data Connect
export const dataConnect = getDataConnect(app, connectorConfig);
if (process.env.NODE_ENV === 'development') {
  // Connect to local Data Connect Emulator (default FDC port is 9399)
  connectDataConnectEmulator(dataConnect, 'localhost', 9399);
}

export interface GameStats {
  gameName: string;
  date: string;
  mode: string;
  won: boolean;
  mistakes: number;
  timeToComplete?: number;
  attempts?: number;
  isPlayTest?: boolean;
  wrongGuesses?: any[];
  timeToFirstAction?: number;
  actionTimeline?: any[];
}

export const saveGameStats = async (uid: string | null, stats: GameStats) => {
  // 1. Save strict, relational KPI data to PostgreSQL via Data Connect
  try {
    await addGameStat(dataConnect, {
      userId: uid || 'anonymous',
      gameName: stats.gameName,
      date: stats.date,
      mode: stats.mode,
      won: stats.won,
      mistakes: stats.mistakes,
      attempts: stats.attempts || 1,
      timeToCompleteSeconds: stats.timeToComplete || null,
      isPlayTest: stats.isPlayTest || false
    });
  } catch (error) {
    console.warn('Data Connect (PostgreSQL) is offline or failed. Make sure the emulator is running:', error);
  }

  // 2. Save flexible, high-fidelity AI telemetry data directly to NoSQL Firestore
  try {
    await addDoc(collection(db, 'gameStats'), {
      ...stats,
      userId: uid || 'anonymous',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to save high-fidelity game telemetry to Firestore:", error);
  }
};

export const saveFeedback = async (uid: string, text: string, gameName?: string) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    await addDoc(feedbackRef, {
      userId: uid,
      text,
      ...(gameName && { gameName }),
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    let role = 'user';

    if (!userSnap.exists()) {
      // Check if email is in admins or playtesters collection
      if (user.email) {
        const emailLower = user.email.toLowerCase();
        try {
          // Check for admin status first
          const adminRef = doc(db, 'admins', emailLower);
          const adminSnap = await getDoc(adminRef);

          if (adminSnap.exists()) {
            role = 'admin';
          } else {
            // Check if email is in playtesters collection
            const playtesterRef = doc(db, 'playtesters', emailLower);
            const playtesterSnap = await getDoc(playtesterRef);
            if (playtesterSnap.exists()) {
              role = 'tester';
            }
          }
        } catch (e) {
          console.error('Error checking role status', e);
        }
      }

      // Create new user profile
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: serverTimestamp(),
        role: role
      });
    } else {
      role = userSnap.data()?.role || 'user';
    }
    
    // Sync the user to PostgreSQL via Data Connect on every login
    try {
      await upsertUser(dataConnect, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: role
      });
    } catch (err) { console.warn("Error syncing to postgres:", err); }

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export const updateStreak = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      if (data.lastSolveDate === localDate) {
        // Already solved today
        return;
      }
      
      let newCurrentStreak = 1;
      
      if (data.lastSolveDate) {
        const lastDate = new Date(data.lastSolveDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastDateStr = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        if (lastDateStr === yesterdayStr) {
          // Solved yesterday, increment streak
          newCurrentStreak = (data.currentStreak || 0) + 1;
        }
      }
      
      const newLongestStreak = Math.max(newCurrentStreak, data.longestStreak || 0);
      
      await updateDoc(userRef, {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastSolveDate: localDate
      });
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};
