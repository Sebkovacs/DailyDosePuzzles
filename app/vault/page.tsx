"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyVault, generateRandomVault, VaultPuzzle } from '@/lib/vault';
import { HelpCircle, Share2, X, Delete, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Vault.module.css';

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

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? (
    <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback">
      <MessageSquare size={18} />
    </button>
  ) : null;

  const rightActions = (
    <>
      {isTester && (
        <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle">
          <Dices size={18} />
        </button>
      )}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help">
        <HelpCircle size={18} />
      </button>
    </>
  );

  return (
    <GameLayout
      title="Vault"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        <div className={styles.modeToggle}>
            <button 
              onClick={() => setMode('easy')}
              className={`${styles.modeBtn} ${mode === 'easy' ? styles.modeBtnActive : ''}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`${styles.modeBtn} ${mode === 'hard' ? styles.modeBtnActive : ''}`}
            >
              Hard
            </button>
        </div>

        {!isGameOver ? (
          <>
            <div className={styles.instructions}>
              <h2 className={styles.instructionTitle}>Crack the code.</h2>
              <p className={styles.instructionDesc}>Follow the security protocols.</p>
            </div>

            <div className={styles.rulesBox}>
              <h2 className={styles.rulesHeader}>Security Protocols</h2>
              <ul className={styles.ruleList}>
                {puzzle.rules.map((rule, idx) => (
                  <li key={idx} className={styles.ruleItem}>
                    <span className={styles.ruleBullet}>■</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

              <motion.div 
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={styles.codeDisplay}
              >
                {Array.from({ length: puzzle.code.length }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.codeSlot} ${
                      input[idx] ? styles.codeSlotFilled : styles.codeSlotEmpty
                    } ${isWin ? styles.codeSlotWin : ''}`}
                  >
                    {input[idx] || '0'}
                  </div>
                ))}
              </motion.div>
              
              <div className={styles.mistakesContainer}>
                <span className={styles.mistakesLabel}>Mistakes Remaining</span>
                <div className={styles.dotsGroup}>
                  {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`${styles.mistakeDot} ${i < (MAX_ATTEMPTS - attempts) ? styles.mistakeDotActive : ''}`}
                    />
                  ))}
                </div>
              </div>

            <div className={styles.numpad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={input.length >= puzzle.code.length || isWin}
                  className={styles.numBtn}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleKeyPress('delete')}
                disabled={input.length === 0 || isWin}
                className={`${styles.numBtn} ${styles.actionKey}`}
              >
                <Delete className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                disabled={input.length >= puzzle.code.length || isWin}
                className={styles.numBtn}
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress('submit')}
                disabled={input.length !== puzzle.code.length || isWin}
                className={`${styles.numBtn} ${styles.enterKey}`}
              >
                Enter
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
              className={styles.modalOverlay}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className={styles.modalCard}
              >
                <button onClick={() => setShowHelp(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
                <h2 className={styles.modalTitle}>How to Play</h2>
                <div className={styles.modalDesc} style={{ textAlign: 'left', marginBottom: '32px' }}>
                  <p style={{marginBottom: '12px'}}>You are a safecracker trying to deduce a 4-digit passcode.</p>
                  <p style={{marginBottom: '12px'}}>Read the <strong style={{color: 'var(--ink-main)'}}>Security Protocols</strong> carefully. They provide absolute logical rules about the code.</p>
                  <p>You have exactly <strong style={{color: 'var(--ink-main)'}}>3 chances</strong> to enter the correct combination before the vault locks down.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Vault" userId={user?.uid} />
    </GameLayout>
  );
}
