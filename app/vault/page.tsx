"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyVault, generateRandomVault, VaultPuzzle } from '@/lib/vault';
import { HelpCircle, Share2, X, Delete, MessageSquare, Dices, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Vault.module.css';

export default function Vault() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
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
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const MAX_ATTEMPTS = 3;

  const handleShare = () => {
    const text = `Vault - ${dateString}\n${isWin ? `Cracked in ${attempts}/3 🔓` : 'Locked Out 🔒'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('Vault');
    if (nextArena) {
      setDailyPuzzle({ puzzle: nextArena.data });
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Falling back to local random generation.');
      setDailyPuzzle(generateRandomVault());
      setArenaPuzzleId(null);
    }
    setIsPlayTest(true);
    setFeedbackSubmitted(false);
    setArenaRating(0);
  };

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, attempts, timeToComplete: Math.floor((Date.now() - startTime) / 1000) });
      setFeedbackSubmitted(true);
    }
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
      setPuzzle(dailyPuzzle.puzzle);
      setInput('');
      setAttempts(0);
      setIsGameOver(false);
      setIsWin(false);
      setShake(false);
      setStartTime(Date.now());
      setActionTimeline([]);
    }
  }, [dailyPuzzle, isPlayTest]);

  const handleKeyPress = (key: string) => {
    if (isGameOver || !puzzle) return;
    
    const codeLength = puzzle.code.length;

    if (key === 'delete') {
      setActionTimeline(prev => [...prev, { time: Date.now() - startTime, type: 'delete' }]);
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'submit') {
      if (input.length !== codeLength) return;
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const isCorrect = input === puzzle.code;
      const currentTimeline = [...actionTimeline, { time: Date.now() - startTime, type: 'submit', guess: input, isCorrect }];
      setActionTimeline(currentTimeline);

      if (isCorrect) {
        setIsWin(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Vault',
          date: dateString,
          mode: 'standard',
          won: true,
          mistakes: newAttempts - 1,
          attempts: newAttempts,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest,
          actionTimeline: currentTimeline,
          timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0
        });
        setTimeout(() => setIsGameOver(true), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          saveGameStats(user?.uid || null, {
            gameName: 'Vault',
            date: dateString,
            mode: 'standard',
            won: false,
            mistakes: newAttempts,
            attempts: newAttempts,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest,
            actionTimeline: currentTimeline,
            timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0
          });
          setTimeout(() => setIsGameOver(true), 1500);
        } else {
          setTimeout(() => setInput(''), 600);
        }
      }
    } else {
      if (input.length < codeLength) {
        setActionTimeline(prev => [...prev, { time: Date.now() - startTime, type: 'input', key }]);
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
            className={styles.modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              className={styles.modalCard}
            >
              <h2 className={styles.modalTitle}>{isWin ? 'Unlocked!' : 'Locked Out'}</h2>
              <p className={styles.modalDesc}>{isWin ? `You cracked the code in ${attempts} attempt${attempts === 1 ? '' : 's'}.` : 'Security protocols triggered.'}</p>
              
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', border: 'var(--border-ink)' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textAlign: 'center', opacity: 0.7 }}>The Code Was</h3>
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-ink)' }}>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.3em', paddingLeft: '0.3em', color: 'var(--ink-main)' }}>{puzzle.code}</div>
                </div>
              </div>

              <div className={styles.modalActions}>
                {arenaPuzzleId && !feedbackSubmitted ? (
                  <div style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', border: 'var(--border-ink)' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'center', color: 'var(--ink-main)' }}>Rate this Arena Variant</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleSubmitRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-main)' }}>
                          <Star size={28} fill={arenaRating >= star ? 'var(--ink-main)' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                      <Share2 size={16} />
                      {copied ? 'Copied!' : 'Share Result'}
                    </button>
                    <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                      Back to Menu
                    </Link>
                  </>
                )}
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
