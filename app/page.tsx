"use client";

import Link from 'next/link';
import { Play, LogIn, LogOut, Flame, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { signInWithGoogle, logout } from '@/lib/firebase';
import styles from './page.module.css';

export default function Menu() {
  const { user, profile, loading } = useAuth();

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.topActions}>
          {!loading && (
            user ? (
              <>
                <Link href="/stats" className={styles.statsPill}>
                  <BarChart2 size={16} />
                  <span>Stats</span>
                </Link>
                {profile && profile.currentStreak > 0 && (
                  <div className={styles.streakPill}>
                    <Flame size={16} />
                    <span>{profile.currentStreak}</span>
                  </div>
                )}
                <button 
                  onClick={logout}
                  className={styles.iconBtn}
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className={styles.signInBtn}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
        
        <h1 className={styles.title}>Daily Dose</h1>
        <p className={styles.subtitle}>Refined challenges for the lateral mind.</p>
        
        {!loading && profile && (
          <div className={styles.streakStats}>
            <div className={styles.streakStatItem}>
              <span className={styles.streakStatNumber}>{profile.currentStreak}</span>
              <span>Current Streak</span>
            </div>
            <div className={styles.streakStatItem}>
              <span className={styles.streakStatNumber}>{profile.longestStreak}</span>
              <span>Longest Streak</span>
            </div>
          </div>
        )}
      </header>

      <main className={styles.gameList}>
        <Link href="/chain" className={`${styles.gameCard} ${styles.themeChain}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Chain</h2>
              <p className={styles.gameDesc}>Connect the start and end words.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/spectrum" className={`${styles.gameCard} ${styles.themeSpectrum}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Spectrum</h2>
              <p className={styles.gameDesc}>Sort the items by a hidden metric.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/numbers" className={`${styles.gameCard} ${styles.themeNumbers}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Numbers</h2>
              <p className={styles.gameDesc}>Use math to reach the exact target.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/split" className={`${styles.gameCard} ${styles.themeSplit}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Split</h2>
              <p className={styles.gameDesc}>Combine halves to form 16 words.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/layers" className={`${styles.gameCard} ${styles.themeLayers}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Layers</h2>
              <p className={styles.gameDesc}>Find the groups, then find the meta.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/vault" className={`${styles.gameCard} ${styles.themeVault}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Vault</h2>
              <p className={styles.gameDesc}>Crack the code using logic rules.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>

        <Link href="/shift" className={`${styles.gameCard} ${styles.themeShift}`}>
          <div className={styles.gameCardStrip}></div>
          <div className={styles.gameCardContent}>
            <div>
              <h2 className={styles.gameTitle}>Shift</h2>
              <p className={styles.gameDesc}>Slide columns to reveal the words.</p>
            </div>
            <div className={styles.playIcon}>
              <Play size={20} style={{ marginLeft: '2px' }} />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
