"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Settings, Check, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getArenaQueue, updateArenaPuzzleStatus, ArenaPuzzle } from '@/lib/arena';
import styles from './Arena.module.css';

export default function AdminArenaPage() {
  const { profile, loading } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'Chain' | 'Vault'>('Chain');
  const [queue, setQueue] = useState<ArenaPuzzle[]>([]);
  const [fetching, setFetching] = useState(false);

  // Generator State
  const [count, setCount] = useState(5);
  const [constraints, setConstraints] = useState('');
  const [generating, setGenerating] = useState(false);

  const loadQueue = async (gameName: string) => {
    setFetching(true);
    try {
      const data = await getArenaQueue(gameName);
      setQueue(data);
    } catch (error) {
      console.error("Failed to load queue", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadQueue(activeTab);
    }
  }, [isAdmin, activeTab]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/arena/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName: activeTab, count, constraints })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`Successfully generated ${data.variants.length} variants!`);
        setConstraints(''); // Clear constraints after successful generation
        loadQueue(activeTab);
      } else {
        alert(`Generation failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Generation error", error);
      alert("Failed to trigger generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'graduated' | 'rejected') => {
    try {
      await updateArenaPuzzleStatus(id, status);
      setQueue(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(`Failed to update status to ${status}`, error);
    }
  };

  if (loading) return <div className={styles.deniedContainer}>Loading...</div>;

  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <h1 className={styles.deniedTitle}>Access Denied</h1>
        <p className={styles.deniedText}>Admin privileges required to view the Testing Arena.</p>
        <Link href="/" className={styles.returnHomeBtn}>Return Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Link href="/admin" className={styles.iconBtn}>
          <ChevronLeft size={24} />
        </Link>
        <h1 className={styles.headerTitle}>
          <Settings size={24} /> Testing Arena
        </h1>
      </header>

      <main className={styles.main}>
        {/* Generator Controls */}
        <section className={styles.generatorSection}>
          <h2 className={styles.sectionTitle}>
            <Play size={18} /> Generate Batch
          </h2>
          
          <div className={styles.tabs}>
            {(['Chain', 'Vault'] as const).map(game => (
              <button key={game} onClick={() => setActiveTab(game)} className={`${styles.tabBtn} ${activeTab === game ? styles.tabBtnActive : ''}`}>
                {game}
              </button>
            ))}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Variant Count</label>
            <input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className={styles.input} min={1} max={20} />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>AI Injection Constraints</label>
            <textarea value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="e.g., 'Make sure Rule 3 uniquely isolates the second digit...'" className={styles.textarea} />
          </div>

          <button onClick={handleGenerate} disabled={generating} className={styles.generateBtn}>
            {generating ? <RefreshCw className={styles.spin} size={18} /> : 'Generate Variants'}
          </button>
        </section>

        {/* Queue Management */}
        <section className={styles.queueSection}>
          <div className={styles.queueHeader}>
            <h2 className={styles.queueTitle}>Active {activeTab} Queue</h2>
            <button onClick={() => loadQueue(activeTab)} className={styles.refreshBtn}>
              <RefreshCw size={14} className={fetching ? styles.spin : ""} /> Refresh
            </button>
          </div>

          <div className={styles.queueList}>
            {queue.length === 0 && !fetching && <div className={styles.emptyQueue}>No variants in the testing queue for {activeTab}. Generate a new batch!</div>}
            
            {queue.map(puzzle => (
              <div key={puzzle.id} className={styles.queueItem}>
                <div className={styles.itemContent}>
                  <div className={styles.batchId}>Batch: {puzzle.batchId}</div>
                  <pre className={styles.jsonPreview}>{JSON.stringify(puzzle.data, null, 2)}</pre>
                </div>
                <div className={styles.itemActions}>
                  <button onClick={() => handleStatusUpdate(puzzle.id!, 'graduated')} className={`${styles.actionBtn} ${styles.btnGraduate}`}><Check size={16} /> Graduate</button>
                  <button onClick={() => handleStatusUpdate(puzzle.id!, 'rejected')} className={`${styles.actionBtn} ${styles.btnReject}`}><X size={16} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}