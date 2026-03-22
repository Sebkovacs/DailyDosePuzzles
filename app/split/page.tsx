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
    const title = `Split ${dateString}`;

    // Create emoji representation
    const emptySquares = MAX_MISTAKES - mistakes;
    const mistakesEmojis = Array(mistakes).fill('❌').join('');
    const emptyEmojis = Array(emptySquares).fill('⬜').join('');
    const matchesEmoji = '🧩'.repeat(solvedPairs.length);

    const resultText = isWin ? 'Solved' : 'Failed';

    const text = `${title}\n${resultText}\n${matchesEmoji}\n${mistakesEmojis}${emptyEmojis}`;

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
    <div className="h-[100dvh] overflow-hidden bg-white text-neutral-800 font-sans flex flex-col items-center">
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-1">
          <Link href="/" className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className="p-1.5 hover:bg-neutral-300 rounded-sm transition-colors text-blue-600" title="Give Feedback">
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">Split</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            {isPlayTest ? 'Playtest' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-2 hover:bg-neutral-100 text-emerald-500 rounded-full transition-colors" title="Random Puzzle">
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-6 flex flex-col overflow-y-auto">
        <div className="text-center mb-8 shrink-0">
          <h2 className="text-lg font-serif font-medium text-neutral-800">Create 8 compound words.</h2>
          <p className="text-xs text-neutral-500 mt-1">Tap two halves to combine them.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
          <AnimatePresence>
            {solvedPairs.map((pair) => (
              <motion.div
                key={pair.join('-')}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-2 flex items-center justify-center"
              >
                <span className="font-bold text-emerald-800 tracking-wide text-xs sm:text-sm">
                  {pair[0]}<span className="opacity-50 mx-1 text-emerald-500">+</span>{pair[1]}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div 
          className="grid grid-cols-4 gap-2 mb-4 flex-1 content-start"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="popLayout">
            {activeTiles.map((tile) => {
              const isSelected = selectedTiles.includes(tile.id);

              let bgClass = 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300';
              if (isSelected) {
                bgClass = 'bg-emerald-600 text-white border-emerald-600 scale-95';
              }

              return (
                <motion.button
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTileClick(tile.id)}
                  className={`
                    py-2 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-200 flex items-center justify-center uppercase tracking-wider relative border
                    ${bgClass}
                  `}
                >
                  {tile.word}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Mistakes Remaining</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < (MAX_MISTAKES - mistakes) ? 'bg-emerald-500 scale-100' : 'bg-neutral-200 scale-75'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={handleShuffle}
              disabled={isGameOver || isWin || activeTiles.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-neutral-200 bg-white font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-all text-sm active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Shuffle
            </button>
            <button 
              onClick={() => setSelectedTiles([])}
              disabled={selectedTiles.length === 0 || isGameOver || isWin}
              className="flex-1 py-3 rounded-full bg-neutral-900 text-white font-bold hover:bg-black disabled:opacity-50 transition-all text-sm active:scale-95"
            >
              Deselect
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-100"
              >
                <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-neutral-900">
                  {isWin ? 'Great Job!' : 'Next Time!'}
                </h2>
                <p className="text-sm text-neutral-500 mb-6">
                  {isWin 
                    ? 'You found all the compound words.' 
                    : 'You ran out of mistakes. Try again tomorrow!'}
                </p>
                
                <div className="mb-6 w-full text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <h3 className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest mb-3 text-center">Today&apos;s Solution</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {puzzle.pairs.map(p => (
                      <div key={p.join('')} className="bg-white border border-neutral-200 px-3 py-2 rounded-xl text-sm font-bold text-center text-neutral-800">
                        {p[0]}<span className="text-neutral-300 mx-1">+</span>{p[1]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link 
                    href="/"
                    className="block w-full py-3.5 rounded-full bg-neutral-100 text-neutral-600 text-sm font-bold hover:bg-neutral-200 transition-colors active:scale-95 text-center"
                  >
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
                  <p>Combine the word halves to form valid compound words.</p>
                  <p>Select two tiles to merge them. If they form a valid word, they will be locked in.</p>
                  <p>Find all 8 compound words to win!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-colors active:scale-95">
                  Play
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
