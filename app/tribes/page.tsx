"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Users, ShieldAlert, Plus, LogIn, X, Activity, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';

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
        setMyTribes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching tribes:", error);
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
        createdAt: serverTimestamp()
      });
      // Navigate to the new tribe page to show immediate success
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
      
      // Navigate to the joined tribe page
      setActiveModal('none');
      router.push(`/tribes/${tribeDoc.id}`);
    } catch (error) {
      setActionStatus('Error joining Tribe.');
    }
  };

  if (loading || fetching) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>Loading Tribes...</div>;

  if (!user || !profile?.isVerified) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', padding: '24px', textAlign: 'center', fontFamily: 'var(--font-official)' }}>
        <ShieldAlert size={48} color="var(--accent-crimson)" style={{ margin: '0 auto 16px' }} />
        <h2>Verification Required</h2>
        <p style={{ opacity: 0.8, marginBottom: '24px' }}>You must be a verified human to create or join private leaderboards.</p>
        <Link href="/verify" style={{ padding: '12px 24px', backgroundColor: 'var(--ink-main)', color: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}>Verify Account</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px', fontFamily: 'var(--font-official)' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <Link href="/" style={{ padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', color: 'var(--ink-main)', textDecoration: 'none', border: '1px solid var(--border-ink)' }}><ChevronLeft size={20} /></Link>
        <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={24} /> My Tribes</h1>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => setActiveModal('create')} style={{ flex: 1, padding: '14px', backgroundColor: 'var(--ink-main)', color: 'var(--bg-paper)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-ink)', transition: 'transform 0.1s' }}>
          <Plus size={18} /> Create Tribe
        </button>
        <button onClick={() => setActiveModal('join')} style={{ flex: 1, padding: '14px', backgroundColor: 'var(--bg-card)', color: 'var(--ink-main)', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: 'var(--shadow-ink)', transition: 'transform 0.1s' }}>
          <LogIn size={18} /> Join Tribe
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {myTribes.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-ink)', opacity: 0.7 }}>
             <Users size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
             <p style={{ margin: 0, fontWeight: 600 }}>You aren't in any tribes yet.</p>
             <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Create or join one to start competing.</p>
           </div>
        ) : (
          myTribes.map(tribe => (
            <Link key={tribe.id} href={`/tribes/${tribe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.1s ease', boxShadow: 'var(--shadow-ink)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: '20px', margin: '0 0 4px 0', fontFamily: 'var(--font-official)' }}>{tribe.name}</h2>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.7, fontStyle: 'italic' }}>"{tribe.tagline || 'Proving who has the sharpest mind.'}"</p>
                  </div>
                  <div style={{ padding: '8px', backgroundColor: 'var(--bg-paper)', borderRadius: '50%', border: '1px solid var(--border-ink)' }}><ArrowRight size={16} /></div>
                </div>
                <div style={{ display: 'flex', gap: '16px', borderTop: '1px dashed var(--border-ink)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}><Users size={14} /> {tribe.members.length} MEMBERS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-viridian)' }}><Activity size={14} /> ACTIVE</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Action Modals */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(24, 22, 20, 0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} style={{ backgroundColor: 'var(--bg-paper)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', border: '1px solid var(--border-ink)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeModal === 'create' ? <Plus size={20} /> : <LogIn size={20} />} 
                  {activeModal === 'create' ? 'Create Tribe' : 'Join Tribe'}
                </h2>
                <button onClick={() => { setActiveModal('none'); setActionStatus(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)' }}><X size={20} /></button>
              </div>
              
              {actionStatus && <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: 'var(--wash-crimson)', color: 'var(--accent-crimson)', border: '1px solid var(--accent-crimson)', textAlign: 'center', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 600 }}>{actionStatus}</div>}

              {activeModal === 'create' ? (
                <form onSubmit={handleCreateTribe}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink-light)' }}>TRIBE NAME</label>
                  <input type="text" placeholder="e.g., The Code Breakers" value={newTribeName} onChange={e => setNewTribeName(e.target.value)} required style={{ width: '100%', padding: '14px', marginBottom: '24px', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--ink-main)', fontSize: '16px', outline: 'none' }} />
                  <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: 'var(--ink-main)', color: 'var(--bg-paper)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Form Tribe</button>
                </form>
              ) : (
                <form onSubmit={handleJoinTribe}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink-light)' }}>INVITE CODE</label>
                  <input type="text" placeholder="e.g., A1B2C3" value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value)} required style={{ width: '100%', padding: '14px', marginBottom: '24px', border: '1px solid var(--border-ink)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--ink-main)', fontSize: '20px', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', outline: 'none' }} />
                  <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: 'var(--wash-viridian)', color: 'var(--accent-viridian)', border: '1px solid var(--accent-viridian)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>Enter Tribe</button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}