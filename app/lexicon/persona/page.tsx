"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { Dices, Star } from 'lucide-react';
import { shuffleArray } from '@/lib/puzzles';
import { saveGameStats } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Lexicon.module.css';

type PersonaPuzzle = {
  word: string;
  realDefinition: string;
  fakeDefinitions: string[];
};

export default function LexiconPersona() {
  const [mounted, setMounted] = useState(false);
  const [puzzle, setPuzzle] = useState<PersonaPuzzle | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [guessedOptions, setGuessedOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user } = useAuth();

  const MAX_GUESSES = 3;

  const resetRound = (nextPuzzle: PersonaPuzzle, puzzleId: string | null) => {
    setPuzzle(nextPuzzle);
    setOptions(shuffleArray([nextPuzzle.realDefinition, ...nextPuzzle.fakeDefinitions], Date.now().toString()));
    setGuessedOptions([]);
    setIsGameOver(false);
    setIsWin(false);
    setScore(0);
    setStartTime(Date.now());
    setActionTimeline([]);
    setArenaPuzzleId(puzzleId);
    setArenaRating(0);
    setFeedbackSubmitted(false);
  };

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('LexiconPersona');
    if (!nextArena) {
      alert('No Persona puzzles in queue. Generate "LexiconPersona" in Admin Arena.');
      setPuzzle(null);
      return;
    }
    resetRound(nextArena.data as PersonaPuzzle, nextArena.id);
  };

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (!arenaPuzzleId) return;
    await submitArenaFeedback(arenaPuzzleId, {
      rating,
      won: isWin,
      attempts: guessedOptions.length,
      timeToComplete: Math.floor((Date.now() - startTime) / 1000)
    });
    setFeedbackSubmitted(true);
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

    const currentTimeline = [...actionTimeline, { time: timeOffset, guess: option, isCorrect: option === puzzle.realDefinition }];
    setActionTimeline(currentTimeline);

    const didWin = option === puzzle.realDefinition;
    if (didWin) {
      setIsWin(true);
      setScore(MAX_GUESSES - guessedOptions.length);
    }

    if (didWin || newGuessedOptions.length >= MAX_GUESSES) {
      saveGameStats(user?.uid || null, {
        gameName: 'Lexicon - Persona',
        date: new Date().toISOString().split('T')[0],
        mode: 'persona',
        won: didWin,
        mistakes: didWin ? newGuessedOptions.length - 1 : newGuessedOptions.length,
        attempts: newGuessedOptions.length,
        timeToComplete: Math.floor(timeOffset / 1000),
        isPlayTest: true,
        wrongGuesses: didWin ? guessedOptions : newGuessedOptions,
        timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0,
        actionTimeline: currentTimeline
      });

      setTimeout(() => setIsGameOver(true), 1200);
    }
  };

  if (!mounted) return <div className={styles.container}>Loading...</div>;

  return (
    <GameLayout
      title="Lexicon Persona"
      subtitle="Experimental"
      rightActions={
        <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle">
          <Dices size={18} />
        </button>
      }
    >
      <div className={styles.container}>
        {!puzzle ? (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading prototype...</div>
        ) : !isGameOver ? (
          <>
            <div className={styles.targetBox}>
              <h2 className={styles.targetWord}>{puzzle.word}</h2>
              <p className={styles.targetDesc}>One definition is real. The others are pure performance.</p>
            </div>

            <div className={styles.optionsList}>
              <AnimatePresence mode="wait">
                {options.map((option, index) => {
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
                      key={index}
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
              <h2 className={styles.modalTitle}>{isWin ? 'NAILED IT' : 'CURTAIN CALL'}</h2>
              <p className={styles.modalDesc}>{isWin ? `Score: ${score}` : 'The bluffs got you this round.'}</p>

              <div className={styles.solutionBox}>
                <h3 className={styles.solutionHeader}>Correct Definition</h3>
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
                    <Link href="/lexicon" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                      Menu
                    </Link>
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
