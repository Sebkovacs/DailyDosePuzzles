"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyVault, generateRandomVault, VaultPuzzle } from '@/lib/vault';
import { ChevronLeft, HelpCircle, Share2, X, Delete, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Vault() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [puzzle, setPuzzle] = useState<VaultPuzzle | null>(null);
  
  const [input, setInput] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const MAX_ATTEMPTS = 3;

  const handleShare = () => {
    const text = `Vault (${mode}) - ${dateString}\n${isWin ? `Cracked in ${attempts}/3 🔓` : 'Locked Out 🔒'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomVault();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyVault(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      setPuzzle(dailyPuzzle[mode]);
      setInput('');
      setAttempts(0);
      setIsGameOver(false);
      setIsWin(false);
      setShake(false);
      setStartTime(Date.now());
    }
  }, [mode, dailyPuzzle, isPlayTest]);

  const handleKeyPress = (key: string) => {
    if (isGameOver || !puzzle) return;
    
    const codeLength = puzzle.code.length;

    if (key === 'delete') {
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'submit') {
      if (input.length !== codeLength) return;
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (input === puzzle.code) {
        setIsWin(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Vault',
          date: dateString,
          mode,
          won: true,
          mistakes: newAttempts - 1,
          attempts: newAttempts,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest
        });
        setTimeout(() => setIsGameOver(true), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          saveGameStats(user?.uid || null, {
            gameName: 'Vault',
            date: dateString,
            mode,
            won: false,
            mistakes: newAttempts,
            attempts: newAttempts,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
          setTimeout(() => setIsGameOver(true), 1500);
        } else {
          setTimeout(() => setInput(''), 600);
        }
      }
    } else {
      if (input.length < codeLength) {
        setInput(prev => prev + key);
      }
    }
  };

  useEffect(() => {
    if (isWin && user && !isPlayTest) {
      updateStreak(user.uid).catch(console.error);
    }
  }, [isWin, user, isPlayTest]);

  if (!mounted || !puzzle) return <div className="min-h-screen flex items-center justify-center bg-[#F5F2ED] text-[#1A1A1A]">Loading...</div>;

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F5F2ED] text-[#1A1A1A] font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-2 py-1 flex items-center justify-between border-b-[1.5px] border-[#1A1A1A] shrink-0">
        <div className="flex items-center gap-1">
          <Link href="/" className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors text-blue-600" title="Give Feedback">
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">VAULT</h1>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">
            {isPlayTest ? 'PLAYTEST MODE' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors text-emerald-600" title="Random Puzzle">
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-6 flex flex-col items-center overflow-y-auto relative">
        <div className="flex justify-center mb-6 shrink-0 w-full">
          <div className="bg-neutral-100 p-1 rounded-full flex gap-1 border border-neutral-200 w-full max-w-[200px]">
            <button 
              onClick={() => setMode('easy')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'easy' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'hard' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
            >
              Hard
            </button>
          </div>
        </div>

        {!isGameOver ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-lg font-serif font-medium text-neutral-800">Crack the code.</h2>
              <p className="text-xs text-neutral-500 mt-1">Follow the security protocols.</p>
            </div>

            <div className="mb-6 bg-slate-50 border border-slate-200 p-5 rounded-2xl w-full max-w-[340px]">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-2">Security Protocols</h2>
              <ul className="space-y-3">
                {puzzle.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs font-medium flex items-start gap-2 text-slate-700">
                    <span className="text-slate-400 mt-[3px] text-[8px] leading-none">■</span>
                    <span className="leading-snug">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center mb-6 w-full max-w-[340px]">
              <motion.div 
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex gap-3 mb-4"
              >
                {Array.from({ length: puzzle.code.length }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-14 h-16 flex items-center justify-center text-3xl font-mono font-bold border-2 rounded-xl transition-colors ${
                      input[idx] ? 'bg-white border-slate-900 text-slate-900' : 'bg-slate-50 border-slate-200 text-transparent'
                    } ${isWin ? 'bg-emerald-500 border-emerald-500 text-white' : ''}`}
                  >
                    {input[idx] || '0'}
                  </div>
                ))}
              </motion.div>
              
              <div className="w-full flex justify-between items-center px-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mistakes Remaining</span>
                <div className="flex gap-1.5">
                  {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i < (MAX_ATTEMPTS - attempts) ? 'bg-slate-500 scale-100' : 'bg-neutral-200 scale-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-auto w-full max-w-[340px] pb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={input.length >= puzzle.code.length || isWin}
                  className="bg-white border border-neutral-200 py-3 text-xl font-mono font-bold rounded-2xl hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition-all disabled:opacity-50 text-neutral-800"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress('delete')}
                disabled={input.length === 0 || isWin}
                className="bg-neutral-100 border border-transparent py-3 flex items-center justify-center rounded-2xl hover:bg-neutral-200 active:scale-95 transition-all disabled:opacity-50 text-neutral-600"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                disabled={input.length >= puzzle.code.length || isWin}
                className="bg-white border border-neutral-200 py-3 text-xl font-mono font-bold rounded-2xl hover:bg-neutral-50 hover:border-neutral-300 active:scale-95 transition-all disabled:opacity-50 text-neutral-800"
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress('submit')}
                disabled={input.length !== puzzle.code.length || isWin}
                className="bg-slate-900 border border-transparent py-3 flex items-center justify-center rounded-2xl hover:bg-black active:scale-95 transition-all disabled:opacity-50 text-white"
              >
                <span className="font-bold text-xs uppercase tracking-widest">Enter</span>
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-100"
            >
              <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-neutral-900">{isWin ? 'Unlocked!' : 'Locked Out'}</h2>
              <p className="text-sm text-neutral-500 mb-6">{isWin ? `You cracked the code in ${attempts} attempt${attempts === 1 ? '' : 's'}.` : 'Security protocols triggered.'}</p>
              
              <div className="mb-6 w-full text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <h3 className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest mb-3 text-center">The Code Was</h3>
                <div className="bg-white border border-neutral-200 p-4 rounded-xl flex justify-center">
                  <div className="text-4xl font-mono font-bold text-neutral-900 tracking-[0.3em] ml-3">{puzzle.code}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleShare}
                  className="w-full py-3.5 rounded-full bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Copied to Clipboard!' : 'Share Result'}
                </button>
                <Link href="/" className="block w-full py-3.5 rounded-full bg-neutral-100 text-neutral-600 text-sm font-bold hover:bg-neutral-200 transition-colors active:scale-95 text-center">
                  Back to Menu
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] max-w-sm w-full relative border-2 border-[#1A1A1A]"
              >
                <button onClick={() => setShowHelp(false)} className="absolute top-3 right-3 p-1.5 text-[#1A1A1A] hover:bg-neutral-300 rounded-sm transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-6xl font-serif font-black mb-3">How to Play</h2>
                <div className="space-y-3 text-base text-neutral-600">
                  <p>You are a safecracker trying to deduce a 4-digit passcode.</p>
                  <p>Read the <span className="text-[#1A1A1A] font-black">Security Protocols</span> carefully. They provide absolute logical rules about the code.</p>
                  <p>You have exactly <strong>3 chances</strong> to enter the correct combination before the vault locks down.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Vault" />
    </div>
  );
}
