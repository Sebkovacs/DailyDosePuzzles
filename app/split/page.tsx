"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyPuzzle, generateRandomSplit, SplitPuzzle, DailySplit } from '@/lib/split';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, RefreshCw, ChevronLeft, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Split() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<DailySplit | null>(null);
  const [puzzle, setPuzzle] = useState<SplitPuzzle | null>(null);
  
  const [activeTiles, setActiveTiles] = useState<{id: string, word: string}[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [solvedPairs, setSolvedPairs] = useState<[string, string][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const text = `Split - ${dateString}\n${isWin ? 'Solved!' : 'Failed'}\nMistakes: ${mistakes}/${MAX_MISTAKES}\n${isWin ? '🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩' : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomSplit();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyPuzzle(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle.puzzle;
      setPuzzle(currentPuzzle);
      const allWords = currentPuzzle.pairs.flat();
      const tilesWithIds = allWords.map((word: string, index: number) => ({ id: `${word}-${index}`, word }));
      const seedStr = isPlayTest ? Date.now().toString() : dateString;
      setActiveTiles(shuffleArray(tilesWithIds, seedStr));
      setSelectedTiles([]);
      setSolvedPairs([]);
      setMistakes(0);
      setIsShaking(false);
      setStartTime(Date.now());
    }
  }, [dailyPuzzle, dateString, isPlayTest]);

  const handleTileClick = (id: string) => {
    if (selectedTiles.length >= 2 || isShaking || mistakes >= MAX_MISTAKES || solvedPairs.length === 16) return;

    const newSelection = selectedTiles.includes(id)
      ? selectedTiles.filter(t => t !== id)
      : [...selectedTiles, id];

    setSelectedTiles(newSelection);

    if (newSelection.length === 2) {
      checkPair(newSelection[0], newSelection[1]);
    }
  };

  const checkPair = (id1: string, id2: string) => {
    if (!puzzle) return;

    const word1 = activeTiles.find(t => t.id === id1)?.word;
    const word2 = activeTiles.find(t => t.id === id2)?.word;

    if (!word1 || !word2) return;

    const isMatch = puzzle.pairs.some(
      pair => (pair[0] === word1 && pair[1] === word2) || (pair[0] === word2 && pair[1] === word1)
    );

    if (isMatch) {
      setTimeout(() => {
        const newSolvedPairs = [...solvedPairs, [word1, word2] as [string, string]];
        setSolvedPairs(newSolvedPairs);
        setActiveTiles(prev => prev.filter(t => t.id !== id1 && t.id !== id2));
        setSelectedTiles([]);
        
        if (newSolvedPairs.length === 16) {
          saveGameStats(user?.uid || null, {
            gameName: 'Split',
            date: dateString,
            mode: 'hard',
            won: true,
            mistakes,
            attempts: mistakes + 16,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
        }
      }, 400);
    } else {
      setIsShaking(true);
      setTimeout(() => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= MAX_MISTAKES) {
          saveGameStats(user?.uid || null, {
            gameName: 'Split',
            date: dateString,
            mode: 'hard',
            won: false,
            mistakes: newMistakes,
            attempts: newMistakes + solvedPairs.length,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
        }
        setIsShaking(false);
        setSelectedTiles([]);
      }, 600);
    }
  };

  const handleShuffle = () => {
    if (activeTiles.length > 0) {
      setActiveTiles(shuffleArray(activeTiles, Date.now().toString()));
    }
  };

  const isGameOver = mistakes >= MAX_MISTAKES;
  const isWin = solvedPairs.length === 16;

  useEffect(() => {
    if (isWin && user && !isPlayTest) {
      updateStreak(user.uid).catch(console.error);
    }
  }, [isWin, user, isPlayTest]);

  if (!mounted || !puzzle) {
    return <div className="h-[100dvh] flex items-center justify-center bg-[#F5F2ED]">Loading...</div>;
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F5F2ED] text-[#1A1A1A] font-sans selection:bg-emerald-200 flex flex-col items-center">
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
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">SPLIT</h1>
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
        <div className="text-center mb-2 shrink-0">
          <h2 className="text-base font-serif font-bold leading-tight">Create 16 compound words.</h2>
          <p className="text-[10px] text-neutral-600 mt-0.5">Tap two halves to combine them.</p>
        </div>

        <div className="grid grid-cols-2 gap-1 mb-2 shrink-0">
          <AnimatePresence>
            {solvedPairs.map((pair) => (
              <motion.div
                key={pair.join('-')}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full bg-emerald-300 border-[1.5px] border-[#1A1A1A] rounded-sm py-0.5 flex items-center justify-center shadow-[2px_2px_0px_#1A1A1A]"
              >
                <span className="font-black text-[#1A1A1A] tracking-wide text-xs sm:text-sm">
                  {pair[0]}<span className="opacity-50 mx-0.5">+</span>{pair[1]}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div 
          className="grid grid-cols-4 gap-1 mb-2 flex-1 content-start"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {activeTiles.map((tile) => {
              const isSelected = selectedTiles.includes(tile.id);
              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleTileClick(tile.id)}
                  className={`
                    py-1.5 sm:py-2 rounded-sm font-black text-[9px] sm:text-xs transition-all duration-200 flex items-center justify-center uppercase tracking-tight border-[1.5px]
                    ${isSelected 
                      ? 'bg-neutral-800 text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-x-[1px] translate-y-[1px]' 
                      : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-neutral-300 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'}
                  `}
                >
                  {tile.word}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className="mt-auto flex flex-col items-center gap-2">
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

          <div className="flex items-center gap-2 w-full">
            <button 
              onClick={handleShuffle}
              disabled={isGameOver || isWin || activeTiles.length === 0}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-sm border-[1.5px] border-[#1A1A1A] bg-white font-black text-[#1A1A1A] hover:bg-neutral-300 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A] text-base"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Shuffle
            </button>
            <button 
              onClick={() => setSelectedTiles([])}
              disabled={selectedTiles.length === 0 || isGameOver || isWin}
              className="flex-1 py-1.5 rounded-sm border-[1.5px] border-[#1A1A1A] bg-white font-black text-[#1A1A1A] hover:bg-neutral-300 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A] text-base"
            >
              Deselect
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
            >
              <div className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] text-center max-w-sm w-full border-2 border-[#1A1A1A]">
                <h2 className="text-6xl font-serif font-black tracking-tight mb-1">
                  {isWin ? 'Great Job!' : 'Next Time!'}
                </h2>
                <p className="text-base text-neutral-600 font-bold mb-4">
                  {isWin 
                    ? 'You found all the compound words.' 
                    : 'You ran out of mistakes. Try again tomorrow!'}
                </p>
                
                <div className="mb-5 w-full text-left bg-neutral-300 p-3 rounded-md border-2 border-neutral-300">
                  <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Today&apos;s Solution</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {puzzle.pairs.map(p => (
                      <div key={p.join('')} className="bg-white border-2 border-[#1A1A1A] px-2 py-1.5 rounded-md text-base font-black text-center shadow-[4px_4px_0px_#1A1A1A]">
                        {p[0]}<span className="text-neutral-500 mx-0.5">+</span>{p[1]}
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
                  <Link 
                    href="/"
                    className="w-full py-2.5 rounded-md bg-neutral-300 text-[#1A1A1A] text-base font-black hover:bg-neutral-300 transition-colors block text-center border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none"
                  >
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
                  <p>Combine the word halves to form valid compound words.</p>
                  <p>Select two tiles to merge them. If they form a valid word, they will be locked in.</p>
                  <p>Find all 8 compound words to win!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Split" />
    </div>
  );
}
