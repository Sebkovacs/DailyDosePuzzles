"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, LogIn, LogOut, Flame, BarChart2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { signInWithGoogle, logout } from '@/lib/firebase';
import styles from './page.module.css';

const DEFAULT_GAMES = [
  { id: 'chain', href: '/chain', title: 'Chain', desc: 'Connect the start and end words.', themeClass: styles.themeChain },
  { id: 'stab', href: '/stab', title: 'Stab', desc: 'Wordle meets Chain. Deduce the missing links.', themeClass: styles.themeStab },
  { id: 'spectrum', href: '/spectrum', title: 'Spectrum', desc: 'Sort the items by a hidden metric.', themeClass: styles.themeSpectrum },
  { id: 'numbers', href: '/numbers', title: 'Numbers', desc: 'Use math to reach the exact target.', themeClass: styles.themeNumbers },
  { id: 'split', href: '/split', title: 'Split', desc: 'Combine halves to form 16 words.', themeClass: styles.themeSplit },
  { id: 'layers', href: '/layers', title: 'Layers', desc: 'Find the groups, then find the meta.', themeClass: styles.themeLayers },
  { id: 'vault', href: '/vault', title: 'Vault', desc: 'Crack the code using logic rules.', themeClass: styles.themeVault },
  { id: 'shift', href: '/shift', title: 'Shift', desc: 'Slide columns to reveal the words.', themeClass: styles.themeShift },
  { id: 'lexicon', href: '/lexicon', title: 'Lexicon', desc: 'Build words from the falling letters.', themeClass: styles.themeLexicon },
  { id: 'roots', href: '/roots', title: 'Roots', desc: 'Deduce the word from its ancient literal translation.', themeClass: styles.themeRoots }
];

export default function Menu() {
  const { user, profile, loading } = useAuth();
  const [games, setGames] = useState(DEFAULT_GAMES);

  useEffect(() => {
    if (profile?.role === 'tester' || profile?.role === 'admin') {
      const shuffled = [...DEFAULT_GAMES];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setGames(shuffled);
    } else {
      setGames(DEFAULT_GAMES);
    }
  }, [profile?.role]);

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.topActions}>
          {!loading && (
            user ? (
              <>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className={styles.iconBtn} title="Admin Portal" aria-label="Admin Portal">
                    <Shield size={18} />
                  </Link>
                )}
                
                <Link href="/stats" className={styles.statsPill}>
                  <BarChart2 size={16} />
                  <span>Stats</span>
                </Link>
                <div className={styles.streakPill}>
                  <Flame size={14} color="#F9EAE7" fill="#F9EAE7" />
                  <span>{(profile as any)?.streak || 0}</span>
                </div>
                <button onClick={logout} className={styles.iconBtn} title="Sign Out" aria-label="Sign Out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button onClick={signInWithGoogle} className={styles.signInBtn}>
                <LogIn size={16} />
                <span>Sign In to Save</span>
              </button>
            )
          )}
        </div>
        
        <h1 className={styles.title}>Daily Dose</h1>
        <p className={styles.subtitle}>Classical Logic & Deduction</p>

        {user && (
          <div className={styles.streakStats}>
            <div className={styles.streakStatItem}>
              <span>Streak</span>
              <span className={styles.streakStatNumber}>{(profile as any)?.streak || 0}</span>
            </div>
            <div className={styles.streakStatItem}>
              <span>Max</span>
              <span className={styles.streakStatNumber}>{(profile as any)?.maxStreak || 0}</span>
            </div>
          </div>
        )}
      </header>

      <main className={styles.gameList}>
        {games.map((game) => (
          <Link key={game.id} href={game.href} className={`${styles.gameCard} ${game.themeClass}`}>
            <div className={styles.gameCardStrip}></div>
            <div className={styles.gameCardContent}>
              <div>
                <h2 className={styles.gameTitle}>{game.title}</h2>
                <p className={styles.gameDesc}>{game.desc}</p>
              </div>
              <div className={styles.playIcon}>
                <Play size={20} style={{ marginLeft: '2px' }} />
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}