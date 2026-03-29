"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyRoots, generateRandomRoots, RootsPuzzle } from '@/lib/roots';
import { HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Roots.module.css';

export default function Roots() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [puzzle, setPuzzle] = useState<RootsPuzzle | null>(null);
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_GUESSES = 5;

  const handleShare = () => {
    const title = `Roots ${dateString}`;
    const starString = isWin ? '⭐'.repeat(MAX_GUESSES - mistakes) + '⚪'.repeat(mistakes) : 'Failed';
    const text = `${title}\n${starString}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    setPuzzle(generateRandomRoots());
    setCurrentGuess('');
    setMistakes(0);
    setIsWin(false);
    setIsShaking(false);
    setIsPlayTest(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    setPuzzle(getDailyRoots(localDate));
    setStartTime(Date.now());
    setMounted(true);
  }, []);

  const handleSubmit = () => {
    if (!puzzle || isWin || mistakes >= MAX_GUESSES) return;
    
    if (currentGuess.trim() === '') return;
    
    const normalizedGuess = currentGuess.trim().toUpperCase();
    const normalizedTarget = puzzle.targetWord.toUpperCase();
    
    if (normalizedGuess === normalizedTarget) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Roots',
        date: dateString,
        mode: 'standard',
        won: true,
        mistakes,
        attempts: mistakes + 1,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setCurrentGuess('');
      
      if (newMistakes >= MAX_GUESSES) {
        saveGameStats(user?.uid || null, {
          gameName: 'Roots',
          date: dateString,
          mode: 'standard',
          won: false,
          mistakes: newMistakes,
          attempts: newMistakes,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest
        });
      }
    }
  };

  const isGameOver = mistakes >= MAX_GUESSES;

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback" aria-label="Give Feedback"><MessageSquare size={18} /></button> : null;
  const rightActions = (
    <>
      {isTester && <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle" aria-label="Random Puzzle"><Dices size={18} /></button>}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help" aria-label="Help"><HelpCircle size={18} /></button>
    </>
  );

  return (
    <GameLayout title="Roots" subtitle={isPlayTest ? 'Playtest' : dateString} leftActions={leftActions} rightActions={rightActions}>
      <div className={styles.container}>
        
        <div className={styles.originCard}>
          <h3 className={styles.originLanguage}>{puzzle.originLanguage}</h3>
          <h2 className={styles.originTranslation}>&quot;{puzzle.originTranslation}&quot;</h2>
        </div>

        <div className={styles.cluesArea}>
          {puzzle.clues.map((clue, index) => {
            const isRevealed = mistakes > index;
            if (isRevealed) {
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.clueItem}>
                  <span className={styles.clueNumber}>{index + 1}.</span>
                  <p className={styles.clueText}>{clue}</p>
                </motion.div>
              );
            } else {
              return (
                <div key={index} className={`${styles.clueItem} ${styles.clueHidden}`}>
                  <p className={styles.clueHiddenText}>Clue reveals after {index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth'} guess</p>
                </div>
              );
            }
          })}
        </div>

        <motion.div className={styles.inputRow} animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
          <input type="text" value={currentGuess} onChange={(e) => setCurrentGuess(e.target.value.replace(/[^A-Za-z]/g, ''))} disabled={isWin || isGameOver} className={styles.wordInput} placeholder="Type modern word..." onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
        </motion.div>

        <div className={styles.bottomArea}>
          <div className={styles.mistakesContainer}>
            <span className={styles.mistakesLabel}>Attempts Left</span>
            {[...Array(MAX_GUESSES)].map((_, i) => <div key={i} className={`${styles.mistakeDot} ${i < (MAX_GUESSES - mistakes) ? styles.mistakeDotActive : ''}`} /> )}
          </div>
          <div className={styles.actionsRow}>
            <button onClick={handleSubmit} disabled={isGameOver || isWin || !currentGuess} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Submit Guess</button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className={styles.modalCard}>
                <h2 className={styles.modalTitle}>{isWin ? 'Duced!' : 'Buried!'}</h2>
                <p className={styles.modalDesc}>{isWin ? `You found it in ${mistakes + 1} guess${mistakes === 0 ? '' : 'es'}.` : 'Out of attempts.'}</p>
                {isWin && <div className={styles.starsRow}>{'⭐'.repeat(MAX_GUESSES - mistakes)}{'⚪'.repeat(mistakes)}</div>}
                <div className={styles.solutionBox}><h3 className={styles.solutionHeader}>The Modern Word</h3><h2 className={styles.solutionWord}>{puzzle.targetWord}</h2></div>
                <div className={styles.modalActions}><button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}><Share2 size={18} /> {copied ? 'Copied!' : 'Share'}</button><Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Back to Menu</Link></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Roots" userId={user?.uid} />
    </GameLayout>
  );
}