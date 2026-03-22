"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailySpectrum, generateRandomSpectrum, SpectrumPuzzle, SpectrumItem } from '@/lib/spectrum';
import { shuffleArray } from '@/lib/utils/shuffle';
import { ChevronLeft, HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Spectrum() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const text = `Spectrum (${mode}) - ${dateString}\n${isWin ? 'Solved!' : 'Failed'}\nMistakes: ${mistakes}/${MAX_MISTAKES}`;
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
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">SPECTRUM</h1>
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

      <main className="flex-1 min-h-0 w-full max-w-md px-2 py-2 flex flex-col overflow-y-auto">
        <div className="flex justify-center mb-2 shrink-0">
          <div className="bg-neutral-300 p-0.5 rounded-sm flex gap-1 border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
            <button
              onClick={() => { if(!isGameOver && !isWin) { setIsEasyMode(true); setMistakes(0); setLockedPairs(new Set()); setCorrectPositions([]); } }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${isEasyMode ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Easy
            </button>
            <button
              onClick={() => { if(!isGameOver && !isWin) { setIsEasyMode(false); setMistakes(0); setLockedPairs(new Set()); setCorrectPositions([]); } }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${!isEasyMode ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="text-center mb-2">
          <h2 className="text-base font-serif font-bold leading-tight">Sort the items.</h2>
          <p className="text-[10px] text-neutral-600 mt-0.5">Hidden metric: {puzzle.metric}</p>
        </div>

        <div className="flex flex-col mb-2 flex-1 justify-center">
          <AnimatePresence>
            {currentOrder.map((item, idx) => {
              const block = getLockedBlock(idx, currentOrder, lockedPairs);
              const isSelected = selectedIndex !== null && block.start === getLockedBlock(selectedIndex, currentOrder, lockedPairs).start;
              const isCorrect = correctPositions[idx];
              
              const isLockedPrev = idx > 0 && lockedPairs.has(`${currentOrder[idx-1].id}|${item.id}`);
              const isLockedNext = idx < currentOrder.length - 1 && lockedPairs.has(`${item.id}|${currentOrder[idx+1].id}`);
              const marginTop = idx === 0 ? 'mt-0' : isLockedPrev ? 'mt-0' : 'mt-1.5';
              
              return (
                <motion.button
                  key={item.id}
                  layout
                  onClick={() => handleItemClick(idx)}
                  className={`
                    w-full px-2 py-1.5 font-black text-[10px] sm:text-base transition-all duration-200 flex items-center justify-between
                    ${marginTop}
                    ${isLockedPrev ? 'rounded-t-none border-t border-t-indigo-200/50' : 'rounded-t-lg'}
                    ${isLockedNext ? 'rounded-b-none border-b-0' : 'rounded-b-lg'}
                    ${isSelected ? 'bg-neutral-800 text-white border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A] translate-x-[1px] translate-y-[1px]' : 
                      isCorrect && (isWin || isGameOver) ? 'bg-[#00FF00] text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' :
                      isLockedPrev || isLockedNext ? 'bg-indigo-200 text-[#1A1A1A] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' :
                      'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-neutral-300 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}
                    border-[1.5px]
                  `}
                >
                  <span>{item.text}</span>
                  <span className="text-[10px] opacity-50">{idx + 1}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mr-1">Chances</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-sm transition-colors duration-300 ${i < (MAX_MISTAKES - mistakes) ? 'bg-amber-500' : 'bg-neutral-300'}`} />
            ))}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isGameOver || isWin}
            className="w-full py-1.5 rounded-sm bg-black text-white text-base font-black hover:bg-black disabled:opacity-50 transition-colors border-[1.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A]"
          >
            Submit Order
          </button>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
            >
              <div className="bg-white p-4 rounded-md shadow-[6px_6px_0px_#1A1A1A] text-center max-w-sm w-full border-[1.5px] border-[#1A1A1A]">
                <h2 className="text-6xl font-serif font-black tracking-tight mb-1">{isWin ? 'Perfect Order!' : 'Not Quite!'}</h2>
                <p className="text-[10px] text-neutral-600 font-bold mb-3">{isWin ? 'You sorted them correctly.' : 'You ran out of mistakes.'}</p>
                
                <div className="mb-4 w-full text-left bg-neutral-300 p-2 rounded-sm border-[1.5px] border-neutral-300">
                  <h3 className="font-black text-[9px] text-neutral-500 uppercase tracking-wider mb-1 text-center">Today&apos;s Order</h3>
                  <p className="text-[10px] font-black text-neutral-800 mb-1.5 text-center">{puzzle.metric}</p>
                  <div className="flex flex-col gap-1">
                    {puzzle.items.map((item, i) => (
                      <div key={item.id} className="flex items-center gap-2 text-[10px] bg-white border-[1.5px] border-[#1A1A1A] px-2 py-1 rounded-md shadow-[3px_3px_0px_#1A1A1A]">
                        <span className="text-neutral-600 font-mono text-[9px] w-3">{i+1}.</span>
                        <span className="font-black">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleShare}
                    className="w-full py-2.5 rounded-md bg-[#F27D26] text-[#1A1A1A] text-base font-black hover:bg-amber-500 transition-colors flex items-center justify-center gap-2 border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none"
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
                  <p>Arrange the items in the correct order based on a hidden metric. <strong>Both forward and backward orders are accepted!</strong></p>
                  <p>Tap two items to swap their positions.</p>
                  <p><strong>Easy Mode:</strong> Correctly adjacent items will lock together into blocks.</p>
                  <p><strong>Hard Mode:</strong> No locks. You only see how many are in the correct spot.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Spectrum" />
    </div>
  );
}
