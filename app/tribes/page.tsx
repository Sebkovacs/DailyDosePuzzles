"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Users, ShieldAlert, Plus, LogIn, X, Activity, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import styles from './page.module.css';

export default function TribesHub() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [myTribes, setMyTribes] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const [newTribeName, setNewTribeName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const [activeModal, setActiveModal] = useState<'none' | 'create' | 'join'>('none');

  useEffect(() => {
    const fetchMyTribes = async () => {
      if (!user || !profile?.isVerified) {
        setFetching(false);
        return;
      }
      try {
        const q = query(collection(db, 'tribes'), where('members', 'array-contains', user.uid));
        const snap = await getDocs(q);
        setMyTribes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching tribes:', error);
      }
      setFetching(false);
    };
    if (!loading) fetchMyTribes();
  }, [user, profile, loading]);

  const handleCreateTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTribeName.trim()) return;
    setActionStatus('Creating...');
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const tribeRef = await addDoc(collection(db, 'tribes'), {
        name: newTribeName.trim(),
        ownerId: user.uid,
        members: [user.uid],
        inviteCode: code,
        createdAt: serverTimestamp(),
      });
      setActiveModal('none');
      router.push(`/tribes/${tribeRef.id}`);
    } catch (error) {
      setActionStatus('Error creating Tribe.');
    }
  };

  const handleJoinTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCodeInput.trim()) return;
    setActionStatus('Joining...');
    try {
      const cleanCode = inviteCodeInput.trim().toUpperCase();
      const q = query(collection(db, 'tribes'), where('inviteCode', '==', cleanCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        setActionStatus('Invalid Invite Code.');
        return;
      }
      const tribeDoc = snap.docs[0];
      await updateDoc(doc(db, 'tribes', tribeDoc.id), { members: arrayUnion(user.uid) });
      setActiveModal('none');
      router.push(`/tribes/${tribeDoc.id}`);
    } catch (error) {
      setActionStatus('Error joining Tribe.');
    }
  };

  if (loading || fetching) return <div className={styles.loading}>Loading Tribes...</div>;

  if (!user || !profile?.isVerified) {
    return (
      <div className={styles.gateWrap}>
        <ShieldAlert size={48} className={styles.gateIcon} />
        <h2>Verification Required</h2>
        <p className={styles.gateText}>You must be a verified human to create or join private leaderboards.</p>
        <Link href="/verify" className={styles.gateLink}>Verify Account</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}><ChevronLeft size={20} /></Link>
        <h1 className={styles.title}><Users size={24} /> My Tribes</h1>
      </header>

      <div className={styles.actions}>
        <button onClick={() => setActiveModal('create')} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
          <Plus size={18} /> Create Tribe
        </button>
        <button onClick={() => setActiveModal('join')} className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
          <LogIn size={18} /> Join Tribe
        </button>
      </div>

      <div className={styles.list}>
        {myTribes.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={32} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>You aren't in any tribes yet.</p>
            <p className={styles.emptySub}>Create or join one to start competing.</p>
          </div>
        ) : (
          myTribes.map((tribe) => (
            <Link key={tribe.id} href={`/tribes/${tribe.id}`} className={styles.tribeLink}>
              <div className={styles.tribeCard}>
                <div className={styles.tribeTop}>
                  <div>
                    <h2 className={styles.tribeName}>{tribe.name}</h2>
                    <p className={styles.tribeTagline}>"{tribe.tagline || 'Proving who has the sharpest mind.'}"</p>
                  </div>
                  <div className={styles.arrowBubble}><ArrowRight size={16} /></div>
                </div>
                <div className={styles.metrics}>
                  <div className={`${styles.metric} ${styles.metricMembers}`}><Users size={14} /> {tribe.members.length} MEMBERS</div>
                  <div className={`${styles.metric} ${styles.metricActive}`}><Activity size={14} /> ACTIVE</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.overlay}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {activeModal === 'create' ? <Plus size={20} /> : <LogIn size={20} />}
                  {activeModal === 'create' ? 'Create Tribe' : 'Join Tribe'}
                </h2>
                <button onClick={() => { setActiveModal('none'); setActionStatus(''); }} className={styles.closeBtn}><X size={20} /></button>
              </div>

              {actionStatus && <div className={styles.statusBox}>{actionStatus}</div>}

              {activeModal === 'create' ? (
                <form onSubmit={handleCreateTribe}>
                  <label className={styles.formLabel}>TRIBE NAME</label>
                  <input type="text" placeholder="e.g., The Code Breakers" value={newTribeName} onChange={(e) => setNewTribeName(e.target.value)} required className={styles.formInput} />
                  <button type="submit" className={`${styles.submitBtn} ${styles.submitPrimary}`}>Form Tribe</button>
                </form>
              ) : (
                <form onSubmit={handleJoinTribe}>
                  <label className={styles.formLabel}>INVITE CODE</label>
                  <input type="text" placeholder="e.g., A1B2C3" value={inviteCodeInput} onChange={(e) => setInviteCodeInput(e.target.value)} required className={`${styles.formInput} ${styles.formInputCode}`} />
                  <button type="submit" className={`${styles.submitBtn} ${styles.submitSecondary}`}>Enter Tribe</button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}