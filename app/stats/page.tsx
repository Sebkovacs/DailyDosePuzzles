"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, BarChart2, AlertCircle, ShieldCheck, ShieldAlert, Brain, Award, Target, Flame, Compass, Lock, Link2, BookOpen, Crown, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
        // Fetch from NoSQL Firestore instead of strict Data Connect
        const q = query(
          collection(db, 'gameStats'), 
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FetchedStat[];
        // Sort by date descending natively on the client
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setStats(data);
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
    if (name.includes('lexicon')) return styles.badgeLexicon;
    if (name.includes('vault')) return styles.badgeVault;
    if (name.includes('split')) return styles.badgeSplit;
    return '';
  };

  // Cognitive Profile Calculation
  const getCategoryStats = (gamePrefix: string) => {
    const categoryStats = stats.filter(s => s.gameName.toLowerCase().includes(gamePrefix.toLowerCase()));
    const plays = categoryStats.length;
    const wins = categoryStats.filter(s => s.won).length;
    // Mastery XP Formula: Wins give heavily weighted XP, plus a small bonus for simply playing/learning
    const score = Math.round((wins * 25) + (plays * 5));
    return { plays, wins, score };
  };

  const logic = getCategoryStats('vault');
  const lateral = getCategoryStats('chain');
  const linguistic = getCategoryStats('lexicon');

  const maxScore = Math.max(logic.score, lateral.score, linguistic.score, 100); // Scale relative to their best stat, min 100
  const totalScore = logic.score + lateral.score + linguistic.score;

  let cognitiveTitle = "Initiate";
  if (totalScore > 50) {
    if (logic.score > lateral.score + 50 && logic.score > linguistic.score + 50) cognitiveTitle = "Master Logician";
    else if (lateral.score > logic.score + 50 && lateral.score > linguistic.score + 50) cognitiveTitle = "Creative Savant";
    else if (linguistic.score > logic.score + 50 && linguistic.score > lateral.score + 50) cognitiveTitle = "Silver Tongue";
    else cognitiveTitle = "Renaissance Mind";
  }

  // Achievements Evaluation
  const achievements = [
    { id: 'first_win', title: 'First Win', desc: 'Win your first puzzle.', icon: <Award size={24} color="var(--accent-indigo)" />, unlocked: totalWon > 0 },
    { id: 'flawless', title: 'Flawless', desc: 'Win with zero mistakes.', icon: <Target size={24} color="var(--accent-sanguine)" />, unlocked: stats.some(s => s.won && s.mistakes === 0) },
    { id: 'hot_streak', title: 'Hot Streak', desc: 'Achieve a 7-day streak.', icon: <Flame size={24} color="var(--accent-ochre)" />, unlocked: longestStreak >= 7 },
    { id: 'pioneer', title: 'Pioneer', desc: 'Play a prototype variant.', icon: <Compass size={24} color="var(--accent-viridian)" />, unlocked: stats.some(s => s.isPlayTest) },
    { id: 'safecracker', title: 'Safecracker', desc: 'Win 10 Vault puzzles.', icon: <Lock size={24} color="var(--accent-slate)" />, unlocked: logic.wins >= 10 },
    { id: 'wordsmith', title: 'Wordsmith', desc: 'Win 10 Lexicon puzzles.', icon: <BookOpen size={24} color="var(--accent-teal)" />, unlocked: linguistic.wins >= 10 },
    { id: 'link_master', title: 'Link Master', desc: 'Win 10 Chain puzzles.', icon: <Link2 size={24} color="var(--accent-umber)" />, unlocked: lateral.wins >= 10 },
    { id: 'dedicated', title: 'Dedicated', desc: 'Play 100 total games.', icon: <Crown size={24} color="var(--accent-crimson)" />, unlocked: totalPlayed >= 100 },
  ];

  // Game by Game Breakdown
  const gameBreakdown: Record<string, { plays: number, wins: number, mistakes: number }> = {};
  stats.forEach(s => {
    if (!gameBreakdown[s.gameName]) gameBreakdown[s.gameName] = { plays: 0, wins: 0, mistakes: 0 };
    gameBreakdown[s.gameName].plays += 1;
    if (s.won) gameBreakdown[s.gameName].wins += 1;
    gameBreakdown[s.gameName].mistakes += s.mistakes;
  });

  const breakdownList = Object.keys(gameBreakdown).map(name => ({
    name,
    plays: gameBreakdown[name].plays,
    winRate: Math.round((gameBreakdown[name].wins / gameBreakdown[name].plays) * 100),
    avgMistakes: (gameBreakdown[name].mistakes / gameBreakdown[name].plays).toFixed(1)
  })).sort((a, b) => b.plays - a.plays);

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.iconBtn}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className={styles.headerTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} /> Statistics {profile?.isVerified && <ShieldCheck size={20} color="var(--accent-viridian)" title="Verified Player" />}
        </h1>
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.main}>
        {!profile?.isVerified && (
          <section style={{ backgroundColor: 'var(--wash-crimson)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-crimson)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-crimson)', fontWeight: 700 }}>
              <ShieldAlert size={20} /> Unverified Account
            </div>
            <p style={{ fontSize: '14px', margin: 0, color: 'var(--ink-main)', lineHeight: 1.5 }}>
              Link your phone number to prove you are human. Verified players unlock Tribes, Global Leaderboards, and exclusive rewards.
            </p>
            <Link href="/verify" style={{ backgroundColor: 'var(--accent-crimson)', color: 'white', padding: '10px 16px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 600, textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
              Verify Now
            </Link>
          </section>
        )}

        {/* Cognitive Profile Section */}
        <section className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {profile?.displayName ? profile.displayName.charAt(0) : user.email?.charAt(0) || <Brain size={28} />}
            </div>
            <div className={styles.profileTitleGroup}>
              <h2 className={styles.profileName}>{profile?.displayName || user.email?.split('@')[0] || 'Player'}</h2>
              <div className={styles.profileTitle}>{cognitiveTitle}</div>
            </div>
          </div>
          
          <div className={styles.cognitiveBars}>
            <div className={styles.cognitiveRow}>
              <div className={styles.cognitiveLabels}>
                <span>Logic & Deduction</span>
                <span className={styles.cognitiveScore}>{logic.score} XP</span>
              </div>
              <div className={styles.cognitiveBarTrack}>
                <div className={`${styles.cognitiveBarFill} ${styles.fillLogic}`} style={{ width: `${(logic.score / maxScore) * 100}%` }} />
              </div>
            </div>
            <div className={styles.cognitiveRow}>
              <div className={styles.cognitiveLabels}>
                <span>Lateral Thinking</span>
                <span className={styles.cognitiveScore}>{lateral.score} XP</span>
              </div>
              <div className={styles.cognitiveBarTrack}>
                <div className={`${styles.cognitiveBarFill} ${styles.fillLateral}`} style={{ width: `${(lateral.score / maxScore) * 100}%` }} />
              </div>
            </div>
            <div className={styles.cognitiveRow}>
              <div className={styles.cognitiveLabels}>
                <span>Linguistics & Deceit</span>
                <span className={styles.cognitiveScore}>{linguistic.score} XP</span>
              </div>
              <div className={styles.cognitiveBarTrack}>
                <div className={`${styles.cognitiveBarFill} ${styles.fillLing}`} style={{ width: `${(linguistic.score / maxScore) * 100}%` }} />
              </div>
            </div>
          </div>
        </section>

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

        {/* Achievements Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          <div className={styles.achievementsGrid}>
            {achievements.map(achievement => (
              <div key={achievement.id} className={`${styles.achievementBadge} ${achievement.unlocked ? styles.unlocked : styles.locked}`}>
                <div className={styles.achievementIcon}>{achievement.icon}</div>
                <h3 className={styles.achievementTitle}>{achievement.title}</h3>
                <p className={styles.achievementDesc}>{achievement.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Game by Game Breakdown */}
        {breakdownList.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gamepad2 size={20} /> Detailed Breakdown
            </h2>
            <div className={styles.breakdownList}>
              {breakdownList.map(game => (
                <div key={game.name} className={styles.breakdownItem}>
                  <div className={styles.breakdownHeader}>
                    <span className={`${styles.gameOutcome} ${getBadgeClass(game.name)}`}>{game.name}</span>
                    <span className={styles.breakdownPlays}>{game.plays} Session{game.plays === 1 ? '' : 's'}</span>
                  </div>
                  <div className={styles.breakdownMetrics}>
                    <div className={styles.breakdownMetric}>
                      <span className={styles.metricLabel}>Win Rate</span>
                      <span className={`${styles.metricValue} ${game.winRate >= 50 ? styles.textWin : styles.textLoss}`}>{game.winRate}%</span>
                    </div>
                    <div className={styles.breakdownMetric}>
                      <span className={styles.metricLabel}>Avg. Mistakes</span>
                      <span className={styles.metricValue}>{game.avgMistakes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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