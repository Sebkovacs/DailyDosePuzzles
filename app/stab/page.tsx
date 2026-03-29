"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyStab, generateRandomStab, StabPuzzle } from '@/lib/stab';
import { HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Stab.module.css';

export default function Stab() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [puzzle, setPuzzle] = useState<StabPuzzle | null>(null);
  
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_GUESSES = 6;

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    setPuzzle(getDailyStab(localDate));
    setStartTime(Date.now());
    setMounted(true);
  }, []);

  const handleShare = () => {
    const title = `Stab ${dateString}`;
    const rows = guesses.map(g => {
      let row = '';
      for (let i = 0; i < puzzle!.targetWord.length; i++) {
        if (g[i] === puzzle!.targetWord[i]) row += '🟩';
        else if (puzzle!.targetWord.includes(g[i])) row += '🟨';
        else row += '⬜';
      }
      return row;
    }).join('\n');
    const text = `${title}\n${isWin ? guesses.length : 'X'}/${MAX_GUESSES}\n\n${rows}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    setPuzzle(generateRandomStab());
    setGuesses([]);
    setCurrentGuess('');
    setIsWin(false);
    setIsShaking(false);
    setIsPlayTest(true);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!puzzle || isWin || guesses.length >= MAX_GUESSES) return;
    
    if (currentGuess.trim().length !== puzzle.targetWord.length) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    
    const normalizedGuess = currentGuess.trim().toUpperCase();
    const newGuesses = [...guesses, normalizedGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    
    if (normalizedGuess === puzzle.targetWord) {
      setIsWin(true);
      saveGameStats(user?.uid || null, { gameName: 'Stab', date: dateString, mode: 'standard', won: true, mistakes: newGuesses.length - 1, attempts: newGuesses.length, timeToComplete: Math.floor((Date.now() - startTime) / 1000), isPlayTest });
    } else if (newGuesses.length >= MAX_GUESSES) {
      saveGameStats(user?.uid || null, { gameName: 'Stab', date: dateString, mode: 'standard', won: false, mistakes: newGuesses.length, attempts: newGuesses.length, timeToComplete: Math.floor((Date.now() - startTime) / 1000), isPlayTest });
    }
  };

  const isGameOver = guesses.length >= MAX_GUESSES;

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback" aria-label="Give Feedback"><MessageSquare size={18} /></button> : null;
  const rightActions = (
    <>
      {isTester && <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle" aria-label="Random Puzzle"><Dices size={18} /></button>}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help" aria-label="Help"><HelpCircle size={18} /></button>
    </>
  );

  return (
    <GameLayout title="Stab" subtitle={isPlayTest ? 'Playtest' : dateString} leftActions={leftActions} rightActions={rightActions}>
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Find the Missing Link.</h2>
          <p className={styles.instructionDesc}>Guess the word that connects the top and bottom words.</p>
        </div>

        <div className={styles.board}>
          {/* Start Word (Fixed) */}
          <div className={styles.wordRow}>
            {puzzle.startWord.split('').map((char, i) => (
              <div key={`start-${i}`} className={`${styles.letterBox} ${styles.boxFixed}`}>{char}</div>
            ))}
          </div>

          {/* Guesses */}
          {guesses.map((guess, rowIndex) => (
            <motion.div key={rowIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.wordRow}>
              {guess.split('').map((char, colIndex) => {
                const isCorrect = puzzle.targetWord[colIndex] === char;
                const isPresent = !isCorrect && puzzle.targetWord.includes(char);
                let boxClass = styles.boxAbsent;
                if (isCorrect) boxClass = styles.boxCorrect;
                else if (isPresent) boxClass = styles.boxPresent;
                return <div key={colIndex} className={`${styles.letterBox} ${boxClass}`}>{char}</div>;
              })}
            </motion.div>
          ))}

          {/* Current Input Row (Only shown if not won and not out of guesses) */}
          {!isWin && !isGameOver && (
            <div className={styles.wordRow}>
              {[...Array(puzzle.targetWord.length)].map((_, i) => (
                <div key={`current-${i}`} className={styles.letterBox}>
                  {currentGuess[i] || ''}
                </div>
              ))}
            </div>
          )}

          {/* Empty Rows Padding */}
          {!isWin && [...Array(Math.max(0, MAX_GUESSES - guesses.length - 1))].map((_, i) => (
            <div key={`empty-${i}`} className={styles.wordRow} style={{ opacity: 0.2 }}>
              {[...Array(puzzle.targetWord.length)].map((_, j) => <div key={`empty-box-${j}`} className={styles.letterBox}></div>)}
            </div>
          ))}

          <div className={styles.wordRow} style={{marginTop: '12px'}}>
            {puzzle.endWord.split('').map((char, i) => (
              <div key={`end-${i}`} className={`${styles.letterBox} ${styles.boxFixed}`}>{char}</div>
            ))}
          </div>
        </div>

        <motion.div className={styles.inputRow} animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
          <input type="text" value={currentGuess} onChange={(e) => setCurrentGuess(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, puzzle.targetWord.length))} disabled={isWin || isGameOver} className={styles.wordInput} placeholder="Type guess..." onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} maxLength={puzzle.targetWord.length} />
        </motion.div>

        <div className={styles.bottomArea}>
          <div className={styles.actionsRow}>
            <button onClick={handleSubmit} disabled={isGameOver || isWin || currentGuess.length !== puzzle.targetWord.length} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Submit</button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className={styles.modalCard}>
                <h2 className={styles.modalTitle}>{isWin ? 'Linked!' : 'Broken Chain.'}</h2>
                <p className={styles.modalDesc}>{isWin ? `You solved it in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}.` : `The missing link was ${puzzle.targetWord}.`}</p>
                <div className={styles.modalActions}>
                  <button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}><Share2 size={18} /> {copied ? 'Copied!' : 'Share Result'}</button>
                  <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Back to Menu</Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Stab" userId={user?.uid} />
    </GameLayout>
  );
}