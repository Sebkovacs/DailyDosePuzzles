"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  currentStreak: number;
  longestStreak: number;
  lastSolveDate?: string;
  role?: 'admin' | 'tester' | 'user';
  streak?: number;
  maxStreak?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

// ⚡ Bolt Performance Optimization:
// Converted `useAuth` localized state to a global Singleton Context provider.
// This prevents every child component that calls `useAuth()` from mounting
// duplicate `onAuthStateChanged` and `onSnapshot` listeners, drastically
// reducing redundant Firebase network requests and active concurrent connections.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          
          // Calculate displayed streak
          let displayStreak = data.currentStreak;
          if (data.lastSolveDate) {
            const today = new Date();
            const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            
            if (data.lastSolveDate !== localDate && data.lastSolveDate !== yesterdayStr) {
              // Missed a day, streak is 0
              displayStreak = 0;
            }
          }
          
          setProfile({ ...data, currentStreak: displayStreak, streak: displayStreak, maxStreak: data.longestStreak });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
