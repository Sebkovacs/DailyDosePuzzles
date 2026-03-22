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
  const [bonusGamesPlayed, setBonusGamesPlayed] = useState(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const title = bonusGamesPlayed > 0 ? `Chain (Bonus ${bonusGamesPlayed}/4)` : `Chain ${dateString}`;

    // Create emoji representation
    const emptySquares = MAX_MISTAKES - mistakes;
    const mistakesEmojis = Array(mistakes).fill('❌').join('');
    const emptyEmojis = Array(emptySquares).fill('⬜').join('');
    const linksEmoji = '🔗'.repeat(puzzle?.chain.length || 0);

    const resultText = isWin ? 'Solved' : 'Failed';

    const text = `${title}\n${resultText}\n${linksEmoji}\n${mistakesEmojis}${emptyEmojis}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomChain();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  const handlePlayMore = () => {
    setBonusGamesPlayed(prev => prev + 1);
    const randomDaily = generateRandomChain();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true); // Treat bonus games as playtests for now so they don't overwrite daily stats unless desired.
    setIsWin(false);
    setMistakes(0);
    setSelectedChain([]);
    setWrongGuesses([]);
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
          <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">Chain</h1>
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
        <div className="text-center mb-8">
          <h2 className="text-lg font-serif font-medium text-neutral-800">Connect the words.</h2>
          <p className="text-xs text-neutral-500 mt-1">Find the {puzzle.chain.length + 1}-step path from Start to End.</p>
        </div>

        <div className="w-full bg-indigo-50 text-indigo-900 rounded-2xl py-4 text-center font-black text-lg mb-4">
          {puzzle.startWord}
        </div>

        <motion.div 
          className="grid grid-cols-4 gap-2 mb-4 flex-1 content-start"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {activeGrid.map((word) => {
            const selectedIndex = selectedChain.indexOf(word);
            const isSelected = selectedIndex !== -1;
            
            let bgClass = 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300';
            if (isSelected) {
              bgClass = 'bg-indigo-600 text-white border-indigo-600 scale-95';
            }

            return (
              <motion.button
                key={word}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWordClick(word)}
                className={`
                  aspect-square rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-200 flex flex-col items-center justify-center uppercase tracking-wider relative border
                  ${bgClass}
                `}
              >
                {word}
                {isSelected && (
                  <span className="absolute top-0.5 right-1 text-[7px] opacity-70">{selectedIndex + 1}</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <div className="w-full bg-indigo-50 text-indigo-900 rounded-2xl py-4 text-center font-black text-lg mb-4">
          {puzzle.endWord}
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 pb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Mistakes Remaining</span>
            {[...Array(MAX_MISTAKES)].map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < (MAX_MISTAKES - mistakes) ? 'bg-indigo-500 scale-100' : 'bg-neutral-200 scale-75'}`} />
            ))}
          </div>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setSelectedChain([])}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className="flex-1 py-3 rounded-full border border-neutral-200 bg-white font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-all text-sm active:scale-95"
            >
              Clear
            </button>
            <button 
              onClick={handleSubmit}
              disabled={selectedChain.length === 0 || isGameOver || isWin}
              className="flex-1 py-3 rounded-full bg-neutral-900 text-white font-bold hover:bg-black disabled:opacity-50 transition-all text-sm active:scale-95"
            >
              Submit
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isGameOver || isWin) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-100"
              >
                <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-neutral-900">{isWin ? 'Chain Linked!' : 'Broken Chain!'}</h2>
                <p className="text-sm text-neutral-500 mb-6">{isWin ? 'You found the correct path.' : 'You ran out of mistakes.'}</p>
                
                <div className="mb-6 w-full text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <h3 className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest mb-3 text-center">Today&apos;s Chain</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
                    <span className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg">{puzzle.startWord}</span>
                    {puzzle.chain.map(word => (
                      <div key={word} className="flex items-center gap-2">
                        <span className="text-neutral-300">→</span>
                        <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-neutral-800">{word}</span>
                      </div>
                    ))}
                    <span className="text-neutral-300">→</span>
                    <span className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg">{puzzle.endWord}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {isWin && bonusGamesPlayed < 4 && (
                    <button
                      onClick={handlePlayMore}
                      className="w-full py-3.5 rounded-full bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Dices className="w-4 h-4" />
                      Play 4 More ({bonusGamesPlayed}/4)
                    </button>
                  )}
                  <button 
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className="block w-full py-3.5 rounded-full bg-neutral-100 text-neutral-600 text-sm font-bold hover:bg-neutral-200 transition-colors active:scale-95">
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
                  <p>Find the {puzzle.chain.length + 1}-step path from the <span className="font-bold text-neutral-900">Start</span> word to the <span className="font-bold text-neutral-900">End</span> word.</p>
                  <p>Each word in the chain must be strongly associated with the previous one to form a common compound word or phrase.</p>
                  <p>Select words in the correct sequence to build your chain and submit to check your answer.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-colors active:scale-95">
                  Play
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
