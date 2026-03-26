"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailySpectrum, generateRandomSpectrum, SpectrumPuzzle, SpectrumItem, DailySpectrum } from '@/lib/spectrum';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Spectrum.module.css';

export default function Spectrum() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<DailySpectrum | null>(null);
  const [puzzle, setPuzzle] = useState<SpectrumPuzzle | null>(null);
  const [currentOrder, setCurrentOrder] = useState<SpectrumItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const [isEasyMode, setIsEasyMode] = useState(true);
  const [lockedPairs, setLockedPairs] = useState<Set<string>>(new Set());
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const mode = isEasyMode ? 'Easy' : 'Hard';
    const statusEmoji = isWin ? '🏆' : '💀';
    // Generates a visual emoji representation of their game (e.g. ❌❌⚪)
    const mistakeEmojis = '❌'.repeat(mistakes) + '⚪'.repeat(MAX_MISTAKES - mistakes);
    
    const text = `Spectrum (${mode}) - ${dateString}\n` +
                 `${statusEmoji} ${mistakeEmojis}\n` +
                 `Play at: puzzlesaursos.com`; // Change to your actual domain
                 
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLockedBlock = (index: number, order: SpectrumItem[], locked: Set<string>) => {
    let start = index;
    let end = index;
    while (start > 0 && locked.has(`${order[start-1].id}|${order[start].id}`)) start--;
    while (end < order.length - 1 && locked.has(`${order[end].id}|${order[end+1].id}`)) end++;
    return { start, end };
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomSpectrum();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    const daily = getDailySpectrum(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const puzzleForMode = isEasyMode ? dailyPuzzle.easy : dailyPuzzle.hard;
      setPuzzle(puzzleForMode);
      const seedStr = isPlayTest ? Date.now().toString() : dateString + (isEasyMode ? 'easy' : 'hard');
      setCurrentOrder(shuffleArray([...puzzleForMode.items], seedStr));
      setMistakes(0);
      setLockedPairs(new Set());
      setCorrectPositions([]);
      setIsWin(false);
      setSelectedIndex(null);
      setStartTime(Date.now());
    }
  }, [isEasyMode, dailyPuzzle, dateString, isPlayTest]);

  const handleItemClick = (index: number) => {
    if (isWin || mistakes >= MAX_MISTAKES) return;
    
    const block = getLockedBlock(index, currentOrder, lockedPairs);
    
    if (selectedIndex === null) {
      setSelectedIndex(block.start);
    } else {
      const block1 = getLockedBlock(selectedIndex, currentOrder, lockedPairs);
      const block2 = block;
      
      if (block1.start === block2.start) {
        setSelectedIndex(null);
        return;
      }
      
      const first = block1.start < block2.start ? block1 : block2;
      const second = block1.start < block2.start ? block2 : block1;
      
      const itemsFirst = currentOrder.slice(first.start, first.end + 1);
      const itemsSecond = currentOrder.slice(second.start, second.end + 1);
      
      const newOrder = [...currentOrder];
      newOrder.splice(second.start, second.end - second.start + 1, ...itemsFirst);
      newOrder.splice(first.start, first.end - first.start + 1, ...itemsSecond);
      
      setCurrentOrder(newOrder);
      setSelectedIndex(null);
    }
  };

  const handleSubmit = () => {
    if (!puzzle) return;
    
    const reversedItems = [...puzzle.items].reverse();
    const isCorrectForward = currentOrder.every((val, i) => val.id === puzzle.items[i].id);
    const isCorrectBackward = currentOrder.every((val, i) => val.id === reversedItems[i].id);
    
    if (isCorrectForward || isCorrectBackward) {
      setIsWin(true);
      setCorrectPositions(currentOrder.map(() => true));
      saveGameStats(user?.uid || null, {
        gameName: 'Spectrum',
        date: dateString,
        mode: isEasyMode ? 'easy' : 'hard',
        won: true,
        mistakes,
        attempts: mistakes + 1,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
      return;
    }

    const newMistakes = mistakes + 1;
    setMistakes(newMistakes);
    
    if (newMistakes >= MAX_MISTAKES) {
      saveGameStats(user?.uid || null, {
        gameName: 'Spectrum',
        date: dateString,
        mode: isEasyMode ? 'easy' : 'hard',
        won: false,
        mistakes: newMistakes,
        attempts: newMistakes,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
    }

    if (isEasyMode) {
      const newLocked = new Set(lockedPairs);
      for (let i = 0; i < currentOrder.length - 1; i++) {
        const a = currentOrder[i];
        const b = currentOrder[i+1];
        const idxA = puzzle.items.findIndex(x => x.id === a.id);
        const idxB = puzzle.items.findIndex(x => x.id === b.id);
        if (Math.abs(idxA - idxB) === 1) {
          newLocked.add(`${a.id}|${b.id}`);
          newLocked.add(`${b.id}|${a.id}`);
        }
      }
      setLockedPairs(newLocked);
    } else {
      let forwardCorrect = 0;
      let backwardCorrect = 0;
      const forwardPositions = currentOrder.map((item, idx) => {
        const isCorrect = item.id === puzzle.items[idx].id;
        if (isCorrect) forwardCorrect++;
        return isCorrect;
      });
      const backwardPositions = currentOrder.map((item, idx) => {
        const isCorrect = item.id === reversedItems[idx].id;
        if (isCorrect) backwardCorrect++;
        return isCorrect;
      });
      
      if (forwardCorrect >= backwardCorrect) {
        setCorrectPositions(forwardPositions);
      } else {
        setCorrectPositions(backwardPositions);
      }
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
      title="Spectrum"
      subtitle={isPlayTest ? 'PLAYTEST MODE' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        <div className={styles.modeToggle}>
            <button
              onClick={() => { if(!isGameOver && !isWin) { setIsEasyMode(true); setMistakes(0); setLockedPairs(new Set()); setCorrectPositions([]); } }}
              className={`${styles.modeBtn} ${isEasyMode ? styles.modeBtnActive : ''}`}
            >
              Easy
            </button>
            <button
              onClick={() => { if(!isGameOver && !isWin) { setIsEasyMode(false); setMistakes(0); setLockedPairs(new Set()); setCorrectPositions([]); } }}
              className={`${styles.modeBtn} ${!isEasyMode ? styles.modeBtnActive : ''}`}
            >
              Hard
            </button>
        </div>

        <div className={styles.instruction}>
          <h2>Sort the items.</h2>
          <p>Hidden metric: {puzzle.metric}</p>
        </div>

        <div className={styles.puzzleArea}>
          <AnimatePresence>
            {currentOrder.map((item, idx) => {
              const block = getLockedBlock(idx, currentOrder, lockedPairs);
              const isSelected = selectedIndex !== null && block.start === getLockedBlock(selectedIndex, currentOrder, lockedPairs).start;
              const isCorrect = correctPositions[idx];
              
              const isLockedPrev = idx > 0 && lockedPairs.has(`${currentOrder[idx-1].id}|${item.id}`);
              const isLockedNext = idx < currentOrder.length - 1 && lockedPairs.has(`${item.id}|${currentOrder[idx+1].id}`);
              
              return (
                <motion.button
                  key={item.id}
                  layout
                  onClick={() => handleItemClick(idx)}
                  className={`
                    ${styles.itemBtn}
                    ${isSelected ? styles.itemBtnSelected : ''}
                    ${isCorrect && (isWin || isGameOver) ? styles.itemBtnCorrect : ''}
                    ${isLockedPrev ? styles.itemBtnLockedPrev : ''}
                    ${isLockedNext ? styles.itemBtnLockedNext : ''}
                  `}
                >
                  <span>{item.text}</span>
                  <span className={styles.itemIndex}>{idx + 1}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <div className={styles.footer}>
          <div className={styles.chances}>
            <span className={styles.chancesText}>Chances</span>
            <div className={styles.dotsGroup}>
              {[...Array(MAX_MISTAKES)].map((_, i) => (
                <div key={i} className={`${styles.dot} ${i < (MAX_MISTAKES - mistakes) ? styles.dotActive : styles.dotInactive}`} />
              ))}
            </div>
          </div>
          <button 
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            onClick={handleSubmit}
            disabled={isGameOver || isWin}
          >
            Submit Order
          </button>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={styles.modalOverlay}
            >
              <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>{isWin ? 'Perfect Order' : 'Not Quite'}</h2>
                <p className={styles.modalSubtitle}>{isWin ? 'You sorted them correctly.' : 'You ran out of mistakes.'}</p>
                
                <div className={styles.solutionBox}>
                  <h3 className={styles.solutionHeader}>Today&apos;s Order: {puzzle.metric}</h3>
                  <div>
                    {puzzle.items.map((item, i) => (
                      <div key={item.id} className={styles.solutionItem}>
                        <span className={styles.solutionIndex}>{i+1}.</span>
                        <span className={styles.solutionText}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                    onClick={handleShare}
                  >
                    <Share2 size={18} />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
                    Back to Menu
                  </Link>
                </div>
              </div>
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
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
              >
              <button onClick={() => setShowHelp(false)} className={styles.closeBtn} aria-label="Close help modal">
                <X size={20} />
                </button>
              <h2 className={styles.modalTitle}>How to Play</h2>
              <div className={styles.modalSubtitle} style={{ textAlign: 'left', marginTop: '16px' }}>
                  <p style={{marginBottom: '12px'}}>Arrange the items in the correct order based on a hidden metric. <strong style={{color: 'var(--ink-main)'}}>Both forward and backward orders are accepted!</strong></p>
                  <p style={{marginBottom: '12px'}}>Tap two items to swap their positions.</p>
                  <p style={{marginBottom: '12px'}}><strong style={{color: 'var(--ink-main)'}}>Easy Mode:</strong> Correctly adjacent items will lock together into blocks.</p>
                  <p><strong style={{color: 'var(--ink-main)'}}>Hard Mode:</strong> No locks. You only see how many are in the correct spot.</p>
                </div>
              <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setShowHelp(false)}>
                  Got it
              </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Spectrum" userId={user?.uid} />
    </GameLayout>
  );
}
  