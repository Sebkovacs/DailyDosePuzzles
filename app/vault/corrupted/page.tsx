"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Share2, X, Delete, MessageSquare, Dices, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Vault.module.css';

export default function VaultCorrupted() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [input, setInput] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [shake, setShake] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { user } = useAuth();

  const MAX_ATTEMPTS = 4; // More attempts for a harder puzzle

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('VaultCorrupted');
    if (nextArena) {
      setPuzzle(nextArena.data);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Go to Admin and generate "VaultCorrupted".');
      setPuzzle(null);
    }
    setInput('');
    setAttempts(0);
    setIsGameOver(false);
    setIsWin(false);
    setShake(false);
    setStartTime(Date.now());
    setFeedbackSubmitted(false);
    setArenaRating(0);
  };

  useEffect(() => {
    handleRandomPuzzle();
  }, []);

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, attempts, timeToComplete: Math.floor((Date.now() - startTime) / 1000) });
      setFeedbackSubmitted(true);
    }
  };

  const handleKeyPress = (key: string) => {
    if (isGameOver || !puzzle) return;
    const codeLength = puzzle.code.length;

    if (key === 'delete') {
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'submit') {
      if (input.length !== codeLength) return;
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const isCorrect = input === puzzle.code;

      if (isCorrect) {
        setIsWin(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Vault - Corrupted',
          date: new Date().toISOString().split('T')[0],
          mode: 'corrupted',
          won: true,
          mistakes: newAttempts - 1,
          attempts: newAttempts,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest: true,
        });
        setTimeout(() => setIsGameOver(true), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          saveGameStats(user?.uid || null, {
            gameName: 'Vault - Corrupted',
            date: new Date().toISOString().split('T')[0],
            mode: 'corrupted',
            won: false,
            mistakes: newAttempts,
            attempts: newAttempts,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest: true,
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

  if (!puzzle) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Prototype...</div>;

  return (
    <GameLayout title="Vault: Corrupted" subtitle="Experimental" rightActions={<><button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle"><Dices size={18} /></button><button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help"><HelpCircle size={18} /></button></>}>
      <div className={styles.container}>
        {!isGameOver ? (
          <>
            <div className={styles.instructions}>
              <h2 className={styles.instructionTitle}>Data is Corrupted.</h2>
              <p className={styles.instructionDesc}>One of the security protocols is a lie.</p>
            </div>

            <div className={styles.rulesBox}>
              <h2 className={styles.rulesHeader}>Security Protocols</h2>
              <ul className={styles.ruleList}>
                {puzzle.rules.map((rule: string, idx: number) => (
                  <li key={idx} className={styles.ruleItem}><span className={styles.ruleBullet}>■</span><span>{rule}</span></li>
                ))}
              </ul>
            </div>

            <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }} className={styles.codeDisplay}>
              {Array.from({ length: puzzle.code.length }).map((_, idx) => (
                <div key={idx} className={`${styles.codeSlot} ${input[idx] ? styles.codeSlotFilled : styles.codeSlotEmpty} ${isWin ? styles.codeSlotWin : ''}`}>
                  {input[idx] || '0'}
                </div>
              ))}
            </motion.div>
              
            <div className={styles.mistakesContainer}>
              <span className={styles.mistakesLabel}>Mistakes Remaining</span>
              <div className={styles.dotsGroup}>
                {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                  <div key={i} className={`${styles.mistakeDot} ${i < (MAX_ATTEMPTS - attempts) ? styles.mistakeDotActive : ''}`} />
                ))}
              </div>
            </div>

            <div className={styles.numpad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button key={num} onClick={() => handleKeyPress(num)} disabled={input.length >= puzzle.code.length || isWin} className={styles.numBtn}>{num}</button>
              ))}
              <button onClick={() => handleKeyPress('delete')} disabled={input.length === 0 || isWin} className={`${styles.numBtn} ${styles.actionKey}`}><Delete className="w-5 h-5" /></button>
              <button onClick={() => handleKeyPress('0')} disabled={input.length >= puzzle.code.length || isWin} className={styles.numBtn}>0</button>
              <button onClick={() => handleKeyPress('submit')} disabled={input.length !== puzzle.code.length || isWin} className={`${styles.numBtn} ${styles.enterKey}`}>Enter</button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className={styles.modalCard}>
              <h2 className={styles.modalTitle}>{isWin ? 'Unlocked!' : 'Locked Out'}</h2>
              <p className={styles.modalDesc}>{isWin ? `You saw through the deception.` : 'The corrupted data fooled you.'}</p>
              
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', border: 'var(--border-ink)' }}>
                <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', textAlign: 'center', opacity: 0.7 }}>The Code Was</h3>
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-sm)', border: 'var(--border-ink)' }}>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.3em', paddingLeft: '0.3em', color: 'var(--ink-main)' }}>{puzzle.code}</div>
                </div>
              </div>

              <div className={styles.modalActions}>
                {arenaPuzzleId && !feedbackSubmitted ? (
                  <div style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', border: 'var(--border-ink)' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'center', color: 'var(--ink-main)' }}>Rate this Prototype</p>
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
                    <button onClick={handleRandomPuzzle} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                      Next Prototype
                    </button>
                    <Link href="/vault" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                      Back to Menu
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence>
          {showHelp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={styles.modalCard}>
                <button onClick={() => setShowHelp(false)} className={styles.closeBtn}><X size={20} /></button>
                <h2 className={styles.modalTitle}>Corrupted Protocol</h2>
                <div className={styles.modalDesc} style={{ textAlign: 'left', marginBottom: '32px' }}>
                  <p style={{marginBottom: '12px'}}>The rules are the same as Standard Protocol, with one critical exception:</p>
                  <p style={{color: 'var(--accent-crimson)', fontWeight: 700}}>One of the six security clues is a lie.</p>
                  <p>You must use logic to determine which clue is the red herring in order to deduce the true code.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  Understood
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}