"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyChain, generateRandomChain, ChainPuzzle } from '@/lib/chain';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Chain.module.css';

export default function Chain() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [puzzle, setPuzzle] = useState<ChainPuzzle | null>(null);
  const [activeGrid, setActiveGrid] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [wrongGuesses, setWrongGuesses] = useState<string[][]>([]);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const title = `Chain ${dateString}`;

    // Create emoji representation
    const emptySquares = MAX_MISTAKES - mistakes;
    const mistakesEmojis = Array(mistakes).fill('❌').join('');
    const emptyEmojis = Array(emptySquares).fill('⬜').join('');
    const linksEmoji = '🔗'.repeat(puzzle?.chain.length || 0);

    const resultText = isWin ? 'Solved' : 'Failed';

    const text = `${title}\n${resultText}\n${linksEmoji}\n${mistakesEmojis}${emptyEmojis}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomChain();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyChain(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle.puzzle;
      setPuzzle(currentPuzzle);
      
      // Generate grid by adding some deterministic random words to the chain
      const baseGrid = [...currentPuzzle.chain];
      const extraWords = ['STAR', 'MOON', 'SKY', 'HOT', 'COLD', 'FAST', 'SLOW', 'BLUE', 'RED', 'GREEN', 'TREE', 'BIRD', 'FISH', 'ROCK', 'SAND', 'WATER', 'FIRE', 'EARTH', 'WIND', 'LIGHT', 'DARK', 'DAY', 'NIGHT', 'SUN', 'CLOUD', 'RAIN', 'SNOW', 'ICE', 'STORM', 'THUNDER', 'LIGHTNING', 'WAVE', 'OCEAN', 'SEA', 'RIVER', 'LAKE', 'POND', 'POOL', 'SWIM', 'DIVE', 'JUMP', 'RUN', 'WALK', 'CRAWL', 'FLY', 'SOAR', 'GLIDE', 'FALL', 'DROP', 'SINK', 'FLOAT', 'RISE', 'CLIMB', 'MOUNTAIN', 'HILL', 'VALLEY', 'CANYON', 'DESERT', 'FOREST', 'JUNGLE', 'WOODS', 'FIELD', 'MEADOW', 'GRASS', 'LEAF', 'BRANCH', 'ROOT', 'TRUNK', 'BARK', 'FLOWER', 'PETAL', 'STEM', 'THORN', 'SEED', 'FRUIT', 'APPLE', 'BANANA', 'ORANGE', 'LEMON', 'LIME', 'GRAPE', 'BERRY', 'MELON', 'PEACH', 'PLUM', 'CHERRY', 'PEAR', 'FIG', 'DATE', 'NUT', 'SEED', 'BEAN', 'PEA', 'CORN', 'WHEAT', 'RICE', 'OAT', 'BARLEY', 'RYE', 'BREAD', 'CAKE', 'PIE', 'TART', 'COOKIE', 'CANDY', 'SWEET', 'SUGAR', 'HONEY', 'SYRUP', 'JAM', 'JELLY', 'BUTTER', 'CHEESE', 'MILK', 'CREAM', 'YOGURT', 'ICE', 'CREAM', 'SHAKE', 'SMOOTHIE', 'JUICE', 'WATER', 'SODA', 'POP', 'COLA', 'TEA', 'COFFEE', 'COCOA', 'HOT', 'CHOCOLATE', 'SOUP', 'STEW', 'BROTH', 'CHILI', 'CURRY', 'SAUCE', 'GRAVY', 'DRESSING', 'DIP', 'SALSA', 'GUACAMOLE', 'HUMMUS', 'PEANUT', 'BUTTER', 'JELLY', 'JAM', 'HONEY', 'SYRUP', 'SUGAR', 'SALT', 'PEPPER', 'SPICE', 'HERB', 'GARLIC', 'ONION', 'TOMATO', 'POTATO', 'CARROT', 'CELERY', 'BROCCOLI', 'CAULIFLOWER', 'CABBAGE', 'LETTUCE', 'SPINACH', 'KALE', 'CHARD', 'BEET', 'TURNIP', 'RADISH', 'ONION', 'GARLIC', 'LEEK', 'SCALLION', 'CHIVE', 'SHALLOT', 'MUSHROOM', 'TRUFFLE', 'FUNGI'];
      
      const seedStr = isPlayTest ? Date.now().toString() : dateString;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash |= 0;
      }
      
      let attempt = 0;
      while (baseGrid.length < 16) {
        // Use hash and attempt to generate a pseudo-random index
        const index = Math.abs(hash + attempt * 31) % extraWords.length;
        const randomWord = extraWords[index];
        if (!baseGrid.includes(randomWord)) {
          baseGrid.push(randomWord);
        }
        attempt++;
      }
      
      setActiveGrid(shuffleArray(baseGrid, seedStr));
      setSelectedChain([]);
      setMistakes(0);
      setWrongGuesses([]);
      setIsWin(false);
      setIsShaking(false);
      setStartTime(Date.now());
    }
  }, [dailyPuzzle, dateString, isPlayTest]);

  const handleWordClick = (word: string) => {
    if (isWin || mistakes >= MAX_MISTAKES) return;
    
    if (selectedChain.includes(word)) {
      // If clicking the last selected word, remove it
      if (selectedChain[selectedChain.length - 1] === word) {
        setSelectedChain(selectedChain.slice(0, -1));
      }
    } else {
      setSelectedChain([...selectedChain, word]);
    }
  };

  const handleSubmit = () => {
    if (!puzzle) return;
    
    const isCorrect = selectedChain.length === puzzle.chain.length && 
                      selectedChain.every((val, index) => val === puzzle.chain[index]);
                      
    if (isCorrect) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Chain',
        date: dateString,
        mode: 'hard',
        won: true,
        mistakes,
        attempts: mistakes + 1,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest,
        wrongGuesses
      });
    } else {
      setIsShaking(true);
      const newWrongGuesses = [...wrongGuesses, selectedChain];
      setWrongGuesses(newWrongGuesses);
      setTimeout(() => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= MAX_MISTAKES) {
          saveGameStats(user?.uid || null, {
            gameName: 'Chain',
            date: dateString,
            mode: 'hard',
            won: false,
            mistakes: newMistakes,
            attempts: newMistakes,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest,
            wrongGuesses: newWrongGuesses
          });
        }
        setIsShaking(false);
        setSelectedChain([]);
      }, 600);
    }
  };

  const isGameOver = mistakes >= MAX_MISTAKES;

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
      title="Chain"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Connect the words.</h2>
          <p className={styles.instructionDesc}>Find the {puzzle.chain.length + 1}-step path from Start to End.</p>
        </div>

        <div className={styles.bookend}>
          {puzzle.startWord}
        </div>

        <motion.div 
          className={styles.grid}
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {activeGrid.map((word) => {
            const selectedIndex = selectedChain.indexOf(word);
            const isSelected = selectedIndex !== -1;

            return (
              <motion.button
                key={word}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWordClick(word)}
                className={`${styles.wordBtn} ${isSelected ? styles.wordBtnSelected : ''}`}
              >
                {word}
                {isSelected && (
                  <span className={styles.wordIndex}>{selectedIndex + 1}</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <div className={styles.bookend}>
          {puzzle.endWord}
        </div>

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
              onClick={() => setSelectedChain([])}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
            >
              Clear
            </button>
            <button 
              onClick={handleSubmit}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              Submit
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={styles.modalOverlay}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className={styles.modalCard}
              >
                <h2 className={styles.modalTitle}>{isWin ? 'Chain Linked!' : 'Broken Chain!'}</h2>
                <p className={styles.modalDesc}>{isWin ? 'You found the correct path.' : 'You ran out of mistakes.'}</p>
                
                <div className={styles.chainResultBox}>
                  <h3 className={styles.chainResultLabel}>Today&apos;s Chain</h3>
                  <div className={styles.chainFlow}>
                    <span className={styles.chainWordEnd}>{puzzle.startWord}</span>
                    {puzzle.chain.map(word => (
                      <div key={word} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className={styles.chainArrow}>→</span>
                        <span className={styles.chainWord}>{word}</span>
                      </div>
                    ))}
                    <span className={styles.chainArrow}>→</span>
                    <span className={styles.chainWordEnd}>{puzzle.endWord}</span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    onClick={handleShare}
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
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
                  <X className="w-5 h-5" />
                </button>
                <h2 className={styles.modalTitle}>How to Play</h2>
                <div className={styles.modalDesc} style={{textAlign: 'left', marginBottom: '32px'}}>
                  <p style={{marginBottom: '12px'}}>Find the {puzzle.chain.length + 1}-step path from the <strong style={{color: 'var(--ink-main)'}}>Start</strong> word to the <strong style={{color: 'var(--ink-main)'}}>End</strong> word.</p>
                  <p style={{marginBottom: '12px'}}>Each word in the chain must be strongly associated with the previous one to form a common compound word or phrase.</p>
                  <p>Select words in the correct sequence to build your chain and submit to check your answer.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} style={{width: '100%'}}>
                  Play
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Chain" userId={user?.uid} />
    </GameLayout>
  );
}
