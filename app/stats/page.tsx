'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Globe, User as UserIcon, Beaker } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface StatItem {
  gameName: string;
  date: string;
  mode: string;
  won: boolean;
  mistakes: number;
  timeToComplete?: number;
  attempts?: number;
  userId: string;
  isPlayTest?: boolean;
}

export default function StatsPage() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'global' | 'playtest'>('personal');
  const [personalStats, setPersonalStats] = useState<StatItem[]>([]);
  const [globalStats, setGlobalStats] = useState<StatItem[]>([]);
  const [playtestStats, setPlaytestStats] = useState<StatItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const isAdmin = user?.email === 'sebkovacs@gmail.com';

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setStatsLoading(true);
      try {
        // Fetch personal stats
        const personalQuery = query(
          collection(db, 'game_stats'),
          where('userId', '==', user.uid)
        );
        const personalSnapshot = await getDocs(personalQuery);
        const pStats = personalSnapshot.docs.map(doc => doc.data() as StatItem);
        setPersonalStats(pStats.filter(s => !s.isPlayTest));

        // Fetch global stats if admin
        if (isAdmin) {
          const globalQuery = query(collection(db, 'game_stats'));
          const globalSnapshot = await getDocs(globalQuery);
          const allStats = globalSnapshot.docs.map(doc => doc.data() as StatItem);
          
          setGlobalStats(allStats.filter(s => !s.isPlayTest));
          setPlaytestStats(allStats.filter(s => s.isPlayTest));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!loading) {
      fetchStats();
    }
  }, [user, loading, isAdmin]);

  if (loading) {
    return <div className="h-[100dvh] flex items-center justify-center bg-[#F5F2ED]">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-[#F5F2ED] text-[#1A1A1A] p-4 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Sign in to view stats</h1>
        <Link href="/" className="px-4 py-2 bg-white border-[1.5px] border-[#1A1A1A] rounded-md font-bold text-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] transition-all">
          Go Back
        </Link>
      </div>
    );
  }

  const calculateMetrics = (stats: StatItem[]) => {
    const totalGames = stats.length;
    const wins = stats.filter(s => s.won).length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    const uniquePlayers = new Set(stats.map(s => s.userId)).size;
    
    const gamesByTitle = stats.reduce((acc, stat) => {
      if (!acc[stat.gameName]) {
        acc[stat.gameName] = { played: 0, won: 0 };
      }
      acc[stat.gameName].played++;
      if (stat.won) acc[stat.gameName].won++;
      return acc;
    }, {} as Record<string, { played: number, won: number }>);

    return { totalGames, wins, winRate, gamesByTitle, uniquePlayers };
  };

  const personalMetrics = calculateMetrics(personalStats);
  const globalMetrics = calculateMetrics(globalStats);
  const playtestMetrics = calculateMetrics(playtestStats);

  const currentMetrics = activeTab === 'personal' ? personalMetrics : activeTab === 'global' ? globalMetrics : playtestMetrics;
  const currentStats = activeTab === 'personal' ? personalStats : activeTab === 'global' ? globalStats : playtestStats;

  return (
    <div className="h-[100dvh] overflow-y-auto bg-[#F5F2ED] text-[#1A1A1A] font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-4 py-4 flex items-center justify-between border-b-[1.5px] border-[#1A1A1A] shrink-0 bg-white sticky top-0 z-10">
        <Link href="/" className="p-1.5 hover:bg-neutral-200 rounded-sm transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-serif font-black tracking-tight uppercase">Statistics</h1>
        <div className="w-8"></div> {/* Spacer for centering */}
      </header>

      <main className="w-full max-w-md p-4 flex flex-col gap-6">
        {isAdmin && (
          <div className="flex bg-white border-[1.5px] border-[#1A1A1A] rounded-lg p-1 shadow-[3px_3px_0px_#1A1A1A]">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'personal' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-neutral-100'}`}
            >
              <UserIcon className="w-4 h-4" /> My Stats
            </button>
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'global' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-neutral-100'}`}
            >
              <Globe className="w-4 h-4" /> Global Stats
            </button>
            <button
              onClick={() => setActiveTab('playtest')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'playtest' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-neutral-100'}`}
            >
              <Beaker className="w-4 h-4" /> Playtest
            </button>
          </div>
        )}

        {statsLoading ? (
          <div className="text-center py-10 text-neutral-500 font-mono text-sm uppercase">Loading stats...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {activeTab === 'personal' && profile && (
              <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-4 shadow-[4px_4px_0px_#1A1A1A]">
                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b-[1.5px] border-neutral-200 pb-2">Streaks</h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-black text-orange-500">{profile.currentStreak}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#1A1A1A]">{profile.longestStreak}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Longest Streak</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border-[1.5px] border-[#1A1A1A] rounded-xl p-4 shadow-[4px_4px_0px_#1A1A1A]">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b-[1.5px] border-neutral-200 pb-2">
                {activeTab === 'personal' ? 'My Overview' : activeTab === 'global' ? 'Global Overview' : 'Playtest Overview'}
              </h2>
              
              {currentStats.length === 0 ? (
                <div className="text-center py-6 text-neutral-500 text-sm">
                  {activeTab === 'personal' ? 'No games played yet.' : activeTab === 'global' ? 'No global stats available.' : 'No playtest stats available.'}
                </div>
              ) : (
                <>
                  <div className={`grid ${activeTab === 'personal' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 text-center mb-6`}>
                    <div className="bg-neutral-100 p-3 rounded-lg border-[1.5px] border-transparent flex flex-col items-center justify-center">
                      <div className="text-xl font-black">{currentMetrics.totalGames}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Played</div>
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-lg border-[1.5px] border-transparent flex flex-col items-center justify-center">
                      <div className="text-xl font-black text-emerald-600">{currentMetrics.wins}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Won</div>
                    </div>
                    <div className="bg-neutral-100 p-3 rounded-lg border-[1.5px] border-transparent flex flex-col items-center justify-center">
                      <div className="text-xl font-black text-blue-600">{currentMetrics.winRate}%</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Win Rate</div>
                    </div>
                    {activeTab !== 'personal' && (
                      <div className="bg-neutral-100 p-3 rounded-lg border-[1.5px] border-transparent flex flex-col items-center justify-center">
                        <div className="text-xl font-black text-purple-600">{currentMetrics.uniquePlayers}</div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-600 mt-1">Players</div>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-3">By Game</h3>
                  <div className="space-y-3">
                    {Object.entries(currentMetrics.gamesByTitle).map(([game, data]) => (
                      <div key={game} className="flex items-center justify-between bg-neutral-50 p-2 rounded border-[1px] border-neutral-200">
                        <span className="font-bold text-sm">{game}</span>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span className="text-neutral-500">{data.played} played</span>
                          <span className="font-bold text-emerald-600">{Math.round((data.won / data.played) * 100)}% win</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
