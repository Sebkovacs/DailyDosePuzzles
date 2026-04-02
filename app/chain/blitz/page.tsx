"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices, Star, Clock, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { shuffleArray } from '@/lib/puzzles';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Chain.module.css';

export default function ChainBlitz() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [activeGrid, setActiveGrid] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const { user } = useAuth();

  const handleRandomPuzzle = async () => {
    const nextArena = await getNextArenaPuzzle('Chain');
    if (nextArena) {
      const currentPuzzle = nextArena.data;
      setPuzzle(currentPuzzle);
      
      const baseGrid = [...currentPuzzle.chain];
      const extraWords = ['STAR', 'MOON', 'SKY', 'HOT', 'COLD', 'FAST', 'SLOW', 'BLUE', 'RED', 'GREEN', 'TREE', 'BIRD', 'FISH', 'ROCK', 'SAND', 'WATER', 'FIRE', 'EARTH', 'WIND', 'LIGHT', 'DARK', 'DAY', 'NIGHT', 'SUN', 'CLOUD', 'RAIN', 'SNOW', 'ICE', 'STORM', 'THUNDER', 'LIGHTNING', 'WAVE', 'OCEAN', 'SEA', 'RIVER', 'LAKE', 'POND', 'POOL', 'SWIM', 'DIVE', 'JUMP', 'RUN', 'WALK', 'CRAWL', 'FLY', 'SOAR', 'GLIDE', 'FALL', 'DROP', 'SINK', 'FLOAT', 'RISE', 'CLIMB', 'MOUNTAIN', 'HILL', 'VALLEY', 'CANYON', 'DESERT', 'FOREST', 'JUNGLE', 'WOODS', 'FIELD', 'MEADOW', 'GRASS', 'LEAF', 'BRANCH', 'ROOT', 'TRUNK', 'BARK', 'FLOWER', 'PETAL', 'STEM', 'THORN', 'SEED', 'FRUIT', 'APPLE', 'BANANA', 'ORANGE', 'LEMON', 'LIME', 'GRAPE', 'BERRY', 'MELON', 'PEACH', 'PLUM', 'CHERRY', 'PEAR', 'FIG', 'DATE', 'NUT', 'SEED', 'BEAN', 'PEA', 'CORN', 'WHEAT', 'RICE', 'OAT', 'BARLEY', 'RYE', 'BREAD', 'CAKE', 'PIE', 'TART', 'COOKIE', 'CANDY', 'SWEET', 'SUGAR', 'HONEY', 'SYRUP', 'JAM', 'JELLY', 'BUTTER', 'CHEESE', 'MILK', 'CREAM', 'YOGURT', 'ICE', 'CREAM', 'SHAKE', 'SMOOTHIE', 'JUICE', 'WATER', 'SODA', 'POP', 'COLA', 'TEA', 'COFFEE', 'COCOA', 'HOT', 'CHOCOLATE', 'SOUP', 'STEW', 'BROTH', 'CHILI', 'CURRY', 'SAUCE', 'GRAVY', 'DRESSING', 'DIP', 'SALSA', 'GUACAMOLE', 'HUMMUS', 'PEANUT', 'BUTTER', 'JELLY', 'JAM', 'HONEY', 'SYRUP', 'SUGAR', 'SALT', 'PEPPER', 'SPICE', 'HERB', 'GARLIC', 'ONION', 'TOMATO', 'POTATO', 'CARROT', 'CELERY', 'BROCCOLI', 'CAULIFLOWER', 'CABBAGE', 'LETTUCE', 'SPINACH', 'KALE', 'CHARD', 'BEET', 'TURNIP', 'RADISH', 'ONION', 'GARLIC', 'LEEK', 'SCALLION', 'CHIVE', 'SHALLOT', 'MUSHROOM', 'TRUFFLE', 'FUNGI'];
      
      let attempt = 0;
      while (baseGrid.length < 16) {
        const index = Math.floor(Math.random() * extraWords.length);
        const randomWord = extraWords[index];
        if (!baseGrid.includes(randomWord)) {
          baseGrid.push(randomWord);
        }
        attempt++;
      }
      
      setActiveGrid(shuffleArray(baseGrid, Date.now().toString()));
      setSelectedChain([]);
      setMistakes(0);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Go to Admin and generate "ChainBlitz".');
      setPuzzle(null);
    }
    setIsShaking(false);
    setIsGameOver(false);
    setIsWin(false);
    setFeedbackSubmitted(false);
    setArenaRating(0);
    setTimeLeft(30);
  };

  useEffect(() => {
    handleRandomPuzzle();
  }, []);

  useEffect(() => {
    if (!puzzle || isGameOver || timeLeft <= 0) {
      if (timeLeft <= 0 && !isGameOver) {
        setIsGameOver(true);
        saveGameStats(user?.uid || null, { gameName: 'Chain - Blitz', date: new Date().toISOString().split('T')[0], mode: 'blitz', won: false, mistakes, attempts: mistakes, timeToComplete: 30, isPlayTest: true });
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [puzzle, isGameOver, timeLeft]);

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, mistakes, timeToComplete: 30 - timeLeft });
      setFeedbackSubmitted(true);
    }
  };

  const handleWordClick = (word: string) => {
    if (isWin || isGameOver) return;

    if (selectedChain.includes(word)) {
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
      setIsGameOver(true);
      saveGameStats(user?.uid || null, { gameName: 'Chain - Blitz', date: new Date().toISOString().split('T')[0], mode: 'blitz', won: true, mistakes, attempts: mistakes + 1, timeToComplete: 30 - timeLeft, isPlayTest: true });
    } else {
      setIsShaking(true);
      setTimeout(() => {
        setMistakes(m => m + 1);
        setIsShaking(false);
        setSelectedChain([]);
      }, 600);
    }
  };

  if (!puzzle) return <div className={styles.loadingPlaceholder}>Loading Prototype...</div>;

  return (
    <GameLayout title="Chain Blitz" subtitle="Experimental" rightActions={<button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle"><Dices size={18} /></button>}>
      <div className={styles.container}>
        <div className={styles.instructions}>
          <div className={styles.timerDisplay}>
            <Clock size={24} /> 0:{timeLeft.toString().padStart(2, '0')}
          </div>
        </div>

        <div className={styles.bookend}>{puzzle.startWord}</div>

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
                {isSelected && <span className={styles.wordIndex}>{selectedIndex + 1}</span>}
              </motion.button>
            );
          })}
        </motion.div>

        <div className={styles.bookend}>{puzzle.endWord}</div>

        <div className={styles.bottomArea}>
          <div className={styles.actionsRow}>
            <button onClick={() => setSelectedChain([])} disabled={selectedChain.length === 0 || isGameOver || isWin} className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Clear</button>
            <button onClick={handleSubmit} disabled={selectedChain.length === 0 || isGameOver || isWin} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Submit</button>
          </div>
        </div>

        {isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={styles.modalCard}>
              <h2 className={styles.modalTitle}>{isWin ? 'Chain Complete!' : (timeLeft <= 0 ? 'Time\'s Up!' : 'Broken Chain')}</h2>
              <p className={styles.modalDesc}>{isWin ? `You finished with ${timeLeft} seconds to spare!` : 'Better luck next time.'}</p>
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
                    <button onClick={handleRandomPuzzle} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Next Prototype</button>
                    <Link href="/chain" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Menu</Link>
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