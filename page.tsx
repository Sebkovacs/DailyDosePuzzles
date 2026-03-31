"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trophy, Crown, Medal, User, Star } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function TribePage({ params }: { params: { id: string } }) {
  const { user, profile, loading } = useAuth();
  const [tribe, setTribe] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState('');

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

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'var(--font-official)' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <Link href="/tribes" style={{ padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', color: 'var(--ink-main)', textDecoration: 'none', border: '1px solid var(--border-ink)' }}><ChevronLeft size={20} /></Link>
        <h1 style={{ margin: 0, fontSize: '24px', flex: 1 }}>{tribe.name}</h1>
      </header>

      <div style={{ backgroundColor: 'var(--wash-indigo)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-indigo)', marginBottom: '32px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-indigo)' }}>Invite Code</h3>
        <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', color: 'var(--ink-main)' }}>{tribe.inviteCode}</div>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Share this code with friends to let them join.</p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', overflow: 'hidden', boxShadow: 'var(--shadow-ink)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-ink)', backgroundColor: 'var(--bg-paper)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Trophy size={18} /> Global Wins Leaderboard
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaderboard.map((player, idx) => (
            <div key={player.uid} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: idx !== leaderboard.length - 1 ? '1px solid var(--border-ink)' : 'none', backgroundColor: player.uid === user?.uid ? 'var(--wash-viridian)' : 'transparent' }}>
              {(() => {
                const puzzle = player; // Assuming 'player' is the puzzle object
                const ratings = puzzle.feedback?.map((f: any) => f.rating).filter((r: any) => typeof r === 'number') || [];
                const avgRating = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) : null;
                return avgRating !== null && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '12px', color: 'var(--accent-ochre)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px' }}><Star size={14} fill="var(--accent-ochre)" />{avgRating.toFixed(1)}</div>
              })()}
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
    </div>
  );
}