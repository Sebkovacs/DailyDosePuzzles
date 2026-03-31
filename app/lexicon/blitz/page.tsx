"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { shuffleArray } from '@/lib/puzzles';
import { Share2, Dices, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Lexicon.module.css';

export default function LexiconBlitz() {
  const [mounted, setMounted] = useState(false);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [guessedOptions, setGuessedOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [startTime, setStartTime] = useState<number>(0);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user } = useAuth();

  const MAX_GUESSES = 1; // In Blitz, you only get 1 guess!

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('LexiconBlitz');
    if (nextArena) {
      const currentPuzzle = nextArena.data;
      setPuzzle(currentPuzzle);
      const allOptions = [currentPuzzle.realDefinition, ...currentPuzzle.fakeDefinitions];
      setOptions(shuffleArray(allOptions, Date.now().toString()));
      setGuessedOptions([]);
      setScore(0);
      setIsGameOver(false);
      setIsWin(false);
      setTimeLeft(10);
      setStartTime(Date.now());
      setActionTimeline([]);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('No Blitz puzzles in queue! Go to the Admin Arena and generate "LexiconBlitz".');
    }
    setFeedbackSubmitted(false);
    setArenaRating(0);
  };

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, attempts: guessedOptions.length, timeToComplete: Math.floor((Date.now() - startTime) / 1000) });
      setFeedbackSubmitted(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    handleRandomPuzzle();
  }, []);

  // The Merciless Timer
  useEffect(() => {
    if (!puzzle || isGameOver) return;
    if (timeLeft <= 0) {
      handleOptionClick("TIMEOUT_NO_GUESS");
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, puzzle, isGameOver]);

  const handleOptionClick = (option: string) => {
    if (isGameOver || !puzzle) return;
    
    const timeOffset = Date.now() - startTime;
    const newGuessedOptions = [...guessedOptions, option];
    setGuessedOptions(newGuessedOptions);

    const currentTimeline = [...actionTimeline, { time: timeOffset, guess: option, isCorrect: option === puzzle.realDefinition }];
    setActionTimeline(currentTimeline);
    
    const isCorrect = option === puzzle.realDefinition;
    
    if (isCorrect) {
      setScore(timeLeft * 10); // Score based on speed!
      setIsWin(true);
    }
    
    saveGameStats(user?.uid || null, {
      gameName: 'Lexicon - Blitz',
      date: new Date().toISOString().split('T')[0],
      mode: 'blitz',
      won: isCorrect,
      mistakes: isCorrect ? 0 : 1,
      attempts: 1,
      timeToComplete: Math.floor(timeOffset / 1000),
      isPlayTest: true,
      wrongGuesses: isCorrect ? [] : [option],
      timeToFirstAction: Math.floor(timeOffset / 1000),
      actionTimeline: currentTimeline
    });
    
    setTimeout(() => setIsGameOver(true), 1500);
  };

  if (!mounted) return <div className={styles.container}>Loading...</div>;

  const rightActions = (
    <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle">
      <Dices size={18} />
    </button>
  );

  return (
    <GameLayout title="Lexicon Blitz" subtitle="Experimental" rightActions={rightActions}>
      <div className={styles.container}>
        {!puzzle ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading prototype...</div>
        ) : !isGameOver ? (
          <>
            <div className={styles.targetBox}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: timeLeft <= 3 ? 'var(--accent-crimson)' : 'var(--ink-main)', fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                <Clock size={24} /> {timeLeft}s
              </div>
              <h2 className={styles.targetWord}>{puzzle.word}</h2>
              <p className={styles.targetDesc}>Find the real definition before time runs out!</p>
            </div>

            <div className={styles.optionsList}>
              <AnimatePresence mode="wait">
                {options.map((option, i) => {
                  const isGuessed = guessedOptions.includes(option);
                  const isCorrect = option === puzzle.realDefinition;
                  let buttonClass = styles.optionBtn;
                  if (isGuessed) {
                    buttonClass = isCorrect ? `${styles.optionBtn} ${styles.optionBtnCorrect}` : `${styles.optionBtn} ${styles.optionBtnIncorrect}`;
                  } else if (isWin && isCorrect) {
                     buttonClass = `${styles.optionBtn} ${styles.optionBtnCorrect}`;
                  }

                  return (
                    <motion.button
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      disabled={isGuessed || isWin || guessedOptions.length >= MAX_GUESSES}
                      className={buttonClass}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <h2 className={styles.modalTitle}>{isWin ? 'FAST REFLEXES!' : 'TOO SLOW!'}</h2>
              <p className={styles.modalDesc}>{isWin ? `You scored ${score} speed points.` : 'Better luck next time.'}</p>
              
              <div className={styles.solutionBox}>
                <h3 className={styles.solutionHeader}>The Word</h3>
                <div className={styles.solutionWord}>{puzzle.word}</div>
                <div className={styles.solutionDef}>{puzzle.realDefinition}</div>
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
                    <Link href="/lexicon" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Menu</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
}