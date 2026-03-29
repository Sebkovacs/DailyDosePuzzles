'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Share2, X, RotateCcw, Delete, MessageSquare, Dices, Zap, Brain } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats, updateStreak } from '@/lib/firebase';
import { getDailyNumbers, generateRandomNumbers, NumbersPuzzle } from '@/lib/numbers';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Numbers.module.css';

interface NumberItem {
  id: string;
  value: number;
}

interface Step {
  id: string;
  num1: NumberItem;
  op: string;
  num2: NumberItem;
  result: NumberItem;
}

export default function NumbersGame() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [puzzle, setPuzzle] = useState<NumbersPuzzle | null>(null);
  
  const [gameMode, setGameMode] = useState<'select' | 'blitz' | 'zen'>('select');
  const [timeLeft, setTimeLeft] = useState(30);
  const [availableNumbers, setAvailableNumbers] = useState<NumberItem[]>([]);
  const [history, setHistory] = useState<Step[]>([]);
  
  const [selectedNum1, setSelectedNum1] = useState<NumberItem | null>(null);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  
  const [score, setScore] = useState<number | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [finalResult, setFinalResult] = useState<number | null>(null);

  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyNumbers(localDate);
    setPuzzle(daily);
    
    const initialNumbers = daily.numbers.map((n, i) => ({ id: `init-${i}`, value: n }));
    setAvailableNumbers(initialNumbers);
    setStartTime(Date.now());
    setMounted(true);
  }, []);

  // Timer Logic for Blitz Mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameMode === 'blitz' && !isWin && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (gameMode === 'blitz' && timeLeft === 0 && !isWin) {
      handleDeclare(); // Auto-declare when time runs out
    }
    return () => clearInterval(timer);
  }, [gameMode, isWin, timeLeft]);

  useEffect(() => {
    // Exact Match Auto-Win
    if (!isWin && puzzle && gameMode !== 'select' && availableNumbers.some(n => n.value === puzzle.target)) {
      setIsWin(true);
      const steps = history.length;
      setFinalResult(puzzle.target);
      
      if (gameMode === 'blitz') {
        const timeBonus = Math.floor(timeLeft / 5); // Reward for speed
        setScore(10 + timeBonus);
      } else {
        const earnedStars = steps <= 3 ? 3 : steps === 4 ? 2 : 1;
        setStars(earnedStars);
      }

      saveGameStats(user?.uid || null, {
        gameName: 'Numbers',
        date: dateString,
        mode: gameMode,
        won: true,
        mistakes: 0,
        attempts: steps,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
      if (user && !isPlayTest) {
        updateStreak(user.uid).catch(console.error);
      }
    }
  }, [availableNumbers, isWin, puzzle, user, dateString, history.length, startTime, isPlayTest, gameMode, timeLeft]);

  const startGame = (mode: 'blitz' | 'zen') => {
    setGameMode(mode);
    setTimeLeft(30);
    setScore(null);
    setStars(null);
    setFinalResult(null);
    setIsWin(false);
    setHistory([]);
    setSelectedNum1(null);
    setSelectedOp(null);
    if (puzzle) {
      setAvailableNumbers(puzzle.numbers.map((n, i) => ({ id: `init-${i}`, value: n })));
    }
    setStartTime(Date.now());
  };

  const handleNumberClick = (num: NumberItem) => {
    if (isWin) return;
    
    if (selectedNum1 && selectedNum1.id === num.id) {
      // Deselect
      setSelectedNum1(null);
      setSelectedOp(null);
      return;
    }
    
    if (!selectedNum1) {
      setSelectedNum1(num);
    } else if (selectedOp) {
      // Perform operation
      const num1 = selectedNum1;
      const num2 = num;
      let resVal = 0;
      
      if (selectedOp === '+') resVal = num1.value + num2.value;
      else if (selectedOp === '-') resVal = num1.value - num2.value;
      else if (selectedOp === '*') resVal = num1.value * num2.value;
      else if (selectedOp === '/') {
        if (num2.value === 0 || num1.value % num2.value !== 0) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
          return;
        }
        resVal = num1.value / num2.value;
      }
      
      if (resVal <= 0 || !Number.isInteger(resVal)) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }
      
      const resultItem: NumberItem = { id: `res-${Date.now()}`, value: resVal };
      const newStep: Step = { id: `step-${Date.now()}`, num1, op: selectedOp, num2, result: resultItem };
      
      setHistory([...history, newStep]);
      setAvailableNumbers([...availableNumbers.filter(n => n.id !== num1.id && n.id !== num2.id), resultItem]);
      setSelectedNum1(null);
      setSelectedOp(null);
    } else {
      // Change selected num1
      setSelectedNum1(num);
    }
  };

  const handleOpClick = (op: string) => {
    if (isWin || !selectedNum1) return;
    if (selectedOp === op) {
      setSelectedOp(null);
    } else {
      setSelectedOp(op);
    }
  };

  const handleUndo = () => {
    if (isWin || history.length === 0) return;
    
    const lastStep = history[history.length - 1];
    setHistory(history.slice(0, -1));
    
    const newAvailable = availableNumbers.filter(n => n.id !== lastStep.result.id);
    newAvailable.push(lastStep.num1);
    newAvailable.push(lastStep.num2);
    
    // Maintain original order if possible, or just append
    // For simplicity, just append
    setAvailableNumbers(newAvailable);
    setSelectedNum1(null);
    setSelectedOp(null);
  };

  const handleReset = () => {
    if (isWin || !puzzle) return;
    const initialNumbers = puzzle.numbers.map((n, i) => ({ id: `init-${i}`, value: n }));
    setAvailableNumbers(initialNumbers);
    setHistory([]);
    setSelectedNum1(null);
    setSelectedOp(null);
  };

  const handleDeclare = () => {
    if (!puzzle || isWin || gameMode !== 'blitz' || availableNumbers.length === 0) return;
    
    // Find the number on the board closest to the target
    let closest = availableNumbers[0].value;
    let minDelta = Math.abs(closest - puzzle.target);
    
    for (const n of availableNumbers) {
      const d = Math.abs(n.value - puzzle.target);
      if (d < minDelta) {
        minDelta = d;
        closest = n.value;
      }
    }
    
    let earnedScore = 0;
    if (minDelta === 0) earnedScore = 10;
    else if (minDelta <= 5) earnedScore = 7;
    else if (minDelta <= 10) earnedScore = 5;
    
    setScore(earnedScore);
    setFinalResult(closest);
    setIsWin(true); 
    
    saveGameStats(user?.uid || null, {
        gameName: 'Numbers',
        date: dateString,
        mode: 'blitz',
        won: earnedScore > 0,
        mistakes: minDelta,
        attempts: history.length,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
    });
  };

  const handleRandomPuzzle = () => {
    const randomPuzzle = generateRandomNumbers();
    setPuzzle(randomPuzzle);
    setGameMode('select');
    setIsPlayTest(true);
  };

  const handleShare = () => {
    let text = '';
    if (gameMode === 'blitz') {
      text = `Numbers (Blitz) - ${dateString}\nTarget: ${puzzle?.target} | Reached: ${finalResult}\nScore: ${score} pts ⚡`;
    } else {
      const starString = '⭐'.repeat(stars || 0) + '⚪'.repeat(3 - (stars || 0));
      text = `Numbers (Zen) - ${dateString}\nSolved in ${history.length} steps\nEfficiency: ${starString} 🧘`;
    }
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? (
    <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback" aria-label="Give Feedback">
      <MessageSquare size={18} />
    </button>
  ) : null;

  const rightActions = (
    <>
      {isTester && (
        <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle" aria-label="Random Puzzle">
          <Dices size={18} />
        </button>
      )}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help" aria-label="Help">
        <HelpCircle size={18} />
      </button>
    </>
  );

  return (
    <GameLayout
      title="Numbers"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        {gameMode === 'select' ? (
          <div className={styles.selectScreen}>
            <div className={styles.instructions} style={{marginBottom: '24px'}}>
              <h2 className={styles.instructionTitle}>Choose Your Path.</h2>
              <p className={styles.instructionDesc}>How would you like to solve today&apos;s puzzle?</p>
            </div>
            
            <button onClick={() => startGame('blitz')} className={styles.modeCard}>
              <h3 className={styles.modeCardTitle}><Zap size={24} color="var(--accent-ochre)" /> Blitz</h3>
              <p className={styles.modeCardDesc}>30 seconds. Fast math. Get as close to the target as possible before time runs out.</p>
            </button>
            
            <button onClick={() => startGame('zen')} className={styles.modeCard}>
              <h3 className={styles.modeCardTitle}><Brain size={24} color="var(--accent-viridian)" /> Zen</h3>
              <p className={styles.modeCardDesc}>No timer. Must hit the exact target. Scored purely on the efficiency of your steps.</p>
            </button>
          </div>
        ) : (
          <>
            <div className={styles.gameHeader}>
              {gameMode === 'blitz' ? (
                <>
                  <div className={`${styles.timer} ${timeLeft <= 10 ? styles.timerLow : ''}`}>
                    0:{timeLeft.toString().padStart(2, '0')}
                  </div>
                  <button className={styles.declareBtn} onClick={handleDeclare} disabled={isWin || availableNumbers.length === 0}>
                    Declare
                  </button>
                </>
              ) : (
                <div className={styles.instructions} style={{margin: 0, textAlign: 'left'}}>
                  <h2 className={styles.instructionTitle}>Zen Mode</h2>
                  <p className={styles.instructionDesc}>Hit the target in as few steps as possible.</p>
                </div>
              )}
            </div>

            <div className={styles.targetBox}>
              {puzzle.target}
            </div>

            <motion.div 
              className={styles.numbersArea}
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence>
                {availableNumbers.map((num) => {
                  const isSelected = selectedNum1?.id === num.id;
                  const isTarget = num.value === puzzle.target;
                  
                  let btnClass = styles.numberBtn;
                  if (isSelected) {
                    btnClass = `${styles.numberBtn} ${styles.numberBtnSelected}`;
                  } else if (isWin && isTarget) {
                    btnClass = `${styles.numberBtn} ${styles.numberBtnCorrect}`;
                  }

                  return (
                    <motion.button
                      key={num.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={() => handleNumberClick(num)}
                      className={btnClass}
                    >
                      {num.value}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <div className={styles.opsArea}>
              {['+', '-', '*', '/'].map((op) => {
                const isSelected = selectedOp === op;
                return (
                  <button
                    key={op}
                    onClick={() => handleOpClick(op)}
                    disabled={!selectedNum1 || isWin}
                    className={`${styles.opBtn} ${isSelected ? styles.opBtnSelected : ''}`}
                  >
                    {op === '*' ? '×' : op === '/' ? '÷' : op}
                  </button>
                );
              })}
            </div>

            <div className={styles.actionsArea}>
              <button
                onClick={handleUndo}
                disabled={history.length === 0 || isWin}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                <RotateCcw size={16} />
                Undo
              </button>
              <button
                onClick={handleReset}
                disabled={history.length === 0 || isWin}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                <Delete size={16} />
                Reset
              </button>
            </div>

            <div className={styles.historyArea}>
              <AnimatePresence>
                {history.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.historyItem}
                  >
                    <span className={styles.historyIndex}>{index + 1}.</span>
                    <div className={styles.historyEquation}>
                      <span>{step.num1.value}</span>
                      <span className={styles.historyOp}>{step.op === '*' ? '×' : step.op === '/' ? '÷' : step.op}</span>
                      <span>{step.num2.value}</span>
                      <span className={styles.historyOp}>=</span>
                      <span className={styles.historyResult}>{step.result.value}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        <AnimatePresence>
          {isWin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.modalOverlay}
            >
              <div className={styles.modalCard}>
                <h2 className={styles.modalTitle}>{gameMode === 'blitz' ? 'Time Logged!' : 'Calculation Perfect!'}</h2>
                <p className={styles.modalDesc}>
                  {gameMode === 'blitz' 
                    ? `You reached ${finalResult}. (Target was ${puzzle.target})` 
                    : `You found the target in ${history.length} steps.`}
                </p>
                
                {gameMode === 'blitz' && score !== null && (
                  <div className={styles.bigScore}>{score} pts</div>
                )}
                {gameMode === 'zen' && stars !== null && (
                  <div className={styles.starsRow}>
                    {'⭐'.repeat(stars)}{'⚪'.repeat(3 - stars)}
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`} onClick={handleShare}>
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
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={styles.modalCard}
            >
              <button onClick={() => setShowHelp(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
              <h2 className={styles.modalTitle}>How to Play</h2>
              <div className={styles.modalDesc} style={{ textAlign: 'left', marginTop: '16px', marginBottom: '32px' }}>
                <p style={{marginBottom: '12px'}}>Use the provided numbers and basic math operations to reach the exact target number.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '12px', lineHeight: '1.6' }}>
                  <li style={{marginBottom: '8px'}}>You can use each number at most once.</li>
                  <li style={{marginBottom: '8px'}}>You don&apos;t have to use all the numbers.</li>
                  <li style={{marginBottom: '8px'}}>Fractions and negative numbers are not allowed at any step.</li>
                  <li>Select a number, then an operation, then another number.</li>
                </ul>
              </div>
              <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setShowHelp(false)}>
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Numbers" userId={user?.uid} />
    </GameLayout>
  );
}
