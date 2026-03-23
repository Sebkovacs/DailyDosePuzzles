"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './GameLayout.module.css';
import { ReactNode } from 'react';

interface GameLayoutProps {
  title: string;
  subtitle?: string;
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  children: ReactNode;
}

export function GameLayout({ title, subtitle, leftActions, rightActions, children }: GameLayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerSide}>
          <Link href="/" className={styles.iconBtn} aria-label="Go Back">
            <ChevronLeft size={20} />
          </Link>
          {leftActions}
        </div>
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        <div className={`${styles.headerSide} ${styles.headerRight}`}>
          {rightActions}
        </div>
      </header>
      
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}