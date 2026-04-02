"use client";

import Link from 'next/link';
import { GameLayout } from '@/components/GameLayout';
import { Link2, Zap, Bot } from 'lucide-react';
import styles from './ChainMenu.module.css';

export default function ChainMenu() {
  return (
    <GameLayout title="Chain Hub" subtitle="Select a Mode">
      <div className={styles.modeList}>
        <div className={styles.modeContainer}>
          <Link href="/chain/standard" className={styles.modeCard}>
            <div className={`${styles.modeIcon} ${styles.standard}`}>
              <Link2 size={24} />
            </div>
            <div className={styles.modeContent}>
              <h2 className={styles.modeTitle}>Standard Chain</h2>
              <p className={styles.modeDescription}>The classic word-linking challenge.</p>
            </div>
          </Link>

          <Link href="/chain/blitz" className={styles.modeCard}>
            <div className={`${styles.modeIcon} ${styles.blitz}`}>
              <Zap size={24} />
            </div>
            <div className={styles.modeContent}>
              <h2 className={styles.modeTitle}>Chain Blitz</h2>
              <p className={styles.modeDescription}>Complete the chain before the timer runs out.</p>
            </div>
          </Link>

          <Link href="/chain/versus" className={styles.modeCard}>
            <div className={`${styles.modeIcon} ${styles.versus}`}>
              <Bot size={24} />
            </div>
            <div className={styles.modeContent}>
              <h2 className={styles.modeTitle}>Chain Versus</h2>
              <p className={styles.modeDescription}>Race against an AI opponent to the finish.</p>
            </div>
          </Link>
        </div>
      </div>
    </GameLayout>
  );
}