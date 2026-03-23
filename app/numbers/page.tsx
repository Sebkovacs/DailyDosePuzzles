'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, Share2, X, RotateCcw, Delete, MessageSquare, Dices } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats, updateStreak } from '@/lib/firebase';
import { getDailyNumbers, generateRandomNumbers, NumbersPuzzle } from '@/lib/numbers';
import { FeedbackModal } from '@/components/FeedbackModal';
import styles from './Numbers.module.css';
import { Button } from '@/components/Button';

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
  
  const [availableNumbers, setAvailableNumbers] = useState<NumberItem[]>([]);
  const [history, setHistory] = useState<Step[]>([]);
  
  const [selectedNum1, setSelectedNum1] = useState<NumberItem | null>(null);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (!isWin && puzzle && availableNumbers.some(n => n.value === puzzle.target)) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Numbers',
        date: dateString,
        mode: 'standard',
        won: true,
        mistakes: 0,
        attempts: history.length,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
      if (user && !isPlayTest) {
        updateStreak(user.uid).catch(console.error);
      }
    }
  }, [availableNumbers, isWin, puzzle, user, dateString, history.length, startTime, isPlayTest]);

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

  const handleRandomPuzzle = () => {
    const randomPuzzle = generateRandomNumbers();
    setPuzzle(randomPuzzle);
    const initialNumbers = randomPuzzle.numbers.map((n, i) => ({ id: `init-${i}`, value: n }));
    setAvailableNumbers(initialNumbers);
    setHistory([]);
    setSelectedNum1(null);
    setSelectedOp(null);
    setIsWin(false);
    setIsPlayTest(true);
    setStartTime(Date.now());
  };

  const handleShare = () => {
    const text = `Numbers - ${dateString}\n${isWin ? 'Solved!' : 'Failed'}\nSteps: ${history.length}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted || !puzzle) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerIconGroup}>
          <Link href="/" className={styles.iconBtn}>
            <ChevronLeft size={20} />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback">
              <MessageSquare size={20} />
            </button>
          )}
        </div>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>Numbers</h1>
          <p className={styles.subtitle}>
            {isPlayTest ? 'PLAYTEST MODE' : dateString}
          </p>
        </div>
        <div className={styles.headerIconGroup}>
          {isTester && (
            <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle">
              <Dices size={20} />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className={styles.iconBtn}>
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.instruction}>
          <h2>Reach the target.</h2>
          <p>Use the numbers and basic math to get exactly the target.</p>
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
          <Button
            variant="secondary"
            onClick={handleUndo}
            disabled={history.length === 0 || isWin}
            icon={<RotateCcw size={16} />}
          >
            Undo
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={history.length === 0 || isWin}
            icon={<Delete size={16} />}
          >
            Reset
          </Button>
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

        <AnimatePresence>
          {isWin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.modalOverlay}
            >
              <div className={styles.modalContent}>
                <h2 className={styles.modalTitle}>Target Reached!</h2>
                <p className={styles.modalSubtitle}>You solved it in {history.length} steps.</p>
                <div className={styles.modalActions}>
                  <Button variant="success" fullWidth icon={<Share2 size={18} />} onClick={handleShare}>
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </Button>
                  <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
                    <Button variant="secondary" fullWidth>Back to Menu</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
              className={styles.modalContent}
            >
              <button onClick={() => setShowHelp(false)} className={`${styles.iconBtn} ${styles.closeBtn}`}>
                <X size={20} />
              </button>
              <h2 className={styles.modalTitle}>How to Play</h2>
              <div className={styles.modalSubtitle} style={{ textAlign: 'left', marginTop: '16px' }}>
                <p>Use the provided numbers and basic math operations to reach the exact target number.</p>
                <ul style={{ paddingLeft: '20px', marginTop: '12px', lineHeight: '1.6' }}>
                  <li>You can use each number at most once.</li>
                  <li>You don&apos;t have to use all the numbers.</li>
                  <li>Fractions and negative numbers are not allowed at any step.</li>
                  <li>Select a number, then an operation, then another number.</li>
                </ul>
              </div>
              <Button variant="primary" fullWidth onClick={() => setShowHelp(false)}>
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Numbers" userId={user?.uid} />
    </div>
  );
}
