"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Crown, Medal, Users, Target, Copy, CheckCircle2, Plus, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import styles from './page.module.css';

export default function TribePage() {
  const { user, loading } = useAuth();
  const params = useParams<{ id: string }>();
  const tribeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [tribe, setTribe] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;
      if (!tribeId) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/tribes/${tribeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError('Failed to load Tribe. You may not have access.');
          return;
        }
        const data = await res.json();
        setTribe(data.tribe);
        setLeaderboard(data.leaderboard);
      } catch (e) {
        setError('Network Error.');
      }
    };
    if (!loading) fetchLeaderboard();
  }, [user, loading, tribeId]);

  if (loading || (!tribe && !error)) return <div className={styles.loading}>Loading Leaderboard...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={20} color="var(--color-game-ochre)" />;
    if (index === 1) return <Medal size={20} color="var(--color-text-secondary)" />;
    if (index === 2) return <Medal size={20} color="var(--color-warning)" />;
    return <span className={styles.rankNumber}>{index + 1}</span>;
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(tribe.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalWins = leaderboard.reduce((acc, player) => acc + player.wins, 0);
  const totalPlays = leaderboard.reduce((acc, player) => acc + player.plays, 0);
  const winRate = totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/tribes" className={styles.backLink}><ChevronLeft size={20} /></Link>
        <h1 className={styles.title}>{tribe.name}</h1>
      </header>

      <div className={styles.taglineWrap}>
        <p className={styles.tagline}>"{tribe.tagline || 'Only the sharpest minds survive here.'}"</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Users size={20} className={styles.statIconMembers} />
          <div className={styles.statValue}>{tribe.members.length}</div>
          <div className={styles.statLabel}>Members</div>
        </div>
        <div className={styles.statCard}>
          <Trophy size={20} className={styles.statIconWins} />
          <div className={styles.statValue}>{totalWins}</div>
          <div className={styles.statLabel}>Total Wins</div>
        </div>
        <div className={styles.statCard}>
          <Target size={20} className={styles.statIconAccuracy} />
          <div className={styles.statValue}>{winRate}%</div>
          <div className={styles.statLabel}>Accuracy</div>
        </div>
      </div>

      <div className={styles.inviteAction}>
        <button onClick={() => setShowInvite(true)} className={styles.inviteBtn}>
          <Plus size={16} /> Invite Members
        </button>
      </div>

      <div className={styles.board}>
        <div className={styles.boardHeader}>
          <Trophy size={18} /> Global Wins Leaderboard
        </div>
        <div className={styles.rows}>
          {leaderboard.map((player, idx) => (
            <div key={player.uid} className={`${styles.row} ${player.uid === user?.uid ? styles.rowCurrent : ''}`}>
              <div className={styles.rankWrap}>{getRankIcon(idx)}</div>
              <div className={`${styles.playerName} ${player.uid === user?.uid ? styles.playerNameCurrent : ''}`}>
                {player.name} {player.uid === user?.uid && '(You)'}
              </div>
              <div className={styles.scoreWrap}>
                <span className={styles.scoreWins}>{player.wins} <span className={styles.scoreUnit}>W</span></span>
                <span className={styles.scorePlays}>{player.plays} plays</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.overlay}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className={styles.modal}>
              <div className={styles.modalCloseWrap}>
                <button onClick={() => setShowInvite(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <h3 className={styles.modalTitle}>Share Invite Code</h3>
              <div className={styles.codeBox}>{tribe.inviteCode}</div>
              <button onClick={handleCopyInvite} className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : styles.copyBtnDefault}`}>
                {copied ? <><CheckCircle2 size={18} /> Copied to Clipboard</> : <><Copy size={18} /> Copy Code</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
