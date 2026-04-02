"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { shuffleArray } from '@/lib/puzzles';
import { Share2, Dices, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Lexicon.module.css';

export default function LexiconReverse() {
  const [mounted, setMounted] = useState(false);
  const [puzzle, setPuzzle] = useState<any>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [guessedOptions, setGuessedOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user } = useAuth();

  const MAX_GUESSES = 2;

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('LexiconReverse');
    if (nextArena) {
      const currentPuzzle = nextArena.data;
      setPuzzle(currentPuzzle);
      const allOptions = [currentPuzzle.realWord, ...currentPuzzle.fakeWords];
      setOptions(shuffleArray(allOptions, Date.now().toString()));
      setGuessedOptions([]);
      setIsGameOver(false);
      setIsWin(false);
      setStartTime(Date.now());
      setActionTimeline([]);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('No Reverse puzzles in queue! Go to the Admin Arena and generate "LexiconReverse".');
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

  const handleOptionClick = (option: string) => {
    if (isGameOver || !puzzle || guessedOptions.includes(option)) return;
    
    const timeOffset = Date.now() - startTime;
    const newGuessedOptions = [...guessedOptions, option];
    setGuessedOptions(newGuessedOptions);

    const currentTimeline = [...actionTimeline, { time: timeOffset, guess: option, isCorrect: option === puzzle.realWord }];
    setActionTimeline(currentTimeline);
    
    const isCorrect = option === puzzle.realWord;
    
    if (isCorrect) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Lexicon - Reverse',
        date: new Date().toISOString().split('T')[0],
        mode: 'reverse',
        won: true,
        mistakes: newGuessedOptions.length - 1,
        attempts: newGuessedOptions.length,
        timeToComplete: Math.floor(timeOffset / 1000),
        isPlayTest: true,
        wrongGuesses: guessedOptions,
        timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0,
        actionTimeline: currentTimeline
      });
      setTimeout(() => setIsGameOver(true), 1500);
    } else {
      if (newGuessedOptions.length >= MAX_GUESSES) {
        saveGameStats(user?.uid || null, {
          gameName: 'Lexicon - Reverse',
          date: new Date().toISOString().split('T')[0],
          mode: 'reverse',
          won: false,
          mistakes: newGuessedOptions.length,
          attempts: newGuessedOptions.length,
          timeToComplete: Math.floor(timeOffset / 1000),
          isPlayTest: true,
          wrongGuesses: newGuessedOptions,
          timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0,
          actionTimeline: currentTimeline
        });
        setTimeout(() => setIsGameOver(true), 1500);
      }
    }
  };

  if (!mounted) return <div className={styles.container}>Loading...</div>;

  const rightActions = (
    <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle">
      <Dices size={18} />
    </button>
  );

  return (
    <GameLayout title="Lexicon Reverse" subtitle="Experimental" rightActions={rightActions}>
      <div className={styles.container}>
        {!puzzle ? (
          <div className={styles.loadingPlaceholder}>Loading prototype...</div>
        ) : !isGameOver ? (
          <>
            <div className={styles.targetBoxReverse}>
              <p className={styles.definitionText}>"{puzzle.definition}"</p>
              <p className={styles.hintText}>What is the word?</p>
            </div>

            <div className={styles.optionsList}>
              <AnimatePresence mode="wait">
                {options.map((option, i) => {
                  const isGuessed = guessedOptions.includes(option);
                  const isCorrect = option === puzzle.realWord;
                  let buttonClass = styles.optionBtn;
                  if (isGuessed) {
                    buttonClass = isCorrect ? `${styles.optionBtn} ${styles.optionBtnCorrect}` : `${styles.optionBtn} ${styles.optionBtnIncorrect}`;
                  } else if (isWin && isCorrect) {
                     buttonClass = `${styles.optionBtn} ${styles.optionBtnCorrect}`;
                  }

                  return (
                    <motion.button key={i} onClick={() => handleOptionClick(option)} disabled={isGuessed || isWin || guessedOptions.length >= MAX_GUESSES} className={buttonClass}>
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
              <h2 className={styles.modalTitle}>{isWin ? 'BRILLIANT!' : 'FOOLED!'}</h2>
              
              <div className={styles.solutionBox}>
                <div className={styles.solutionWord}>{puzzle.realWord}</div>
                <div className={styles.solutionDef}>{puzzle.definition}</div>
              </div>

              <div className={styles.modalActions}>
                {arenaPuzzleId && !feedbackSubmitted ? (
                  <div className={styles.feedbackBox}>
                    <p className={styles.feedbackTitle}>Rate this Prototype</p>
                    <div className={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleSubmitRating(star)} className={styles.starBtn} aria-label={`Rate ${star} stars`}>
                          <Star size={28} fill={arenaRating >= star ? 'var(--color-text-primary)' : 'none'} />
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