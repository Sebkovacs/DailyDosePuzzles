"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Dices, Star, Bot, Share2, X } from 'lucide-react';
import Link from 'next/link';
import { shuffleArray } from '@/lib/puzzles';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { getNextArenaPuzzle, submitArenaFeedback } from '@/lib/arena';
import { GameLayout } from '@/components/GameLayout';
import styles from '../Chain.module.css';

export default function ChainVersus() {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [activeGrid, setActiveGrid] = useState<string[]>([]);
  const [playerPath, setPlayerPath] = useState<string[]>([]);
  const [aiPath, setAiPath] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [arenaPuzzleId, setArenaPuzzleId] = useState<string | null>(null);
  const [arenaRating, setArenaRating] = useState<number>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
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
      setPlayerPath([]);
      setAiPath([nextArena.data.startWord]);
      setMistakes(0);
      setArenaPuzzleId(nextArena.id!);
    } else {
      alert('Arena queue empty! Go to Admin and generate "ChainVersus".');
      setPuzzle(null);
    }
    setIsShaking(false);
    setIsGameOver(false);
    setIsWin(false);
    setStartTime(Date.now());
    setFeedbackSubmitted(false);
    setArenaRating(0);
  };

  useEffect(() => {
    handleRandomPuzzle();
  }, []);

  // AI Opponent Logic
  useEffect(() => {
    if (!puzzle || isGameOver) return;
    const aiTurnInterval = setInterval(() => {
      setAiPath(prev => {
        if (prev.length > puzzle.chain.length) return prev;
        return [...prev, puzzle.chain[prev.length - 1]];
      });
    }, 3000); // AI makes a move every 3 seconds

    return () => clearInterval(aiTurnInterval);
  }, [puzzle, isGameOver]);

  useEffect(() => {
    if (aiPath[aiPath.length - 1] === puzzle?.endWord) {
      setIsWin(false);
      setIsGameOver(true);
      saveGameStats(user?.uid || null, { gameName: 'Chain - Versus', date: new Date().toISOString().split('T')[0], mode: 'versus', won: false, mistakes: 0, attempts: playerPath.length, timeToComplete: Math.floor((Date.now() - startTime) / 1000), isPlayTest: true });
    }
  }, [aiPath]);

  const handleSubmitRating = async (rating: number) => {
    setArenaRating(rating);
    if (arenaPuzzleId) {
      await submitArenaFeedback(arenaPuzzleId, { rating, won: isWin, mistakes, timeToComplete: Math.floor((Date.now() - startTime) / 1000) });
      setFeedbackSubmitted(true);
    }
  };

  const handleWordClick = (word: string) => {
    if (isGameOver) return;

    if (playerPath.includes(word)) {
      if (playerPath[playerPath.length - 1] === word) {
        setPlayerPath(playerPath.slice(0, -1));
      }
    } else {
      setPlayerPath([...playerPath, word]);
    }
  };

  const handleSubmit = () => {
    if (!puzzle) return;
    
    const isCorrect = playerPath.length === puzzle.chain.length && 
                      playerPath.every((val, index) => val === puzzle.chain[index]);
                      
    if (isCorrect) {
      setIsWin(true);
      setIsGameOver(true);
      saveGameStats(user?.uid || null, { gameName: 'Chain - Versus', date: new Date().toISOString().split('T')[0], mode: 'versus', won: true, mistakes, attempts: mistakes + 1, timeToComplete: Math.floor((Date.now() - startTime) / 1000), isPlayTest: true });
    } else {
      setIsShaking(true);
      setTimeout(() => {
        setMistakes(m => m + 1);
        setIsShaking(false);
        setPlayerPath([]);
      }, 600);
    }
  };

  if (!puzzle) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Prototype...</div>;

  return (
    <GameLayout title="Chain Versus" subtitle="Experimental" rightActions={<button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Next Puzzle"><Dices size={18} /></button>}>
      <div className={styles.container} style={{ gap: 0 }}>
        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Race the AI!</h2>
          <p className={styles.instructionDesc}>Complete the chain before the bot does.</p>
        </div>

        <div className={styles.bookend}>{puzzle.startWord}</div>

        <motion.div 
          className={styles.grid}
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {activeGrid.map((word) => {
            const isPlayerSelected = playerPath.includes(word);
            const isAiSelected = aiPath.includes(word);
            let btnClass = styles.wordBtn;
            if (isPlayerSelected) btnClass = `${styles.wordBtn} ${styles.wordBtnSelected}`;
            else if (isAiSelected) btnClass = `${styles.wordBtn} ${styles.aiPathWord}`;

            return (
              <motion.button
                key={word}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWordClick(word)}
                className={btnClass}
                disabled={isPlayerSelected || isAiSelected || isGameOver}
              >
                {word}
              </motion.button>
            );
          })}
        </motion.div>

        <div className={styles.bookend}>{puzzle.endWord}</div>

        <div className={styles.bottomArea}>
          <div className={styles.actionsRow}>
            <button onClick={() => setPlayerPath([])} disabled={playerPath.length === 0 || isGameOver || isWin} className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Clear</button>
            <button onClick={handleSubmit} disabled={playerPath.length === 0 || isGameOver || isWin} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Submit</button>
          </div>
        </div>

        {isGameOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className={styles.modalCard}>
              <h2 className={styles.modalTitle}>{isWin ? 'You Win!' : 'AI Wins!'}</h2>
              <p className={styles.modalDesc}>{isWin ? 'You outpaced the machine!' : 'The AI was too fast this time.'}</p>
              <div className={styles.modalActions} style={{ flexDirection: 'row' }}>
                {arenaPuzzleId && !feedbackSubmitted ? (
                  <div style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-paper)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-ink)' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>Rate this Prototype</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleSubmitRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Star size={28} fill={arenaRating >= star ? 'var(--ink-main)' : 'none'} />
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