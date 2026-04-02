"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyPuzzle, generateRandomSplit, SplitPuzzle, DailySplit } from '@/lib/split';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, RefreshCw, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Split.module.css';

export default function Split() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<DailySplit | null>(null);
  const [puzzle, setPuzzle] = useState<SplitPuzzle | null>(null);
  
  const [activeTiles, setActiveTiles] = useState<{id: string, word: string}[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [solvedPairs, setSolvedPairs] = useState<[string, string][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const title = `Split ${dateString}`;

    // Create emoji representation
    const emptySquares = MAX_MISTAKES - mistakes;
    const mistakesEmojis = Array(mistakes).fill('❌').join('');
    const emptyEmojis = Array(emptySquares).fill('⬜').join('');
    const matchesEmoji = '🧩'.repeat(solvedPairs.length);

    const resultText = isWin ? 'Solved' : 'Failed';

    const text = `${title}\n${resultText}\n${matchesEmoji}\n${mistakesEmojis}${emptyEmojis}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomSplit();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyPuzzle(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle.puzzle;
      setPuzzle(currentPuzzle);
      const allWords = currentPuzzle.pairs.flat();
      const tilesWithIds = allWords.map((word: string, index: number) => ({ id: `${word}-${index}`, word }));
      const seedStr = isPlayTest ? Date.now().toString() : dateString;
      setActiveTiles(shuffleArray(tilesWithIds, seedStr));
      setSelectedTiles([]);
      setSolvedPairs([]);
      setMistakes(0);
      setIsShaking(false);
      setStartTime(Date.now());
    }
  }, [dailyPuzzle, dateString, isPlayTest]);

  const handleTileClick = (id: string) => {
    if (selectedTiles.length >= 2 || isShaking || mistakes >= MAX_MISTAKES || solvedPairs.length === 16) return;

    const newSelection = selectedTiles.includes(id)
      ? selectedTiles.filter(t => t !== id)
      : [...selectedTiles, id];

    setSelectedTiles(newSelection);

    if (newSelection.length === 2) {
      checkPair(newSelection[0], newSelection[1]);
    }
  };

  const checkPair = (id1: string, id2: string) => {
    if (!puzzle) return;

    const word1 = activeTiles.find(t => t.id === id1)?.word;
    const word2 = activeTiles.find(t => t.id === id2)?.word;

    if (!word1 || !word2) return;

    const isMatch = puzzle.pairs.some(
      pair => (pair[0] === word1 && pair[1] === word2) || (pair[0] === word2 && pair[1] === word1)
    );

    if (isMatch) {
      setTimeout(() => {
        const newSolvedPairs = [...solvedPairs, [word1, word2] as [string, string]];
        setSolvedPairs(newSolvedPairs);
        setActiveTiles(prev => prev.filter(t => t.id !== id1 && t.id !== id2));
        setSelectedTiles([]);
        
        if (newSolvedPairs.length === 16) {
          saveGameStats(user?.uid || null, {
            gameName: 'Split',
            date: dateString,
            mode: 'hard',
            won: true,
            mistakes,
            attempts: mistakes + 16,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
        }
      }, 400);
    } else {
      setIsShaking(true);
      setTimeout(() => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= MAX_MISTAKES) {
          saveGameStats(user?.uid || null, {
            gameName: 'Split',
            date: dateString,
            mode: 'hard',
            won: false,
            mistakes: newMistakes,
            attempts: newMistakes + solvedPairs.length,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
        }
        setIsShaking(false);
        setSelectedTiles([]);
      }, 600);
    }
  };

  const handleShuffle = () => {
    if (activeTiles.length > 0) {
      setActiveTiles(shuffleArray(activeTiles, Date.now().toString()));
    }
  };

  const isGameOver = mistakes >= MAX_MISTAKES;
  const isWin = solvedPairs.length === 16;

  useEffect(() => {
    if (isWin && user && !isPlayTest) {
      updateStreak(user.uid).catch(console.error);
    }
  }, [isWin, user, isPlayTest]);

  if (!mounted || !puzzle) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

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
      title="Split"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Create 8 compound words.</h2>
          <p className={styles.instructionDesc}>Tap two halves to combine them.</p>
        </div>

        <div className={styles.solvedArea}>
          <AnimatePresence>
            {solvedPairs.map((pair) => (
              <motion.div
                key={pair.join('-')}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={styles.solvedPair}
              >
                <span>
                  {pair[0]}<span className={styles.plusSign}>+</span>{pair[1]}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div 
          className={styles.grid}
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {activeTiles.map((tile) => {
              const isSelected = selectedTiles.includes(tile.id);

              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTileClick(tile.id)}
                  className={`${styles.tileBtn} ${isSelected ? styles.tileBtnSelected : ''}`}
                >
                  {tile.word}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className={styles.bottomArea}>
          <div className={styles.mistakesContainer}>
            <span className={styles.mistakesLabel}>Mistakes Remaining</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div 
                key={i} 
                className={`${styles.mistakeDot} ${i < (MAX_MISTAKES - mistakes) ? styles.mistakeDotActive : ''}`}
              />
            ))}
          </div>

          <div className={styles.actionsRow}>
            <button 
              onClick={handleShuffle}
              disabled={isGameOver || isWin || activeTiles.length === 0}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              <RefreshCw size={16} />
              Shuffle
            </button>
            <button 
              onClick={() => setSelectedTiles([])}
              disabled={selectedTiles.length === 0 || isGameOver || isWin}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              Deselect
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.modalOverlay}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className={styles.modalCard}
              >
                <h2 className={styles.modalTitle}>
                  {isWin ? 'Great Job!' : 'Next Time!'}
                </h2>
                <p className={styles.modalDesc}>
                  {isWin 
                    ? 'You found all the compound words.' 
                    : 'You ran out of mistakes. Try again tomorrow!'}
                </p>
                
                <div className={styles.solutionBox}>
                  <h3 className={styles.solutionHeader}>Today&apos;s Solution</h3>
                  <div className={styles.solutionGrid}>
                    {puzzle.pairs.map(p => (
                      <div key={p.join('')} className={styles.solutionItem}>
                        {p[0]}<span className={styles.plusSign}>+</span>{p[1]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    onClick={handleShare}
                    className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                  >
                    <Share2 size={18} />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link 
                    href="/"
                    className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
                  >
                    Back to Menu
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={styles.modalOverlay}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className={styles.modalCard}
              >
                <button onClick={() => setShowHelp(false)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
                <h2 className={styles.modalTitle}>How to Play</h2>
                <div className={`${styles.modalDesc} ${styles.helpBody}`}>
                  <p className={styles.helpParagraph}>Combine the word halves to form valid compound words.</p>
                  <p className={styles.helpParagraph}>Select two tiles to merge them. If they form a valid word, they will be locked in.</p>
                  <p>Find all 8 compound words to win!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  Play
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Split" userId={user?.uid} />
    </GameLayout>
  );
}
