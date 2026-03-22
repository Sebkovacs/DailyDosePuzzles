"use client";

import Link from 'next/link';
import { Play, LogIn, LogOut, Flame, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { signInWithGoogle, logout } from '@/lib/firebase';

export default function Menu() {
  const { user, profile, loading } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-white text-neutral-900 font-sans flex flex-col items-center selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      <header className="w-full max-w-md px-6 py-8 flex flex-col items-center border-b border-neutral-100 mb-8 bg-white relative">
        <div className="absolute top-4 right-6 flex items-center gap-3">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link href="/stats" className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors bg-neutral-50 px-3 py-1.5 rounded-full hover:bg-neutral-100">
                  <BarChart2 className="w-4 h-4" />
                  <span>Stats</span>
                </Link>
                {profile && profile.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                    <Flame className="w-4 h-4" />
                    <span>{profile.currentStreak}</span>
                  </div>
                )}
                <button 
                  onClick={logout}
                  className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-2 text-sm font-bold bg-neutral-900 text-white px-5 py-2 rounded-full hover:bg-neutral-800 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
        
        <h1 className="text-4xl font-serif font-black tracking-tight text-neutral-900 mt-10">Puzzles</h1>
        <p className="text-sm text-neutral-500 mt-2 font-medium">Refined challenges for the lateral mind.</p>
        
        {!loading && profile && (
          <div className="mt-8 flex gap-8 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-neutral-900 text-xl">{profile.currentStreak}</span>
              <span>Current Streak</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-neutral-900 text-xl">{profile.longestStreak}</span>
              <span>Longest Streak</span>
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-md flex flex-col gap-4 px-4 pb-8">
        <Link href="/chain" className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mb-1">Chain</h2>
              <p className="text-xs text-neutral-500 font-medium">Connect the start and end words.</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors text-neutral-400 group-hover:text-indigo-600">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/split" className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mb-1">Split</h2>
              <p className="text-xs text-neutral-500 font-medium">Combine halves to form 16 words.</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors text-neutral-400 group-hover:text-emerald-600">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/layers" className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mb-1">Layers</h2>
              <p className="text-xs text-neutral-500 font-medium">Find the groups, then find the meta.</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-rose-50 group-hover:border-rose-200 transition-colors text-neutral-400 group-hover:text-rose-600">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/vault" className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-500"></div>
          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mb-1">Vault</h2>
              <p className="text-xs text-neutral-500 font-medium">Crack the code using logic rules.</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-slate-50 group-hover:border-slate-200 transition-colors text-neutral-400 group-hover:text-slate-600">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/shift" className="group block bg-white border border-neutral-200 rounded-2xl p-5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/50 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500"></div>
          <div className="flex justify-between items-center pl-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 mb-1">Shift</h2>
              <p className="text-xs text-neutral-500 font-medium">Slide columns to reveal the words.</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:bg-violet-50 group-hover:border-violet-200 transition-colors text-neutral-400 group-hover:text-violet-600">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
