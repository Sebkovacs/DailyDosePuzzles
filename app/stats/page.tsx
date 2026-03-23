"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, BarChart2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { dataConnect } from '@/lib/firebase';
import { getUserStats } from '@/lib/dataconnect';
import styles from './Stats.module.css';

interface FetchedStat {
  id: string;
  gameName: string;
  date: string;
  mode: string;
  won: boolean;
  mistakes: number;
  timeToCompleteSeconds?: number;
}

export default function StatsPage() {
  const { user, profile, loading } = useAuth();
  const [stats, setStats] = useState<FetchedStat[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setFetching(false);
        return;
      }

      try {
        // Fetch directly from PostgreSQL via Data Connect!
        const response = await getUserStats(dataConnect, { userId: user.uid });
        setStats(response.data.gameStats as FetchedStat[]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading) {
      fetchUserStats();
    }
  }, [user, loading]);

  if (loading || fetching) {
    return <div className={styles.loading}>Loading Analytics...</div>;
  }

  if (!user) {
    return (
      <div className={styles.deniedContainer}>
        <h1 className={styles.deniedTitle}>Sign In Required</h1>
        <p className={styles.deniedText}>Please sign in to view your detailed analytics and streaks.</p>
        <Link href="/" className={styles.actionBtn}>
          Return Home
        </Link>
      </div>
    );
  }

  // Aggregations
  const totalPlayed = stats.length;
  const totalWon = stats.filter(s => s.won).length;
  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;
  const currentStreak = profile?.currentStreak || 0;
  const longestStreak = profile?.longestStreak || 0;

  const getBadgeClass = (gameName: string) => {
    const name = gameName.toLowerCase();
    if (name.includes('chain')) return styles.badgeChain;
    if (name.includes('shift')) return styles.badgeShift;
    if (name.includes('spectrum')) return styles.badgeSpectrum;
    if (name.includes('number')) return styles.badgeNumbers;
    if (name.includes('layer')) return styles.badgeLayers;
    if (name.includes('vault')) return styles.badgeVault;
    if (name.includes('split')) return styles.badgeSplit;
    return '';
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.iconBtn}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className={styles.headerTitle}>
          <BarChart2 size={20} /> Statistics
        </h1>
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.grid2}>
            <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
              <div className={styles.statValue}>{winRate}%</div>
              <div className={styles.statLabel}>Win Rate</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalPlayed}</div>
              <div className={styles.statLabel}>Games Played</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{currentStreak}</div>
              <div className={styles.statLabel}>Current Streak</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{longestStreak}</div>
              <div className={styles.statLabel}>Best Streak</div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Plays</h2>
          {stats.length === 0 ? (
            <div className={styles.noData}>No games played yet. Get out there!</div>
          ) : (
            <div className={styles.gameList}>
              {stats.map(stat => (
                <div key={stat.id} className={styles.gameItem}>
                  <div className={styles.gameInfo}>
                    <div className={styles.gameNameGroup}>
                      <span className={`${styles.gameOutcome} ${getBadgeClass(stat.gameName)}`}>{stat.gameName}</span>
                      {stat.mode && stat.mode !== 'standard' && <span className={`${styles.gameMode} ${stat.mode === 'hard' ? styles.gameModeHard : ''}`}>{stat.mode}</span>}
                    </div>
                    <span className={styles.gameDate}>{stat.date}</span>
                  </div>
                  <div className={styles.gameMetrics}>
                    {stat.mistakes > 0 && (
                      <span className={styles.gameMistakes}>
                        <AlertCircle size={14} /> {stat.mistakes}
                      </span>
                    )}
                    <div className={`${styles.gameOutcome} ${stat.won ? styles.outcomeWin : styles.outcomeLoss}`}>
                      {stat.won ? 'Win' : 'Loss'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}