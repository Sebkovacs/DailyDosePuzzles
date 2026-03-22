"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyShift, generateRandomShift, ShiftPuzzle } from '@/lib/shift';
import { ChevronLeft, HelpCircle, ChevronUp, ChevronDown, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

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
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">SHIFT</h1>
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

      <main className="flex-1 min-h-0 w-full max-w-md px-2 py-2 flex flex-col items-center overflow-y-auto">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-4 w-full">
          <div className="bg-neutral-300 p-0.5 rounded-sm flex gap-1 border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] w-full max-w-[200px]">
            <button 
              onClick={() => setMode('easy')}
              className={`flex-1 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'easy' ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`flex-1 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors ${mode === 'hard' ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-serif font-bold leading-tight">Align the letters.</h2>
          <p className="text-[10px] text-neutral-600 mt-0.5">Every row must form a valid word.</p>
        </div>

        <div className="flex gap-1 bg-white p-2 rounded-sm shadow-[4px_4px_0px_#1A1A1A] border-[1.5px] border-[#1A1A1A] w-full max-w-[340px] mx-auto justify-center mb-6">
          {columns.map((col, cIndex) => (
            <div key={`col-${cIndex}`} className="flex flex-col items-center gap-1">
              <button 
                onClick={() => shiftColumn(cIndex, 'up')}
                disabled={isWin || isLoss}
                className="p-1 text-[#1A1A1A] hover:bg-neutral-300 bg-white border-[1.5px] border-[#1A1A1A] rounded-sm transition-colors disabled:opacity-50 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none w-full flex justify-center"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col gap-1 bg-neutral-200 p-1 rounded-sm border-[1.5px] border-[#1A1A1A]">
                {col.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl font-black border-[1.5px] border-[#1A1A1A] rounded-sm shadow-[2px_2px_0px_#1A1A1A]
                      ${isWin ? 'bg-[#00FF00] text-[#1A1A1A]' : 'bg-white text-[#1A1A1A]'}
                    `}
                  >
                    {item.letter}
                  </motion.div>
                ))}
              </div>
              
              <button 
                onClick={() => shiftColumn(cIndex, 'down')}
                disabled={isWin || isLoss}
                className="p-1 text-[#1A1A1A] hover:bg-neutral-300 bg-white border-[1.5px] border-[#1A1A1A] rounded-sm transition-colors disabled:opacity-50 shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none w-full flex justify-center"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mr-1">Chances</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-sm transition-colors duration-300 ${
                  i < (MAX_MISTAKES - mistakes) ? 'bg-emerald-500' : 'bg-neutral-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isWin || isLoss}
            className="w-full py-2 rounded-sm bg-[#1A1A1A] text-white text-base font-black uppercase tracking-widest border-[1.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-black active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0px_#1A1A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>

        <AnimatePresence>
          {(isWin || isLoss) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
            >
              <div className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] text-center max-w-sm w-full border-2 border-[#1A1A1A]">
                <h2 className="text-6xl font-serif font-black tracking-tight mb-1">
                  {isWin ? 'UNLOCKED!' : 'LOCKED OUT'}
                </h2>
                <p className="text-base font-bold text-neutral-600 mb-4">
                  {isWin ? 'You aligned all the words.' : 'Out of chances!'}
                </p>
                
                <div className="mb-5 w-full text-left bg-neutral-300 p-3 rounded-md border-2 border-neutral-300">
                  <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Target Words</h3>
                  <div className="flex flex-col gap-1.5">
                    {puzzle.words.map(word => (
                      <div key={word} className="bg-white border-2 border-[#1A1A1A] px-2 py-1.5 rounded-md text-base font-black text-center tracking-[0.3em] shadow-[3px_3px_0px_#1A1A1A] uppercase">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleShare}
                    className="w-full py-2.5 rounded-md bg-[#00FF00] text-[#1A1A1A] text-base font-black hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className="block w-full py-2.5 rounded-md bg-neutral-300 text-[#1A1A1A] text-base font-black hover:bg-neutral-300 transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
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
              className="absolute inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] max-w-sm w-full relative border-2 border-[#1A1A1A]"
              >
                <button onClick={() => setShowHelp(false)} className="absolute top-3 right-3 p-1.5 text-[#1A1A1A] hover:bg-neutral-300 rounded-sm transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <h2 className="text-6xl font-serif font-black mb-3">How to Play</h2>
                <div className="space-y-3 text-base text-neutral-600">
                  <p>Slide the columns up and down to align the letters.</p>
                  <p>Every row must form a valid word.</p>
                  <p>Click <span className="text-[#1A1A1A] bg-[#00FF00] px-1.5 py-0.5 rounded-sm border-[1.5px] border-[#1A1A1A] font-black text-xs">SUBMIT</span> to check your answer.</p>
                  <p>You have 3 chances to get it right!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Shift" userId={user?.uid} />
    </div>
  );
}
