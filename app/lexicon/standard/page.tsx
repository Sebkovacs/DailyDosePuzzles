"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyLexicon, generateRandomLexicon, LexiconPuzzle } from '@/lib/lexicon';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, Share2, X, MessageSquare, Dices, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Lexicon.module.css';

export default function Lexicon() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [puzzle, setPuzzle] = useState<LexiconPuzzle | null>(null);
  
  const [options, setOptions] = useState<string[]>([]);
  const [guessedOptions, setGuessedOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [actionTimeline, setActionTimeline] = useState<any[]>([]);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const MAX_GUESSES = 3;

  const handleShare = () => {
    const text = `Lexicon - ${dateString}\n${isWin ? `Score: ${score}/3 🎭` : 'Failed 🎭'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('Lexicon');
    if (nextArena) {
      // We wrap the data in "hard" to match the daily puzzle structure expectation
      setDailyPuzzle({ hard: nextArena.data });
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Falling back to local random generation.');
      setDailyPuzzle(generateRandomLexicon());
      setArenaPuzzleId(null);
    }
    setIsPlayTest(true);
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
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyLexicon(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle.hard; // Lock to Hard Mode
      setPuzzle(currentPuzzle);
      const allOptions = [currentPuzzle.realDefinition, ...currentPuzzle.fakeDefinitions];
      const seedStr = isPlayTest ? Date.now().toString() : dateString + 'hard';
      setOptions(shuffleArray(allOptions, seedStr));
      setGuessedOptions([]);
      setScore(0);
      setIsGameOver(false);
      setIsWin(false);
      setStartTime(Date.now());
      setActionTimeline([]);
    }
  }, [dailyPuzzle, dateString, isPlayTest]);

  const handleOptionClick = (option: string) => {
    if (isGameOver || !puzzle || guessedOptions.includes(option)) return;
    
    const timeOffset = Date.now() - startTime;
    const newGuessedOptions = [...guessedOptions, option];
    setGuessedOptions(newGuessedOptions);

    const currentTimeline = [...actionTimeline, { time: timeOffset, guess: option, isCorrect: option === puzzle.realDefinition }];
    setActionTimeline(currentTimeline);
    
    const isCorrect = option === puzzle.realDefinition;
    
    if (isCorrect) {
      const points = MAX_GUESSES - guessedOptions.length + 1;
      setScore(points);
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Lexicon',
        date: dateString,
        mode: 'hard',
        won: true,
        mistakes: newGuessedOptions.length - 1,
        attempts: newGuessedOptions.length,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest,
        wrongGuesses: guessedOptions, // The previously guessed (incorrect) options
        timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0,
        actionTimeline: currentTimeline
      });
      setTimeout(() => setIsGameOver(true), 1500);
    } else {
      if (newGuessedOptions.length >= MAX_GUESSES) {
        saveGameStats(user?.uid || null, {
          gameName: 'Lexicon',
          date: dateString,
          mode: 'hard',
          won: false,
          mistakes: newGuessedOptions.length,
          attempts: newGuessedOptions.length,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest,
          wrongGuesses: newGuessedOptions, // All guesses were wrong
          timeToFirstAction: currentTimeline.length > 0 ? Math.floor(currentTimeline[0].time / 1000) : 0,
          actionTimeline: currentTimeline
        });
        setTimeout(() => setIsGameOver(true), 1500);
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
      title="Lexicon"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        
        {!isGameOver ? (
          <>
            <div className={styles.targetBox}>
              <h2 className={styles.targetWord}>{puzzle.word}</h2>
              <p className={styles.targetDesc}>Find the real definition.</p>
            </div>

            <div className={styles.optionsList}>
              <AnimatePresence mode="wait">
                {options.map((option, i) => {
                  const isGuessed = guessedOptions.includes(option);
                  const isCorrect = option === puzzle.realDefinition;
                  
                  let buttonClass = styles.optionBtn;
                  
                  if (isGuessed) {
                    if (isCorrect) {
                      buttonClass = `${styles.optionBtn} ${styles.optionBtnCorrect}`;
                    } else {
                      buttonClass = `${styles.optionBtn} ${styles.optionBtnIncorrect}`;
                    }
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

            <div className={styles.bottomArea}>
              <span className={styles.chancesLabel}>Chances</span>
              <div className={styles.dotsGroup}>
                {[...Array(MAX_GUESSES)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`${styles.chanceDot} ${
                      i < guessedOptions.length ? styles.chanceDotUsed : styles.chanceDotRemaining
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={styles.modalOverlay}
          >
            <div className={styles.modalCard}>
              <h2 className={styles.modalTitle}>{isWin ? 'WELL DONE!' : 'GAME OVER!'}</h2>
              <p className={styles.modalDesc}>{isWin ? `You scored ${score} points.` : 'You ran out of guesses.'}</p>
              
              <div className={styles.solutionBox}>
                <h3 className={styles.solutionHeader}>Today&apos;s Word</h3>
                <div className={styles.solutionWord}>{puzzle.word}</div>
                <div className={styles.solutionDef}>{puzzle.realDefinition}</div>
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
                    <button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}>
                      <Share2 size={18} />
                      {copied ? 'Copied!' : 'Share'}
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
                <div className={styles.modalDesc} style={{textAlign: 'left', marginBottom: '32px'}}>
                  <p style={{marginBottom: '12px'}}>You will be presented with an obscure word and six possible definitions.</p>
                  <p style={{marginBottom: '12px'}}>Only <strong style={{color: 'var(--ink-main)'}}>one</strong> definition is real. The others are bluffs.</p>
                  <p>You have 3 guesses. Guess correctly on the first try for 3 points, second try for 2 points, and third try for 1 point.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Lexicon" userId={user?.uid} />
    </GameLayout>
  );
}