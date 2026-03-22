"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyChain, generateRandomChain, ChainPuzzle } from '@/lib/chain';
import { shuffleArray } from '@/lib/puzzles';
import { ChevronLeft, HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Chain() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [puzzle, setPuzzle] = useState<ChainPuzzle | null>(null);
  const [activeGrid, setActiveGrid] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isWin, setIsWin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [wrongGuesses, setWrongGuesses] = useState<string[][]>([]);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const text = `Chain - ${dateString}\n${isWin ? 'Solved!' : 'Failed'}\nMistakes: ${mistakes}/${MAX_MISTAKES}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomChain();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyChain(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle.puzzle;
      setPuzzle(currentPuzzle);
      
      // Generate grid by adding some deterministic random words to the chain
      const baseGrid = [...currentPuzzle.chain];
      const extraWords = ['STAR', 'MOON', 'SKY', 'HOT', 'COLD', 'FAST', 'SLOW', 'BLUE', 'RED', 'GREEN', 'TREE', 'BIRD', 'FISH', 'ROCK', 'SAND', 'WATER', 'FIRE', 'EARTH', 'WIND', 'LIGHT', 'DARK', 'DAY', 'NIGHT', 'SUN', 'CLOUD', 'RAIN', 'SNOW', 'ICE', 'STORM', 'THUNDER', 'LIGHTNING', 'WAVE', 'OCEAN', 'SEA', 'RIVER', 'LAKE', 'POND', 'POOL', 'SWIM', 'DIVE', 'JUMP', 'RUN', 'WALK', 'CRAWL', 'FLY', 'SOAR', 'GLIDE', 'FALL', 'DROP', 'SINK', 'FLOAT', 'RISE', 'CLIMB', 'MOUNTAIN', 'HILL', 'VALLEY', 'CANYON', 'DESERT', 'FOREST', 'JUNGLE', 'WOODS', 'FIELD', 'MEADOW', 'GRASS', 'LEAF', 'BRANCH', 'ROOT', 'TRUNK', 'BARK', 'FLOWER', 'PETAL', 'STEM', 'THORN', 'SEED', 'FRUIT', 'APPLE', 'BANANA', 'ORANGE', 'LEMON', 'LIME', 'GRAPE', 'BERRY', 'MELON', 'PEACH', 'PLUM', 'CHERRY', 'PEAR', 'FIG', 'DATE', 'NUT', 'SEED', 'BEAN', 'PEA', 'CORN', 'WHEAT', 'RICE', 'OAT', 'BARLEY', 'RYE', 'BREAD', 'CAKE', 'PIE', 'TART', 'COOKIE', 'CANDY', 'SWEET', 'SUGAR', 'HONEY', 'SYRUP', 'JAM', 'JELLY', 'BUTTER', 'CHEESE', 'MILK', 'CREAM', 'YOGURT', 'ICE', 'CREAM', 'SHAKE', 'SMOOTHIE', 'JUICE', 'WATER', 'SODA', 'POP', 'COLA', 'TEA', 'COFFEE', 'COCOA', 'HOT', 'CHOCOLATE', 'SOUP', 'STEW', 'BROTH', 'CHILI', 'CURRY', 'SAUCE', 'GRAVY', 'DRESSING', 'DIP', 'SALSA', 'GUACAMOLE', 'HUMMUS', 'PEANUT', 'BUTTER', 'JELLY', 'JAM', 'HONEY', 'SYRUP', 'SUGAR', 'SALT', 'PEPPER', 'SPICE', 'HERB', 'GARLIC', 'ONION', 'TOMATO', 'POTATO', 'CARROT', 'CELERY', 'BROCCOLI', 'CAULIFLOWER', 'CABBAGE', 'LETTUCE', 'SPINACH', 'KALE', 'CHARD', 'BEET', 'TURNIP', 'RADISH', 'ONION', 'GARLIC', 'LEEK', 'SCALLION', 'CHIVE', 'SHALLOT', 'MUSHROOM', 'TRUFFLE', 'FUNGI'];
      
      const seedStr = isPlayTest ? Date.now().toString() : dateString;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash |= 0;
      }
      
      let attempt = 0;
      while (baseGrid.length < 16) {
        // Use hash and attempt to generate a pseudo-random index
        const index = Math.abs(hash + attempt * 31) % extraWords.length;
        const randomWord = extraWords[index];
        if (!baseGrid.includes(randomWord)) {
          baseGrid.push(randomWord);
        }
        attempt++;
      }
      
      setActiveGrid(shuffleArray(baseGrid, seedStr));
      setSelectedChain([]);
      setMistakes(0);
      setWrongGuesses([]);
      setIsWin(false);
      setIsShaking(false);
      setStartTime(Date.now());
    }
  }, [dailyPuzzle, dateString, isPlayTest]);

  const handleWordClick = (word: string) => {
    if (isWin || mistakes >= MAX_MISTAKES) return;
    
    if (selectedChain.includes(word)) {
      // If clicking the last selected word, remove it
      if (selectedChain[selectedChain.length - 1] === word) {
        setSelectedChain(selectedChain.slice(0, -1));
      }
    } else {
      setSelectedChain([...selectedChain, word]);
    }
  };

  const handleSubmit = () => {
    if (!puzzle) return;
    
    const isCorrect = selectedChain.length === puzzle.chain.length && 
                      selectedChain.every((val, index) => val === puzzle.chain[index]);
                      
    if (isCorrect) {
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Chain',
        date: dateString,
        mode: 'hard',
        won: true,
        mistakes,
        attempts: mistakes + 1,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest,
        wrongGuesses
      });
    } else {
      setIsShaking(true);
      const newWrongGuesses = [...wrongGuesses, selectedChain];
      setWrongGuesses(newWrongGuesses);
      setTimeout(() => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= MAX_MISTAKES) {
          saveGameStats(user?.uid || null, {
            gameName: 'Chain',
            date: dateString,
            mode: 'hard',
            won: false,
            mistakes: newMistakes,
            attempts: newMistakes,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest,
            wrongGuesses: newWrongGuesses
          });
        }
        setIsShaking(false);
        setSelectedChain([]);
      }, 600);
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
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">CHAIN</h1>
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
        <div className="text-center mb-2">
          <h2 className="text-base font-serif font-bold leading-tight">Connect the words.</h2>
          <p className="text-[10px] text-neutral-600 mt-0.5">Find the {puzzle.chain.length + 1}-step path from Start to End.</p>
        </div>

        <div className="w-full bg-[#1A1A1A] text-white rounded-sm py-2 text-center font-black text-base mb-2 shadow-[4px_4px_0px_#1A1A1A] border-[1.5px] border-[#1A1A1A]">
          {puzzle.startWord}
        </div>

        <motion.div 
          className="grid grid-cols-4 gap-1 mb-2 flex-1 content-start"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {(() => {
            const selectedChainMap = new Map(selectedChain.map((word, index) => [word, index]));
            return activeGrid.map((word) => {
              const selectedIndex = selectedChainMap.has(word) ? selectedChainMap.get(word)! : -1;
              const isSelected = selectedIndex !== -1;
            
            let bgClass = 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-neutral-300 shadow-[3px_3px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none';
            if (isSelected) {
              bgClass = 'bg-neutral-800 text-white border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-x-[1px] translate-y-[1px]';
            }

            return (
              <motion.button
                key={word}
                onClick={() => handleWordClick(word)}
                className={`
                  aspect-square rounded-sm font-black text-[8px] sm:text-[10px] transition-all duration-200 flex flex-col items-center justify-center uppercase tracking-tight relative border-[1.5px]
                  ${bgClass}
                `}
              >
                {word}
                {isSelected && (
                  <span className="absolute top-0.5 right-1 text-[7px] opacity-70">{selectedIndex + 1}</span>
                )}
              </motion.button>
            );
          });
          })()}
        </motion.div>

        <div className="w-full bg-[#1A1A1A] text-white rounded-sm py-2 text-center font-black text-base mb-2 shadow-[4px_4px_0px_#1A1A1A] border-[1.5px] border-[#1A1A1A]">
          {puzzle.endWord}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mr-1">Chances</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-sm transition-colors duration-300 ${i < (MAX_MISTAKES - mistakes) ? 'bg-indigo-500' : 'bg-neutral-300'}`} />
            ))}
          </div>
          
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setSelectedChain([])}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className="flex-1 py-1.5 rounded-sm border-[1.5px] border-[#1A1A1A] bg-white font-black text-[#1A1A1A] hover:bg-neutral-300 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A] text-base"
            >
              Clear
            </button>
            <button 
              onClick={handleSubmit}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className="flex-1 py-1.5 rounded-sm bg-[#1A1A1A] text-white font-black hover:bg-black disabled:opacity-50 transition-colors border-[1.5px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A] text-base"
            >
              Submit
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
            >
              <div className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] text-center max-w-sm w-full border-2 border-[#1A1A1A]">
                <h2 className="text-6xl font-serif font-black tracking-tight mb-1">{isWin ? 'Chain Linked!' : 'Broken Chain!'}</h2>
                <p className="text-base text-neutral-600 font-bold mb-4">{isWin ? 'You found the correct path.' : 'You ran out of mistakes.'}</p>
                
                <div className="mb-5 w-full text-left bg-neutral-300 p-3 rounded-md border-2 border-neutral-300">
                  <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Today&apos;s Chain</h3>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-black">
                    <span className="bg-[#1A1A1A] text-white px-2 py-1 rounded-md border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">{puzzle.startWord}</span>
                    {puzzle.chain.map(word => (
                      <div key={word} className="flex items-center gap-1.5">
                        <span className="text-neutral-500">→</span>
                        <span className="bg-white border-2 border-[#1A1A1A] px-2 py-1 rounded-md shadow-[2px_2px_0px_#1A1A1A]">{word}</span>
                      </div>
                    ))}
                    <span className="text-neutral-500">→</span>
                    <span className="bg-[#1A1A1A] text-white px-2 py-1 rounded-md border-2 border-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A]">{puzzle.endWord}</span>
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
                  <p>Find the {puzzle.chain.length + 1}-step path from the Start word to the End word.</p>
                  <p>Each word in the chain must be strongly associated with the previous one.</p>
                  <p>Select words in the correct sequence to build your chain and submit to check.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Chain" />
    </div>
  );
}
