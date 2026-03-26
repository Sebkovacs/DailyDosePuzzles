"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyShift, generateRandomShift, ShiftPuzzle } from '@/lib/shift';
import { HelpCircle, ChevronUp, ChevronDown, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Shift.module.css';

const MAX_MISTAKES = 3;

export default function Shift() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [puzzle, setPuzzle] = useState<ShiftPuzzle | null>(null);
  
  // grid[col][row]
  const [columns, setColumns] = useState<{id: string, letter: string}[][]>([]);
  const [isWin, setIsWin] = useState(false);
  const [isLoss, setIsLoss] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const handleShare = () => {
    const text = `Shift (${mode}) - ${dateString}\n${isWin ? `Solved! 🔠 (${mistakes}/${MAX_MISTAKES} mistakes)` : 'Failed'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomShift();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyShift(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const puzzleForMode = mode === 'easy' ? dailyPuzzle.easy : dailyPuzzle.hard;
      setPuzzle(puzzleForMode);
      
      // Generate deterministic shifts based on date and mode
      const seedStr = isPlayTest ? Date.now().toString() : dateString + mode;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash |= 0;
      }
      
      const numCols = puzzleForMode.words[0].length;
      const numRows = puzzleForMode.words.length;
      const initialShifts = Array.from({ length: numCols }, (_, i) => {
        // Use hash to generate a pseudo-random shift between 1 and numRows - 1
        const shift = Math.abs(hash + i * 17) % (numRows - 1) + 1;
        return shift;
      });
      
      // Build initial columns
      const initialCols: {id: string, letter: string}[][] = [];
      for (let c = 0; c < numCols; c++) {
        const col: {id: string, letter: string}[] = [];
        for (let r = 0; r < numRows; r++) {
          col.push({ id: `cell-${c}-${r}`, letter: puzzleForMode.words[r][c] });
        }
        // Apply initial shift
        const shift = initialShifts[c];
        for (let i = 0; i < shift; i++) {
          col.unshift(col.pop()!);
        }
        initialCols.push(col);
      }
      setColumns(initialCols);
      setIsWin(false);
      setIsLoss(false);
      setMistakes(0);
      setStartTime(Date.now());
    }
  }, [mode, dailyPuzzle, dateString, isPlayTest]);

  const shiftColumn = (colIndex: number, direction: 'up' | 'down') => {
    if (isWin || isLoss || !puzzle) return;
    
    const newCols = [...columns];
    const col = [...newCols[colIndex]];
    
    if (direction === 'down') {
      col.unshift(col.pop()!);
    } else {
      col.push(col.shift()!);
    }
    
    newCols[colIndex] = col;
    setColumns(newCols);
  };

  const handleSubmit = () => {
    if (isWin || isLoss || !puzzle) return;

    let allCorrect = true;
    for (let r = 0; r < puzzle.words.length; r++) {
      let rowStr = '';
      for (let c = 0; c < puzzle.words[0].length; c++) {
        rowStr += columns[c][r].letter;
      }
      if (rowStr !== puzzle.words[r]) {
        allCorrect = false;
        break;
      }
    }
    
    if (allCorrect) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Shift',
        date: dateString,
        mode,
        won: true,
        mistakes,
        attempts: mistakes + 1,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= MAX_MISTAKES) {
        setIsLoss(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Shift',
          date: dateString,
          mode,
          won: false,
          mistakes: newMistakes,
          attempts: newMistakes,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest
        });
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
      title="Shift"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        <div className={styles.modeToggle}>
            <button 
              onClick={() => setMode('easy')}
              className={`${styles.modeBtn} ${mode === 'easy' ? styles.modeBtnActive : ''}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`${styles.modeBtn} ${mode === 'hard' ? styles.modeBtnActive : ''}`}
            >
              Hard
            </button>
        </div>

        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Align the letters.</h2>
          <p className={styles.instructionDesc}>Every row must form a valid word.</p>
        </div>

        <div className={styles.gridContainer}>
          {columns.map((col, cIndex) => (
            <div key={`col-${cIndex}`} className={styles.colGroup}>
              <button 
                onClick={() => shiftColumn(cIndex, 'up')}
                disabled={isWin || isLoss}
                className={styles.arrowBtn}
              >
                <ChevronUp size={20} />
              </button>
              
              <div className={styles.colBackground}>
                {col.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`${styles.letterBox} ${isWin ? styles.letterBoxCorrect : ''}`}
                  >
                    {item.letter}
                  </motion.div>
                ))}
              </div>
              
              <button 
                onClick={() => shiftColumn(cIndex, 'down')}
                disabled={isWin || isLoss}
                className={styles.arrowBtn}
              >
                <ChevronDown size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.mistakesContainer}>
            <span className={styles.mistakesLabel}>Mistakes Remaining</span>
            <div className={styles.dotsGroup}>
              {[...Array(MAX_MISTAKES)].map((_, i) => (
                <div 
                  key={i} 
                  className={`${styles.mistakeDot} ${i < (MAX_MISTAKES - mistakes) ? styles.mistakeDotActive : ''}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.actionsRow}>
            <button 
              onClick={handleSubmit}
              disabled={isWin || isLoss}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
            >
              Submit
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isWin || isLoss) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={styles.modalOverlay}
            >
              <div className={styles.modalCard}>
                <h2 className={styles.modalTitle}>
                  {isWin ? 'Unlocked!' : 'Locked Out'}
                </h2>
                <p className={styles.modalDesc}>
                  {isWin ? 'You aligned all the words.' : 'Out of chances!'}
                </p>
                
                <div className={styles.solutionBox}>
                  <h3 className={styles.solutionHeader}>Target Words</h3>
                  {puzzle.words.map(word => (
                    <div key={word} className={styles.targetWord}>
                      {word}
                    </div>
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}>
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
                className={styles.modalCard}
              >
                <button onClick={() => setShowHelp(false)} className={styles.closeBtn} aria-label="Close help modal">
                  <X size={20} />
                </button>
                <h2 className={styles.modalTitle}>How to Play</h2>
                <div className={styles.modalDesc} style={{ textAlign: 'left', marginTop: '16px', marginBottom: '32px' }}>
                  <p style={{marginBottom: '12px'}}>Slide the columns up and down to align the letters.</p>
                  <p style={{marginBottom: '12px'}}>Every row must form a valid word.</p>
                  <p style={{marginBottom: '12px'}}>Click Submit to check your answer.</p>
                  <p>You have 3 chances to get it right!</p>
                </div>
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setShowHelp(false)}>
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Shift" userId={user?.uid} />
    </GameLayout>
  );
}
  