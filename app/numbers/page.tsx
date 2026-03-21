'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, Share2, X, RotateCcw, Delete, MessageSquare, Dices } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats, updateStreak } from '@/lib/firebase';
import { getDailyNumbers, generateRandomNumbers, NumbersPuzzle } from '@/lib/numbers';
import { FeedbackModal } from '@/components/FeedbackModal';

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

  if (!mounted || !puzzle) return <div className="h-[100dvh] flex items-center justify-center bg-[#F5F2ED]">Loading...</div>;

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F5F2ED] text-[#1A1A1A] font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-2 py-1 flex items-center justify-between border-b-[1.5px] border-[#1A1A1A] shrink-0">
        <div className="flex items-center gap-1">
          <Link href="/" className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors text-blue-600" title="Give Feedback">
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">NUMBERS</h1>
          <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-0.5">
            {isPlayTest ? 'PLAYTEST MODE' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors text-emerald-600" title="Random Puzzle">
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-4 flex flex-col overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-base font-serif font-bold leading-tight">Reach the target.</h2>
          <p className="text-[10px] text-neutral-600 mt-0.5">Use the numbers and basic math to get exactly the target.</p>
        </div>

        <div className="w-full bg-[#1A1A1A] text-white rounded-xl py-6 text-center font-black text-6xl mb-8 shadow-[6px_6px_0px_#1A1A1A] border-[2px] border-[#1A1A1A]">
          {puzzle.target}
        </div>

        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-8"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence>
            {availableNumbers.map((num) => {
              const isSelected = selectedNum1?.id === num.id;
              const isTarget = num.value === puzzle.target;
              
              let bgClass = 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-neutral-200 shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';
              if (isSelected) {
                bgClass = 'bg-blue-400 text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-x-[2px] translate-y-[2px]';
              } else if (isWin && isTarget) {
                bgClass = 'bg-[#00FF00] text-[#1A1A1A] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A]';
              }

              return (
                <motion.button
                  key={num.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => handleNumberClick(num)}
                  className={`
                    w-16 h-16 rounded-lg font-black text-2xl transition-all duration-200 flex items-center justify-center border-[2px]
                    ${bgClass}
                  `}
                >
                  {num.value}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-center gap-2 mb-8">
          {['+', '-', '*', '/'].map((op) => {
            const isSelected = selectedOp === op;
            return (
              <button
                key={op}
                onClick={() => handleOpClick(op)}
                disabled={!selectedNum1 || isWin}
                className={`
                  w-12 h-12 rounded-lg font-black text-2xl transition-all duration-200 flex items-center justify-center border-[2px]
                  ${isSelected ? 'bg-blue-400 text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-x-[2px] translate-y-[2px]' : 'bg-neutral-200 text-[#1A1A1A] border-[#1A1A1A] hover:bg-neutral-300 shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed'}
                `}
              >
                {op === '*' ? '×' : op === '/' ? '÷' : op}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isWin}
            className="flex items-center gap-1 px-4 py-2 bg-white border-[1.5px] border-[#1A1A1A] rounded-md font-bold text-sm hover:bg-neutral-200 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={handleReset}
            disabled={history.length === 0 || isWin}
            className="flex items-center gap-1 px-4 py-2 bg-white border-[1.5px] border-[#1A1A1A] rounded-md font-bold text-sm hover:bg-neutral-200 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Delete className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full max-w-xs mx-auto">
          <AnimatePresence>
            {history.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between py-2 border-b-[1.5px] border-neutral-300 last:border-0 font-mono text-lg"
              >
                <span className="text-neutral-600">{index + 1}.</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{step.num1.value}</span>
                  <span className="text-blue-500 font-black">{step.op === '*' ? '×' : step.op === '/' ? '÷' : step.op}</span>
                  <span className="font-bold">{step.num2.value}</span>
                  <span className="text-neutral-400">=</span>
                  <span className="font-black text-[#1A1A1A]">{step.result.value}</span>
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
              className="mt-4 p-4 bg-white border-[2px] border-[#1A1A1A] rounded-xl shadow-[6px_6px_0px_#1A1A1A] text-center"
            >
              <h3 className="text-2xl font-serif font-black uppercase mb-2">Target Reached!</h3>
              <p className="text-sm font-bold text-neutral-600 mb-4">You solved it in {history.length} steps.</p>
              <button
                onClick={handleShare}
                className="w-full py-3 bg-[#1A1A1A] text-white rounded-lg font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? 'Copied!' : <><Share2 className="w-5 h-5" /> Share Result</>}
              </button>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#F5F2ED] border-[2px] border-[#1A1A1A] rounded-xl p-6 max-w-sm w-full shadow-[8px_8px_0px_#1A1A1A]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-serif font-black uppercase">How to Play</h2>
                <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-neutral-200 rounded-sm transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 text-sm font-medium">
                <p>Use the provided numbers and basic math operations to reach the exact target number.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You can use each number at most once.</li>
                  <li>You don&apos;t have to use all the numbers.</li>
                  <li>Fractions and negative numbers are not allowed at any step.</li>
                  <li>Select a number, then an operation, then another number.</li>
                </ul>
                <div className="mt-6 pt-4 border-t-[1.5px] border-[#1A1A1A]">
                  <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider text-center">New puzzle every day</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Numbers" />
    </div>
  );
}
