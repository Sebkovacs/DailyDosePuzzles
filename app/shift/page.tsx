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
    const title = `Shift (${mode}) ${dateString}`;

    // Create emoji representation
    const emptySquares = MAX_MISTAKES - mistakes;
    const mistakesEmojis = Array(mistakes).fill('❌').join('');
    const emptyEmojis = Array(emptySquares).fill('⬜').join('');

    const resultText = isWin ? 'Solved' : 'Failed';
    const resultEmoji = isWin ? '🔠' : '';

    const text = `${title}\n${resultText} ${resultEmoji}\n${mistakesEmojis}${isWin ? '🟩' : ''}${emptyEmojis}`;

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

  if (!mounted || !puzzle) return <div className="h-[100dvh] flex items-center justify-center bg-white">Loading...</div>;

  return (
    <div className="h-[100dvh] overflow-hidden bg-white text-neutral-800 font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-1">
          <Link href="/" className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-blue-600" title="Give Feedback">
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">Shift</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            {isPlayTest ? 'Playtest' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-2 hover:bg-neutral-100 text-violet-500 rounded-full transition-colors" title="Random Puzzle">
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-6 flex flex-col items-center overflow-y-auto">
        <div className="flex justify-center mb-6 w-full">
          <div className="bg-neutral-100 p-1 rounded-full flex gap-1 border border-neutral-200 w-full max-w-[200px]">
            <button 
              onClick={() => setMode('easy')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'easy' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => setMode('hard')}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'hard' ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-serif font-medium text-neutral-800">Align the letters.</h2>
          <p className="text-xs text-neutral-500 mt-1">Every row must form a valid word.</p>
        </div>

        <div className="flex gap-2 bg-neutral-50 p-4 rounded-3xl border border-neutral-200 w-full max-w-[340px] mx-auto justify-center mb-8">
          {columns.map((col, cIndex) => (
            <div key={`col-${cIndex}`} className="flex flex-col items-center gap-2">
              <button 
                onClick={() => shiftColumn(cIndex, 'up')}
                disabled={isWin || isLoss}
                className="p-2 text-neutral-500 hover:bg-white hover:text-neutral-800 border border-transparent hover:border-neutral-200 rounded-full transition-colors disabled:opacity-50 active:scale-95 w-full flex justify-center"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col gap-2 p-1">
                {col.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                      w-10 h-12 sm:w-12 sm:h-14 flex items-center justify-center text-xl font-bold rounded-xl border transition-colors
                      ${isWin ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-800 shadow-sm'}
                    `}
                  >
                    {item.letter}
                  </motion.div>
                ))}
              </div>
              
              <button 
                onClick={() => shiftColumn(cIndex, 'down')}
                disabled={isWin || isLoss}
                className="p-2 text-neutral-500 hover:bg-white hover:text-neutral-800 border border-transparent hover:border-neutral-200 rounded-full transition-colors disabled:opacity-50 active:scale-95 w-full flex justify-center"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 w-full pb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Mistakes Remaining</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < (MAX_MISTAKES - mistakes) ? 'bg-violet-500 scale-100' : 'bg-neutral-200 scale-75'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isWin || isLoss}
            className="w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-black active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>

        <AnimatePresence>
          {(isWin || isLoss) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-100"
              >
                <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-neutral-900">
                  {isWin ? 'Unlocked!' : 'Locked Out'}
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  {isWin ? 'You aligned all the words.' : 'Out of chances!'}
                </p>
                
                <div className="mb-6 w-full text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <h3 className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest mb-3 text-center">Target Words</h3>
                  <div className="flex flex-col gap-2">
                    {puzzle.words.map(word => (
                      <div key={word} className="bg-white border border-neutral-200 px-3 py-2.5 rounded-xl text-sm font-bold text-center tracking-[0.4em] text-neutral-800 uppercase">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-full bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className="block w-full py-3.5 rounded-full bg-neutral-100 text-neutral-600 text-sm font-bold hover:bg-neutral-200 transition-colors active:scale-95 text-center">
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
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full relative"
              >
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-serif font-black mb-4">How to Play</h2>
                <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
                  <p>Slide the columns up and down to align the letters.</p>
                  <p>Every row must form a valid word.</p>
                  <p>Click <span className="text-neutral-900 bg-neutral-100 px-2 py-1 rounded-md font-bold text-[10px]">SUBMIT</span> to check your answer.</p>
                  <p>You have 3 chances to get it right!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-colors active:scale-95">
                  Play
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Shift" />
    </div>
  );
}
