"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, BarChart2, Target, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import styles from './Analytics.module.css';

interface GameStat {
  id: string;
  gameName: string;
  date: string;
  mode: string;
  won: boolean;
  mistakes: number;
  attempts: number;
  isPlayTest: boolean;
  timeToFirstAction?: number;
  wrongGuesses?: any[];
  timeToComplete?: number;
}

export default function AdminAnalyticsPage() {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState<GameStat[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchGlobalStats = async () => {
      if (!isAdmin) return;
      try {
        // Fetch high-fidelity telemetry from NoSQL Firestore instead of strict Data Connect
        const q = query(collection(db, 'gameStats'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GameStat[];
        setStats(data);
      } catch (error) {
        console.error('Error fetching global stats:', error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading && isAdmin) {
      fetchGlobalStats();
    }
  }, [loading, isAdmin]);

  if (loading || fetching) return <div className={styles.loading}>Aggregating Data...</div>;

  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <h1 className={styles.deniedTitle}>Access Denied</h1>
        <p className={styles.deniedText}>Admin privileges required to view global analytics.</p>
        <Link href="/" style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card)', color: 'var(--ink-main)', border: 'var(--border-ink)', borderRadius: 'var(--radius-sharp)', textDecoration: 'none', fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', boxShadow: 'var(--shadow-ink)' }}>Return Home</Link>
      </div>
    );
  }

  // Calculate KPIs
  const totalPlays = stats.length;
  const totalWins = stats.filter(s => s.won).length;
  const globalWinRate = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0;
  
  const playtestPlays = stats.filter(s => s.isPlayTest).length;
  const normalPlays = totalPlays - playtestPlays;

  // Aggregate by game
  const gameMap: Record<string, { plays: number, wins: number, mistakes: number }> = {};
  stats.forEach(s => {
    if (!gameMap[s.gameName]) gameMap[s.gameName] = { plays: 0, wins: 0, mistakes: 0 };
    gameMap[s.gameName].plays += 1;
    if (s.won) gameMap[s.gameName].wins += 1;
    gameMap[s.gameName].mistakes += s.mistakes;
  });

  const aggregatedGames = Object.keys(gameMap).map(name => ({
    name,
    plays: gameMap[name].plays,
    winRate: Math.round((gameMap[name].wins / gameMap[name].plays) * 100),
    avgMistakes: (gameMap[name].mistakes / gameMap[name].plays).toFixed(1)
  })).sort((a, b) => b.plays - a.plays);

  // Render specific game drill-down
  if (selectedGame) {
    const specificStats = stats.filter(s => s.gameName === selectedGame);
    const statsWithFirstAction = specificStats.filter(s => typeof s.timeToFirstAction === 'number');
    const avgFirstAction = statsWithFirstAction.length > 0 
      ? Math.round(statsWithFirstAction.reduce((acc, s) => acc + s.timeToFirstAction!, 0) / statsWithFirstAction.length) 
      : 0;

    const trapCounts: Record<string, number> = {};
    specificStats.forEach(s => {
      if (s.wrongGuesses && Array.isArray(s.wrongGuesses)) {
        s.wrongGuesses.forEach(guess => {
          let guessStr = '';
          if (typeof guess === 'string') guessStr = guess;
          else if (Array.isArray(guess)) guessStr = guess.join(' ➔ ');
          else guessStr = JSON.stringify(guess);
          
          if (guessStr) {
            trapCounts[guessStr] = (trapCounts[guessStr] || 0) + 1;
          }
        });
      }
    });
    const topTraps = Object.entries(trapCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
      <div className={styles.appContainer}>
        <header className={styles.header}>
          <button onClick={() => setSelectedGame(null)} className={styles.iconBtn} aria-label="Go Back"><ChevronLeft size={20} /></button>
          <h1 className={styles.headerTitle}><Target size={20} /> {selectedGame} Insights</h1>
          <div className={styles.headerSpacer}></div>
        </header>
        <main className={styles.main}>
          <section>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> Telemetry</h2>
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}><div className={styles.kpiValue}>{avgFirstAction}s</div><div className={styles.kpiLabel}>Avg. Comprehension Time</div></div>
              <div className={styles.kpiCard}><div className={styles.kpiValue}>{specificStats.length}</div><div className={styles.kpiLabel}>Total Plays Analyzed</div></div>
            </div>
          </section>
          <section>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} /> The "Trap" Metric</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Path / Guess</th><th>Users Trapped</th></tr></thead>
                <tbody>
                  {topTraps.length > 0 ? topTraps.map(([trap, count]) => (
                    <tr key={trap}><td style={{ fontFamily: 'var(--font-mono)' }}>{trap}</td><td><span className={`${styles.badge} ${styles.badgeLoss}`}>{count}</span></td></tr>
                  )) : <tr><td colSpan={2} style={{ textAlign: 'center', padding: '24px' }}>No traps recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.iconBtn}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className={styles.headerTitle}>
          <BarChart2 size={20} /> Global Analytics
        </h1>
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.main}>
        <section>
          <h2 className={styles.sectionTitle}>Platform Overview</h2>
          <div className={styles.kpiGrid}>
            <div className={`${styles.kpiCard} ${styles.kpiCardHighlight}`}>
              <div className={styles.kpiValue}>{globalWinRate}%</div>
              <div className={styles.kpiLabel}>Global Win Rate</div>
            </div>
            <div className={styles.kpiCard}><div className={styles.kpiValue}>{totalPlays}</div><div className={styles.kpiLabel}>Total Sessions</div></div>
            <div className={styles.kpiCard}><div className={styles.kpiValue}>{normalPlays}</div><div className={styles.kpiLabel}>Organic Plays</div></div>
            <div className={styles.kpiCard}><div className={styles.kpiValue}>{playtestPlays}</div><div className={styles.kpiLabel}>Playtest Sessions</div></div>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Game Performance</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Game</th><th>Plays</th><th>Win Rate</th><th>Avg Mistakes</th></tr>
              </thead>
              <tbody>
                {aggregatedGames.map(g => (
                  <tr key={g.name} onClick={() => setSelectedGame(g.name)} style={{ cursor: 'pointer' }} title={`View ${g.name} insights`}>
                    <td>{g.name}</td>
                    <td>{g.plays}</td>
                    <td><span className={`${styles.badge} ${g.winRate >= 50 ? styles.badgeWin : styles.badgeLoss}`}>{g.winRate}%</span></td>
                    <td>{g.avgMistakes}</td>
                  </tr>
                ))}
                {aggregatedGames.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No data collected yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
