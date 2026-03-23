'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Shield, User as UserIcon, Beaker, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import styles from './Admin.module.css';
import { Button } from '@/components/Button';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'tester' | 'admin';
  createdAt: unknown;
}

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [newTesterEmail, setNewTesterEmail] = useState('');
  const [addingTester, setAddingTester] = useState(false);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchAdmins = async () => {
      if (!isAdmin) return;
      try {
        const snapshot = await getDocs(collection(db, 'admins'));
        setAdminEmails(snapshot.docs.map(doc => doc.id));
      } catch (error) {
        console.error('Error fetching admin emails:', error);
      }
    };

    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      setFetching(true);
      try {
        // LIMIT ADDED: Prevents massive Firebase billing spikes and browser crashes if you get thousands of users.
        const usersQuery = query(collection(db, 'users'), limit(50));
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserProfile[];
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading && isAdmin) {
      fetchUsers();
      fetchAdmins();
    }
  }, [loading, isAdmin]);

  const handleRoleChange = async (uid: string, newRole: 'user' | 'tester' | 'admin') => {
    if (uid === user?.uid) {
      alert("You cannot change your own role to avoid self-lockout.");
      return;
    }

    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Check console for details.');
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminEmail.includes('@')) return;

    setAddingAdmin(true);
    try {
      const email = newAdminEmail.toLowerCase().trim();
      await setDoc(doc(db, 'admins', email), {
        addedAt: serverTimestamp(),
        addedBy: user?.email
      });

      setAdminEmails(prev => [...prev.filter(e => e !== email), email]);

      // Update role of existing user if found
      const existingUser = users.find(u => u.email?.toLowerCase() === email);
      if (existingUser && existingUser.role !== 'admin') {
        await handleRoleChange(existingUser.uid, 'admin');
      }

      setNewAdminEmail('');
      alert(`Added ${email} as an admin!`);
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('Failed to add admin.');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (email === user?.email) {
      alert("You cannot remove yourself from the admin list.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${email} from the admin list?`)) return;

    try {
      await deleteDoc(doc(db, 'admins', email.toLowerCase()));
      setAdminEmails(prev => prev.filter(e => e !== email));

      // We don't automatically demote the user here to avoid complex state updates,
      // but they won't be re-upped on next login.
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Failed to remove admin.');
    }
  };

  const handleAddPlaytester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTesterEmail || !newTesterEmail.includes('@')) return;
    
    setAddingTester(true);
    try {
      const email = newTesterEmail.toLowerCase().trim();
      
      // Add to playtesters collection
      await setDoc(doc(db, 'playtesters', email), {
        addedAt: serverTimestamp(),
        addedBy: user?.email
      });
      
      // Check if user already exists and update role if they do
      const existingUser = users.find(u => u.email?.toLowerCase() === email);
      if (existingUser && existingUser.role !== 'admin') {
        await handleRoleChange(existingUser.uid, 'tester');
      }
      
      setNewTesterEmail('');
      alert(`Added ${email} as a playtester!`);
    } catch (error) {
      console.error('Error adding playtester:', error);
      alert('Failed to add playtester.');
    } finally {
      setAddingTester(false);
    }
  };

  if (loading || fetching) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className={styles.deniedContainer}>
        <h1 className={styles.deniedTitle}>Access Denied</h1>
        <p className={styles.deniedText}>You do not have permission to view this page.</p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">Go Back</Button>
        </Link>
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
        <div className={styles.headerSpacer}></div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>
            <Shield size={16} /> Admin Access
          </h2>
          <form onSubmit={handleAddAdmin} className={styles.formGroup}>
            <input
              type="email"
              placeholder="Admin email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className={styles.input}
              required
            />
            <Button
              type="submit"
              variant="primary"
              disabled={addingAdmin || !newAdminEmail}
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </form>

          <div className={styles.adminList}>
            {adminEmails.map(email => (
              <div key={email} className={styles.adminItem}>
                <span className={styles.adminEmail}>{email}</span>
                {email !== user?.email && (
                  <button
                    onClick={() => handleRemoveAdmin(email)}
                    className={styles.removeBtn}
                    title="Remove admin access"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardHeader}>Add Playtester</h2>
          <form onSubmit={handleAddPlaytester} className={styles.formGroup}>
            <input
              type="email"
              placeholder="Email address"
              value={newTesterEmail}
              onChange={(e) => setNewTesterEmail(e.target.value)}
              className={styles.input}
              required
            />
            <Button
              type="submit"
              variant="primary"
              disabled={addingTester || !newTesterEmail}
              icon={<Plus size={16} />}
            >
              Add
            </Button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardHeader}>User Management</h2>
          
          <div className={styles.userList}>
            {users.map(u => (
              <div key={u.uid} className={styles.userCard}>
                <div className={styles.userInfoRow}>
                  <div>
                    <div className={styles.userName}>{u.displayName || 'Anonymous'}</div>
                    <div className={styles.userEmail}>{u.email || 'No email'}</div>
                  </div>
                  <div className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleBadgeAdmin : u.role === 'tester' ? styles.roleBadgeTester : ''}`}>
                    {u.role === 'admin' && <Shield size={12} />}
                    {u.role === 'tester' && <Beaker size={12} />}
                    {(!u.role || u.role === 'user') && <UserIcon size={12} />}
                    {u.role || 'user'}
                  </div>
                </div>
                
                {u.uid !== user?.uid && (
                  <div className={styles.roleActions}>
                    <button
                      onClick={() => handleRoleChange(u.uid, 'user')}
                      className={`${styles.roleBtn} ${(!u.role || u.role === 'user') ? styles.roleBtnActiveUser : ''}`}
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
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
