import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface GameStats {
  gameName: string;
  date: string;
  mode: string;
  won: boolean;
  mistakes: number;
  timeToComplete?: number;
  attempts?: number;
  isPlayTest?: boolean;
  wrongGuesses?: string[][];
}

export const saveGameStats = async (uid: string | null, stats: GameStats) => {
  try {
    const statsRef = collection(db, 'game_stats');
    await addDoc(statsRef, {
      ...stats,
      userId: uid || 'anonymous',
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving game stats:', error);
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
    
    if (!userSnap.exists()) {
      // Check if email is in playtesters collection
      let role = 'user';
      if (user.email === 'sebkovacs@gmail.com') {
        role = 'admin';
      } else if (user.email) {
        try {
          const playtesterRef = doc(db, 'playtesters', user.email.toLowerCase());
          const playtesterSnap = await getDoc(playtesterRef);
          if (playtesterSnap.exists()) {
            role = 'tester';
          }
        } catch (e) {
          console.error('Error checking playtester status', e);
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
    }
    
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
};

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
