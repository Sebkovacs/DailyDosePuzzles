"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Shield, User as UserIcon, Beaker, Plus, Trash2, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import styles from './Admin.module.css';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'tester' | 'user';
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<{email: string}[]>([]);
  const [testers, setTesters] = useState<{email: string}[]>([]);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newTesterEmail, setNewTesterEmail] = useState('');
  
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addingTester, setAddingTester] = useState(false);
  const [fetching, setFetching] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAdmin) return;
      try {
        const uSnap = await getDocs(query(collection(db, 'users'), limit(100)));
        setUsers(uSnap.docs.map(d => d.data() as UserProfile));

        const aSnap = await getDocs(collection(db, 'admins'));
        setAdmins(aSnap.docs.map(d => ({ email: d.id })));

        const tSnap = await getDocs(collection(db, 'playtesters'));
        setTesters(tSnap.docs.map(d => ({ email: d.id })));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading && isAdmin) {
      fetchAdminData();
    }
  }, [loading, isAdmin]);

  const handleRoleChange = async (uid: string, newRole: 'user' | 'tester' | 'admin') => {
    if (uid === user?.uid) {
      const confirmSelf = confirm(
        "WARNING: If you change your own role to anything other than 'Admin', you will instantly be locked out of this dashboard. Proceed?"
      );
      if (!confirmSelf) return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setAddingAdmin(true);
    try {
      const emailLower = newAdminEmail.toLowerCase();
      await setDoc(doc(db, 'admins', emailLower), { addedAt: serverTimestamp() });
      setAdmins([...admins, { email: emailLower }]);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
    }
    setAddingAdmin(false);
  };

  const handleRemoveAdmin = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'admins', email));
      setAdmins(admins.filter(a => a.email !== email));
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const handleAddTester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTesterEmail) return;
    setAddingTester(true);
    try {
      const emailLower = newTesterEmail.toLowerCase();
      await setDoc(doc(db, 'playtesters', emailLower), { addedAt: serverTimestamp() });
      setTesters([...testers, { email: emailLower }]);
      setNewTesterEmail('');
    } catch (error) {
      console.error('Error adding tester:', error);
    }
    setAddingTester(false);
  };

  const handleRemoveTester = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'playtesters', email));
      setTesters(testers.filter(t => t.email !== email));
    } catch (error) {
      console.error('Error removing tester:', error);
    }
  };

  if (loading || fetching) return <div className={styles.loading}>Loading Admin Data...</div>;

  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <h1 className={styles.deniedTitle}>Access Denied</h1>
        <p className={styles.deniedText}>Admin privileges required.</p>
        <Link href="/" className={styles.actionBtn}>Return Home</Link>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <Link href="/" className={styles.iconBtn}>
          <ChevronLeft size={20} />
        </Link>
        <h1 className={styles.headerTitle}>
          <Shield size={20} /> Admin
        </h1>
        <Link href="/admin/analytics" className={styles.analyticsBtn}>
          <BarChart2 size={14} /> Analytics
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardHeader}><Shield size={16} /> Pre-Authorized Admins</h2>
          <form onSubmit={handleAddAdmin} className={styles.formGroup}>
            <input
              type="email"
              placeholder="admin@example.com"
              value={newAdminEmail}
              onChange={e => setNewAdminEmail(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.actionBtn} disabled={addingAdmin || !newAdminEmail}>
              <Plus size={16} /> Add
            </button>
          </form>
          <div className={styles.adminList}>
            {admins.map(a => (
              <div key={a.email} className={styles.adminItem}>
                <span className={styles.adminEmail}>{a.email}</span>
                <button onClick={() => handleRemoveAdmin(a.email)} className={styles.removeBtn} aria-label="Remove admin"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardHeader}><Beaker size={16} /> Pre-Authorized Playtesters</h2>
          <form onSubmit={handleAddTester} className={styles.formGroup}>
            <input
              type="email"
              placeholder="tester@example.com"
              value={newTesterEmail}
              onChange={e => setNewTesterEmail(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.actionBtn} disabled={addingTester || !newTesterEmail}>
              <Plus size={16} /> Add
            </button>
          </form>
          <div className={styles.adminList}>
            {testers.map(t => (
              <div key={t.email} className={styles.adminItem}>
                <span className={styles.adminEmail}>{t.email}</span>
                <button onClick={() => handleRemoveTester(t.email)} className={styles.removeBtn} aria-label="Remove tester"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardHeader}><UserIcon size={16} /> User Management</h2>
          <div className={styles.userList}>
            {users.map(u => (
              <div key={u.uid} className={styles.userCard}>
                <div className={styles.userInfoRow}>
                  <div>
                    <div className={styles.userName}>{u.displayName || 'Anonymous'}</div>
                    <div className={styles.userEmail}>{u.email || 'No email'}</div>
                  </div>
                  <div className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleBadgeAdmin : u.role === 'tester' ? styles.roleBadgeTester : ''}`}>
                    {u.role}
                  </div>
                </div>
                <div className={styles.roleActions}>
                  <button 
                    onClick={() => handleRoleChange(u.uid, 'user')}
                    className={`${styles.roleBtn} ${u.role === 'user' ? styles.roleBtnActiveUser : ''}`}
                  >
                    User
                  </button>
                  <button 
                    onClick={() => handleRoleChange(u.uid, 'tester')}
                    className={`${styles.roleBtn} ${u.role === 'tester' ? styles.roleBtnActiveTester : ''}`}
                  >
                    Tester
                  </button>
                  <button 
                    onClick={() => handleRoleChange(u.uid, 'admin')}
                    className={`${styles.roleBtn} ${u.role === 'admin' ? styles.roleBtnActiveAdmin : ''}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
