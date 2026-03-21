"use client";

import Link from 'next/link';
import { Play, LogIn, LogOut, Flame, BarChart2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { signInWithGoogle, logout } from '@/lib/firebase';

export default function Menu() {
  const { user, profile, loading } = useAuth();

  return (
    <div className="h-[100dvh] overflow-y-auto bg-[#F5F2ED] text-[#1A1A1A] font-sans flex flex-col items-center p-2">
      <header className="w-full max-w-md py-4 flex flex-col items-center relative shrink-0">
        <div className="absolute top-2 right-2">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link href="/stats" className="flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-[#1A1A1A] transition-colors">
                  <BarChart2 className="w-4 h-4" />
                  <span>Stats</span>
                </Link>
                {profile && (
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{profile.currentStreak}</span>
                  </div>
                )}
                <button 
                  onClick={logout}
                  className="p-1.5 hover:bg-neutral-200 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 text-xs font-bold bg-white border-[1.5px] border-[#1A1A1A] px-3 py-1.5 rounded-full shadow-[2px_2px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1A1A1A] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )
          )}
        </div>
        
        <h1 className="text-3xl font-serif font-bold tracking-tight uppercase mt-6">DAILY PUZZLES</h1>
        <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest mt-1">Refined challenges for the lateral mind.</p>
        
        {!loading && profile && (
          <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            <div className="flex flex-col items-center">
              <span className="text-neutral-900 text-sm">{profile.currentStreak}</span>
              <span>Current Streak</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-neutral-900 text-sm">{profile.longestStreak}</span>
              <span>Longest Streak</span>
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-md flex flex-col gap-1.5 pb-2">
        <Link href="/split" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Split</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Combine halves to form 16 words.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-emerald-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/numbers" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Numbers</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Reach the target using math operations.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-blue-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/chain" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Chain</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Connect the start and end words.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-indigo-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/layers" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Layers</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Find the groups, then find the meta.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-rose-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/shift" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-violet-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Shift</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Slide columns to reveal the words.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-violet-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>
        <Link href="/lexicon" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-pink-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Lexicon</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Find the real definition among fakes.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-pink-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/spectrum" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Spectrum</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Sort items by their hidden value.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-amber-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>

        <Link href="/vault" className="group block bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-3 shadow-[4px_4px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-slate-400 border-r-[1.5px] border-[#1A1A1A]"></div>
          <div className="flex justify-between items-center pl-3">
            <div>
              <h2 className="text-lg font-serif font-bold uppercase mb-0.5">Vault</h2>
              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Crack the code using logic rules.</p>
            </div>
            <div className="w-7 h-7 rounded-full border-[1.5px] border-[#1A1A1A] flex items-center justify-center group-hover:bg-slate-400 transition-colors shadow-[2px_2px_0px_#1A1A1A]">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}
