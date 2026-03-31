"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trophy, Crown, Medal, User, Users, Target, Copy, CheckCircle2, Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function TribePage({ params }: { params: { id: string } }) {
  const { user, profile, loading } = useAuth();
  const [tribe, setTribe] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/tribes/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
  }, [user, loading, params.id]);

  if (loading || (!tribe && !error)) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>Loading Leaderboard...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-crimson)', fontFamily: 'var(--font-official)' }}>{error}</div>;

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={20} color="var(--accent-ochre)" />;
    if (index === 1) return <Medal size={20} color="var(--ink-light)" />;
    if (index === 2) return <Medal size={20} color="var(--accent-umber)" />;
    return <span style={{ width: '20px', textAlign: 'center', fontWeight: 700, opacity: 0.5 }}>{index + 1}</span>;
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
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'var(--font-official)' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <Link href="/tribes" style={{ padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', color: 'var(--ink-main)', textDecoration: 'none', border: '1px solid var(--border-ink)' }}><ChevronLeft size={20} /></Link>
        <h1 style={{ margin: 0, fontSize: '24px', flex: 1 }}>{tribe.name}</h1>
      </header>

      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '16px', fontStyle: 'italic', opacity: 0.8 }}>"{tribe.tagline || 'Only the sharpest minds survive here.'}"</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-ink)' }}>
          <Users size={20} color="var(--accent-indigo)" />
          <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{tribe.members.length}</div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Members</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-ink)' }}>
          <Trophy size={20} color="var(--accent-ochre)" />
          <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{totalWins}</div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Total Wins</div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-ink)' }}>
          <Target size={20} color="var(--accent-sanguine)" />
          <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{winRate}%</div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Accuracy</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <button onClick={() => setShowInvite(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-viridian)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Invite Members
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', overflow: 'hidden', boxShadow: 'var(--shadow-ink)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-ink)', backgroundColor: 'var(--bg-paper)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Trophy size={18} /> Global Wins Leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaderboard.map((player, idx) => (
            <div key={player.uid} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: idx !== leaderboard.length - 1 ? '1px solid var(--border-ink)' : 'none', backgroundColor: player.uid === user?.uid ? 'var(--wash-viridian)' : 'transparent' }}>
              <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getRankIcon(idx)}</div>
              <div style={{ flex: 1, fontWeight: player.uid === user?.uid ? 800 : 600 }}>{player.name} {player.uid === user?.uid && '(You)'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{player.wins} <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.5 }}>W</span></span>
                <span style={{ fontSize: '11px', opacity: 0.6 }}>{player.plays} plays</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(24, 22, 20, 0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} style={{ backgroundColor: 'var(--bg-paper)', padding: '32px 24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '360px', border: '1px solid var(--border-ink)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)' }}><X size={20} /></button>
              </div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--ink-main)' }}>Share Invite Code</h3>
              <div style={{ backgroundColor: 'var(--wash-indigo)', color: 'var(--accent-indigo)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-indigo)', fontSize: '36px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', marginBottom: '24px' }}>
                {tribe.inviteCode}
              </div>
              <button onClick={handleCopyInvite} style={{ width: '100%', padding: '14px', backgroundColor: copied ? 'var(--wash-viridian)' : 'var(--ink-main)', color: copied ? 'var(--accent-viridian)' : 'var(--bg-paper)', border: copied ? '1px solid var(--accent-viridian)' : 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                {copied ? <><CheckCircle2 size={18} /> Copied to Clipboard</> : <><Copy size={18} /> Copy Code</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}