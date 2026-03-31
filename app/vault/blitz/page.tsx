"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Share2, X, Delete, MessageSquare, Dices, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Vault.module.css';

export default function VaultBlitz() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [input, setInput] = useState<string>('');
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [shake, setShake] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { user } = useAuth();

  const MAX_ATTEMPTS = 5;

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('VaultBlitz');
    if (nextArena) {
      setPuzzle(nextArena.data);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Go to Admin and generate "VaultBlitz".');
      setPuzzle(null);
    }
    setInput('');
    setAttempts(0);
    setIsGameOver(false);
    setIsWin(false);
    setShake(false);
    setStartTime(Date.now());
    setActionTimeline([]);
    setFeedbackSubmitted(false);
    setArenaRating(0);
    setTimeLeft(60);
  };

  useEffect(() => {
    handleRandomPuzzle();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!puzzle || isGameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !isGameOver) {
        setIsGameOver(true); // End game when time runs out
        saveGameStats(user?.uid || null, {
          gameName: 'Vault - Blitz',
          date: new Date().toISOString().split('T')[0],
          mode: 'blitz',
          won: false,
          mistakes: attempts,
          attempts: attempts,
          timeToComplete: 60,
          isPlayTest: true,
        });
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [puzzle, isGameOver, timeLeft]);

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, attempts, timeToComplete: 60 - timeLeft });
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
      const currentTimeline = [...actionTimeline, { time: Date.now() - startTime, type: 'submit', guess: input, isCorrect }];
      setActionTimeline(currentTimeline);

      if (isCorrect) {
        setIsWin(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Vault - Blitz',
          date: new Date().toISOString().split('T')[0],
          mode: 'blitz',
          won: true,
          mistakes: newAttempts - 1,
          attempts: newAttempts,
          timeToComplete: 60 - timeLeft,
          isPlayTest: true,
        });
        setTimeout(() => setIsGameOver(true), 1500);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setInput(''), 600);
      }
    } else {
      if (input.length < codeLength) {
        setInput(prev => prev + key);
      }
    }
  };

  if (!puzzle) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Prototype...</div>;

  return (
    <GameLayout title="Vault Blitz" subtitle="Experimental" rightActions={<button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle"><Dices size={18} /></button>}>
      <div className={styles.container}>
        {!isGameOver ? (
          <>
            <div className={styles.instructions}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: timeLeft <= 10 ? 'var(--accent-crimson)' : 'var(--ink-main)', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                <Clock size={24} /> 0:{timeLeft.toString().padStart(2, '0')}
              </div>
              <h2 className={styles.instructionTitle}>Crack the code. Fast.</h2>
            </div>

            <div className={styles.rulesBox}>
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
              <h2 className={styles.modalTitle}>{isWin ? 'Unlocked!' : (timeLeft <= 0 ? 'Time\'s Up!' : 'Locked Out')}</h2>
              <p className={styles.modalDesc}>{isWin ? `You cracked it with ${timeLeft} seconds to spare!` : 'Security protocols triggered.'}</p>
              
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
      </div>
    </GameLayout>
  );
}