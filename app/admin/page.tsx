"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import { Wand2, BarChart2, Activity, ShieldAlert, ChevronLeft, ArrowRight, Users, UserPlus, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import styles from './Admin.module.css';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const [gameName, setGameName] = useState('Vault');
 const [count, setCount] = useState(3);
  const [constraints, setConstraints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [playtesters, setPlaytesters] = useState<string[]>([]);
  const [newTesterEmail, setNewTesterEmail] = useState('');
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [queueStats, setQueueStats] = useState<{ count: number; lastGenerated: string | null } | null>(null);
  const [fetchingQueueStats, setFetchingQueueStats] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchQueueStats = async () => {
      if (!isAdmin) return;
      setFetchingQueueStats(true);
      setQueueStats(null);
      try {
        const countQuery = query(
          collection(db, 'arenaPuzzles'),
          where('gameName', '==', gameName),
          where('status', '==', 'pending')
        );
        const countSnapshot = await getDocs(countQuery);
        const pendingCount = countSnapshot.size;

        const lastGeneratedQuery = query(
          collection(db, 'arenaPuzzles'),
          where('gameName', '==', gameName),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const lastGeneratedSnapshot = await getDocs(lastGeneratedQuery);
        const lastGeneratedDate = !lastGeneratedSnapshot.empty ? lastGeneratedSnapshot.docs[0].data().createdAt.toDate().toLocaleString() : null;
        
        setQueueStats({ count: pendingCount, lastGenerated: lastGeneratedDate });
      } catch (error) { console.error(`Failed to fetch queue stats for ${gameName}:`, error); }
      setFetchingQueueStats(false);
    };
    fetchQueueStats();
  }, [gameName, isAdmin]);

  useEffect(() => {
    const fetchPlaytesters = async () => {
      setFetchingUsers(true);
      try {
        const snapshot = await getDocs(collection(db, 'playtesters'));
        setPlaytesters(snapshot.docs.map(doc => doc.id));
      } catch (error) {
        console.error('Error fetching playtesters:', error);
      }
      setFetchingUsers(false);
    };
    if (isAdmin && !loading) {
      fetchPlaytesters();
    }
  }, [isAdmin, loading]);

  const handleAddPlaytester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTesterEmail || !newTesterEmail.includes('@')) return;
    const emailLower = newTesterEmail.toLowerCase().trim();
    try {
      await setDoc(doc(db, 'playtesters', emailLower), { addedAt: serverTimestamp() });
      setNewTesterEmail('');
      setPlaytesters(prev => Array.from(new Set([...prev, emailLower])));
    } catch (error) {
      console.error('Error adding playtester:', error);
      alert('Failed to add playtester. Check permissions.');
    }
  };

  const handleRemovePlaytester = async (email: string) => {
    if (!confirm(`Remove ${email} from playtesters?`)) return;
    try {
      await deleteDoc(doc(db, 'playtesters', email));
      setPlaytesters(prev => prev.filter(e => e !== email));
    } catch (error) {
      console.error('Error removing playtester:', error);
      alert('Failed to remove playtester.');
    }
  };

  if (loading) return <div className={styles.loadingCredentials}>Verifying credentials...</div>;

  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <ShieldAlert size={48} className={styles.deniedIcon} />
        <h2>Access Denied</h2>
        <p>Admin privileges required.</p>
        <Link href="/" className={styles.deniedLink}>Return Home</Link>
      </div>
    );
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage('Brewing puzzles...');
    try {
      const res = await fetch('/api/arena/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, count: Number(count), constraints }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Success! Queued ${data.variants.length} new ${gameName} variants (Batch: ${data.batchId.slice(0,6)}...)`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setMessage('Network error. Check console.');
    }
    setIsGenerating(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className={styles.title}>
          <Activity size={24} /> Admin Control Center
        </h1>
      </header>

      <div className={styles.grid}>
        
        {/* AI Generator Panel */}
        <form onSubmit={handleGenerate} className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Wand2 size={20} /> AI Playtest Generator
          </h2>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Target Game / Prototype</label>
            <select value={gameName} onChange={e => setGameName(e.target.value)} className={styles.select}>
              <option value="Vault">Vault (Standard Protocol)</option>
              <option value="VaultBlitz">Vault: Blitz (Timed)</option>
              <option value="VaultCorrupted">Vault: Corrupted (Deception)</option>
              <option value="Chain">Chain (Standard)</option>
              <option value="ChainBlitz">Chain: Blitz (Timed)</option>
              <option value="ChainVersus">Chain: Versus (AI Opponent)</option>
              <option value="Lexicon">Lexicon (Base Game)</option>
              <option value="LexiconBlitz">Lexicon Blitz (10s Timer)</option>
              <option value="LexiconReverse">Lexicon Reverse (Definition First)</option>
              <option value="LexiconPersona">Lexicon Persona (Themed Bluffs)</option>
            </select>
          </div>

          {/* Queue Status Display */}
          <div className={styles.queueStatusBox}>
            {fetchingQueueStats ? (
              <div>Checking queue status...</div>
            ) : queueStats ? (
              <div className={styles.queueStatsGrid}>
                <div><span className={styles.queueStatLabel}>Pending in Queue:</span> {queueStats.count}</div>
                <div><span className={styles.queueStatLabel}>Last Generated:</span> {queueStats.lastGenerated || 'Never'}</div>
              </div>
            ) : (
              <div>Could not load queue status.</div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.rangeLabel}>
              <span>Batch Size</span>
              <span className={styles.rangeValue}>{count} Puzzles</span>
            </label>
            <input type="range" min="1" max="20" value={count} onChange={e => setCount(parseInt(e.target.value))} className={styles.rangeInput} />
          </div>

          <div className={`${styles.inputGroup} ${styles.inputGroupSpaced}`}>
            <label className={styles.label}>AI Constraints (Optional)</label>
            <textarea value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="e.g. Make the definitions pirate-themed..." className={styles.textarea} />
          </div>

          <button type="submit" disabled={isGenerating} className={styles.submitButton}>
            <Wand2 size={18} /> {isGenerating ? 'Generating Variants...' : 'Queue Generation'}
          </button>
          {message && <div className={`${styles.message} ${message.includes('Error') ? styles.messageError : styles.messageSuccess}`}>{message}</div>}
        </form>

        {/* Playtester Management Panel */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Users size={20} /> Playtester Management
          </h2>
          
          <form onSubmit={handleAddPlaytester} className={styles.addForm}>
            <input type="email" value={newTesterEmail} onChange={e => setNewTesterEmail(e.target.value)} placeholder="Email address" className={styles.emailInput} />
            <button type="submit" disabled={!newTesterEmail.includes('@')} className={styles.addButton}>
              <UserPlus size={16} /> Add
            </button>
          </form>

          <div>
            <h3 className={styles.subheading}>Active Playtesters</h3>
            {fetchingUsers ? (
              <div className={styles.emptyMessage}>Loading...</div>
            ) : playtesters.length === 0 ? (
              <div className={styles.emptyMessage}>No playtesters added.</div>
            ) : (
              <ul className={styles.userList}>
                {playtesters.map(email => (
                  <li key={email} className={styles.userItem}>
                    <span className={styles.userEmail}>{email}</span>
                    <button onClick={() => handleRemovePlaytester(email)} className={styles.removeButton} title="Remove playtester">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.linksSection}>
          <Link href="/admin/analytics" className={styles.navLink}>
            <h2 className={styles.panelTitle}><BarChart2 size={20} /> X-Ray Analytics</h2>
            <p className={styles.navLinkDesc}>View high-fidelity player telemetry, global win rates, and deep trap metrics. <ArrowRight size={16} /></p>
          </Link>
        </section>
      </div>
    </div>
  );
}