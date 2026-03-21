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

      <main className="flex-1 min-h-0 w-full max-w-md px-2 py-2 flex flex-col items-center overflow-y-auto">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-4 w-full">
          <div className="bg-neutral-300 p-0.5 rounded-sm flex gap-1 border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] w-full max-w-[200px]">
            <button 
              onClick={() => setMode('easy')}
              className={`flex-1 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'easy' ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`flex-1 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'hard' ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Hard
            </button>
          </div>
        </div>

        {!isGameOver ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-base font-serif font-bold leading-tight">Crack the code.</h2>
              <p className="text-[10px] text-neutral-600 mt-0.5">Follow the security protocols.</p>
            </div>

            <div className="mb-4 bg-white border-[1.5px] border-[#1A1A1A] p-3 rounded-sm shadow-[4px_4px_0px_#1A1A1A] w-full max-w-[340px]">
              <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2 border-b-[1.5px] border-[#1A1A1A] pb-1">Security Protocols</h2>
              <ul className="space-y-1.5">
                {puzzle.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs font-bold flex items-start gap-2">
                    <span className="text-[#00FF00] mt-0.5 text-xs leading-none">■</span>
                    <span className="leading-tight text-[#1A1A1A]/90">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center mb-4 w-full max-w-[340px]">
              <motion.div 
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex gap-2 mb-3"
              >
                {Array.from({ length: puzzle.code.length }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-12 h-14 flex items-center justify-center text-2xl font-mono font-black border-[1.5px] border-[#1A1A1A] rounded-sm shadow-[2px_2px_0px_#1A1A1A] transition-colors ${
                      input[idx] ? 'bg-white text-[#1A1A1A]' : 'bg-neutral-200 text-transparent'
                    } ${isWin ? 'bg-[#00FF00] text-[#1A1A1A]' : ''}`}
                  >
                    {input[idx] || '0'}
                  </div>
                ))}
              </motion.div>
              
              <div className="w-full flex justify-between items-center bg-white border-[1.5px] border-[#1A1A1A] p-2 rounded-sm shadow-[2px_2px_0px_#1A1A1A]">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Chances</span>
                <div className="flex gap-1">
                  {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-sm transition-colors duration-300 ${
                        i < (MAX_ATTEMPTS - attempts) ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mt-auto w-full max-w-[340px] pb-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={input.length >= puzzle.code.length || isWin}
                  className="bg-white border-[1.5px] border-[#1A1A1A] py-2 text-xl font-mono font-black rounded-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[3px_3px_0px_#1A1A1A]"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress('delete')}
                disabled={input.length === 0 || isWin}
                className="bg-neutral-200 border-[1.5px] border-[#1A1A1A] py-2 flex items-center justify-center rounded-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[3px_3px_0px_#1A1A1A]"
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                disabled={input.length >= puzzle.code.length || isWin}
                className="bg-white border-[1.5px] border-[#1A1A1A] py-2 text-xl font-mono font-black rounded-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[3px_3px_0px_#1A1A1A]"
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress('submit')}
                disabled={input.length !== puzzle.code.length || isWin}
                className="bg-[#00FF00] border-[1.5px] border-[#1A1A1A] py-2 flex items-center justify-center rounded-sm shadow-[3px_3px_0px_#1A1A1A] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[3px_3px_0px_#1A1A1A]"
              >
                <span className="font-black text-[10px] uppercase tracking-widest">Enter</span>
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
          >
            <div className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] text-center max-w-sm w-full border-2 border-[#1A1A1A]">
              <h2 className="text-6xl font-serif font-black tracking-tight mb-1">{isWin ? 'UNLOCKED!' : 'LOCKED OUT'}</h2>
              <p className="text-base font-bold text-neutral-600 mb-4">{isWin ? `You cracked the code in ${attempts} attempt${attempts === 1 ? '' : 's'}.` : 'Security protocols triggered.'}</p>
              
              <div className="mb-5 w-full text-left bg-neutral-300 p-3 rounded-md border-2 border-neutral-300">
                <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">The Code Was</h3>
                <div className="bg-white border-2 border-[#1A1A1A] p-3 rounded-md shadow-[3px_3px_0px_#1A1A1A] flex justify-center">
                  <div className="text-4xl font-mono font-black text-[#1A1A1A] tracking-[0.2em] ml-2">{puzzle.code}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleShare}
                  className="w-full py-2.5 rounded-md bg-[#00FF00] text-[#1A1A1A] text-base font-black hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Copied to Clipboard!' : 'Share Result'}
                </button>
                <Link href="/" className="block w-full py-2.5 rounded-md bg-neutral-300 text-[#1A1A1A] text-base font-black hover:bg-neutral-300 transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Back to Menu
                </Link>
              </div>
            </div>
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
