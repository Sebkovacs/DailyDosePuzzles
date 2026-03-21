'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Shield, User as UserIcon, Beaker, Plus } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'tester' | 'admin';
  createdAt: unknown;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [newTesterEmail, setNewTesterEmail] = useState('');
  const [addingTester, setAddingTester] = useState(false);

  const isAdmin = user?.email === 'sebkovacs@gmail.com';

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      setFetching(true);
      try {
        const snapshot = await getDocs(collection(db, 'users'));
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

    if (!loading) {
      fetchUsers();
    }
  }, [loading, isAdmin]);

  const handleRoleChange = async (uid: string, newRole: 'user' | 'tester' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Check console for details.');
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
    return <div className="h-[100dvh] flex items-center justify-center bg-[#F5F2ED]">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#F5F2ED] text-[#1A1A1A] p-4 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Access Denied</h1>
        <p className="text-sm mb-6">You do not have permission to view this page.</p>
        <Link href="/" className="px-4 py-2 bg-white border-[1.5px] border-[#1A1A1A] rounded-md font-bold text-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-y-auto bg-[#F5F2ED] text-[#1A1A1A] font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-4 py-4 flex items-center justify-between border-b-[1.5px] border-[#1A1A1A] shrink-0 bg-white sticky top-0 z-10">
        <Link href="/" className="p-1.5 hover:bg-neutral-200 rounded-sm transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif font-black tracking-tight uppercase flex items-center gap-2">
          <Shield className="w-5 h-5" /> Admin
        </h1>
        <div className="w-8"></div>
      </header>

      <main className="w-full max-w-md p-4 flex flex-col gap-6">
        <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-4 shadow-[4px_4px_0px_#1A1A1A]">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b-[1.5px] border-neutral-200 pb-2">Add Playtester</h2>
          <form onSubmit={handleAddPlaytester} className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={newTesterEmail}
              onChange={(e) => setNewTesterEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border-[1.5px] border-[#1A1A1A] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
              required
            />
            <button
              type="submit"
              disabled={addingTester || !newTesterEmail}
              className="px-4 py-2 bg-[#1A1A1A] text-white text-sm font-bold rounded-md hover:bg-black disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-4 shadow-[4px_4px_0px_#1A1A1A]">
          <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b-[1.5px] border-neutral-200 pb-2">User Management</h2>
          
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.uid} className="flex flex-col gap-2 p-3 bg-neutral-50 border-[1.5px] border-neutral-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm">{u.displayName || 'Anonymous'}</div>
                    <div className="text-xs text-neutral-500">{u.email || 'No email'}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-neutral-200">
                    {u.role === 'admin' && <Shield className="w-3 h-3" />}
                    {u.role === 'tester' && <Beaker className="w-3 h-3" />}
                    {(!u.role || u.role === 'user') && <UserIcon className="w-3 h-3" />}
                    {u.role || 'user'}
                  </div>
                </div>
                
                {u.email !== 'sebkovacs@gmail.com' && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleRoleChange(u.uid, 'user')}
                      className={`flex-1 py-1 text-xs font-bold rounded border-[1.5px] ${(!u.role || u.role === 'user') ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-[#1A1A1A] border-neutral-300 hover:bg-neutral-100'}`}
                    >
                      User
                    </button>
                    <button
                      onClick={() => handleRoleChange(u.uid, 'tester')}
                      className={`flex-1 py-1 text-xs font-bold rounded border-[1.5px] ${u.role === 'tester' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-[#1A1A1A] border-neutral-300 hover:bg-neutral-100'}`}
                    >
                      Tester
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
