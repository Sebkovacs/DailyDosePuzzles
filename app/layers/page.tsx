"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyLayers, generateRandomLayers, LayersPuzzle, DailyLayers } from '@/lib/layers';
import { shuffleArray } from '@/lib/puzzles';
import { ChevronLeft, HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Layers() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<DailyLayers | null>(null);
  const [puzzle, setPuzzle] = useState<LayersPuzzle | null>(null);
  
  const [isEasyMode, setIsEasyMode] = useState(true);
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<{theme: string, items: string[]}[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  // Meta puzzle state
  const [metaInput, setMetaInput] = useState<{id: string, letter: string}[]>([]);
  const [metaLetters, setMetaLetters] = useState<{id: string, letter: string}[]>([]);
  const [isMetaWin, setIsMetaWin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';
  
  const MAX_MISTAKES = 3;

  const handleShare = () => {
    const text = `Layers - ${dateString}\n${isMetaWin ? 'Meta Solved! 🌟' : 'Failed'}\nMistakes: ${mistakes}/${MAX_MISTAKES}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomLayers();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyLayers(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const puzzleForMode = isEasyMode ? dailyPuzzle.easy : dailyPuzzle.hard;
      setPuzzle(puzzleForMode);
      
      const allItems = puzzleForMode.groups.flatMap((g: { items: string[] }) => g.items);
      const seedStr = isPlayTest ? Date.now().toString() : dateString;
      setActiveWords(shuffleArray(allItems, seedStr + (isEasyMode ? 'easy' : 'hard')));
      
      // Prepare meta letters
      const letters = puzzleForMode.metaAnswer.split('').map((letter: string, i: number) => ({ id: `meta-${i}`, letter }));
      setMetaLetters(shuffleArray(letters, seedStr + (isEasyMode ? 'easy' : 'hard')));
      
      setSelectedWords([]);
      setSolvedGroups([]);
      setMetaInput([]);
      setIsMetaWin(false);
      setMistakes(0);
      setIsShaking(false);
      setStartTime(Date.now());
    }
  }, [isEasyMode, dailyPuzzle, dateString, isPlayTest]);

  const handleWordClick = (word: string) => {
    if (selectedWords.length >= 4 || isShaking || mistakes >= MAX_MISTAKES || solvedGroups.length === 4) return;

    const newSelection = selectedWords.includes(word)
      ? selectedWords.filter(w => w !== word)
      : [...selectedWords, word];

    setSelectedWords(newSelection);

    if (newSelection.length === 4) {
      checkGroup(newSelection);
    }
  };

  const checkGroup = (words: string[]) => {
    if (!puzzle) return;

    const matchedGroup = puzzle.groups.find(g => 
      words.every(w => g.items.includes(w))
    );

    if (matchedGroup) {
      setTimeout(() => {
        setSolvedGroups([...solvedGroups, matchedGroup]);
        setActiveWords(activeWords.filter(w => !words.includes(w)));
        setSelectedWords([]);
      }, 400);
    } else {
      setIsShaking(true);
      setTimeout(() => {
        const newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        if (newMistakes >= MAX_MISTAKES) {
          saveGameStats(user?.uid || null, {
            gameName: 'Layers',
            date: dateString,
            mode: isEasyMode ? 'easy' : 'hard',
            won: false,
            mistakes: newMistakes,
            attempts: newMistakes + solvedGroups.length,
            timeToComplete: Math.floor((Date.now() - startTime) / 1000),
            isPlayTest
          });
        }
        setIsShaking(false);
        setSelectedWords([]);
      }, 600);
    }
  };

  const handleMetaLetterClick = (item: {id: string, letter: string}, index: number) => {
    if (isMetaWin) return;
    
    const newLetters = [...metaLetters];
    newLetters.splice(index, 1);
    setMetaLetters(newLetters);
    
    const newInput = [...metaInput, item];
    setMetaInput(newInput);
    
    if (newInput.length === puzzle?.metaAnswer.length) {
      if (newInput.map(x => x.letter).join('') === puzzle.metaAnswer) {
        setIsMetaWin(true);
        saveGameStats(user?.uid || null, {
          gameName: 'Layers',
          date: dateString,
          mode: isEasyMode ? 'easy' : 'hard',
          won: true,
          mistakes,
          attempts: mistakes + 4 + 1, // 4 groups + 1 meta
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest
        });
      } else {
        // Wrong meta guess
        setIsShaking(true);
        setTimeout(() => {
          const letters = puzzle.metaAnswer.split('').map((letter, i) => ({ id: `meta-retry-${Date.now()}-${i}`, letter }));
          setMetaLetters(shuffleArray(letters, Date.now().toString()));
          setMetaInput([]);
          setIsShaking(false);
        }, 600);
      }
    }
  };

  const handleMetaInputClick = (item: {id: string, letter: string}, index: number) => {
    if (isMetaWin) return;
    const newInput = [...metaInput];
    newInput.splice(index, 1);
    setMetaInput(newInput);
    setMetaLetters([...metaLetters, item]);
  };

  const isGameOver = mistakes >= MAX_MISTAKES;
  const isGroupsSolved = solvedGroups.length === 4;

  useEffect(() => {
    if (isMetaWin && user && !isPlayTest) {
      updateStreak(user.uid).catch(console.error);
    }
  }, [isMetaWin, user, isPlayTest]);

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
          <h1 className="text-3xl font-serif font-bold tracking-tight text-neutral-900">Layers</h1>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            {isPlayTest ? 'Playtest' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-2 hover:bg-neutral-100 text-rose-500 rounded-full transition-colors" title="Random Puzzle">
              <Dices className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-6 flex flex-col overflow-y-auto relative">
        {!isGroupsSolved ? (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-neutral-100 p-1 rounded-full flex gap-1 border border-neutral-200">
                <button 
                  onClick={() => { setIsEasyMode(true); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isEasyMode ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
                >
                  Easy
                </button>
                <button 
                  onClick={() => { setIsEasyMode(false); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isEasyMode ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200' : 'text-neutral-500 hover:text-neutral-700 border border-transparent'}`}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-serif font-medium text-neutral-800">Find 4 groups of 4.</h2>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <AnimatePresence>
                {solvedGroups.map((group) => (
                  <motion.div
                    key={group.theme}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full bg-rose-50 border border-rose-200 rounded-xl py-3 flex flex-col items-center justify-center"
                  >
                    <span className="font-bold text-rose-800 tracking-wider uppercase text-[10px] mb-1">{group.theme}</span>
                    <span className="text-xs font-medium text-rose-600">{group.items.join(', ')}</span>
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
                {activeWords.map((word) => {
                  const isSelected = selectedWords.includes(word);

                  let bgClass = 'bg-neutral-50 text-neutral-800 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300';
                  if (isSelected) {
                    bgClass = 'bg-rose-600 text-white border-rose-600 scale-95';
                  }

                  return (
                    <motion.button
                      key={word}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordClick(word)}
                      className={`
                        aspect-[4/3] rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-200 flex items-center justify-center uppercase tracking-wider relative border
                        ${bgClass}
                      `}
                    >
                      <span className="break-words px-1 text-center leading-tight">{word}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <div className="mt-auto flex flex-col items-center gap-4 pb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mr-2">Mistakes Remaining</span>
                {[...Array(MAX_MISTAKES)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i < (MAX_MISTAKES - mistakes) ? 'bg-rose-500 scale-100' : 'bg-neutral-200 scale-75'}`} />
                ))}
              </div>
              <button 
                onClick={() => setSelectedWords([])}
                disabled={selectedWords.length === 0 || isGameOver}
                className="w-full py-3 rounded-full border border-neutral-200 bg-white font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 transition-all text-sm active:scale-95 uppercase tracking-wider"
              >
                Deselect All
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center h-full pt-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-neutral-900 tracking-tight mb-2">Groups Found!</h2>
              <p className="text-xs font-medium text-neutral-500">Now, what connects these four groups?</p>
            </div>

            <div className="flex flex-col gap-2 w-full mb-8">
              {solvedGroups.map((group) => (
                <div key={group.theme} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 flex flex-col items-center justify-center">
                  <span className="font-bold text-neutral-700 tracking-wider uppercase text-[10px]">{group.theme}</span>
                </div>
              ))}
            </div>

            <motion.div 
              className="flex gap-2 mb-8 flex-wrap justify-center"
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {/* Input slots */}
              {[...Array(puzzle.metaAnswer.length)].map((_, i) => (
                <button
                  key={`input-${i}`}
                  onClick={() => metaInput[i] && handleMetaInputClick(metaInput[i], i)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-xl font-bold border transition-all
                    ${metaInput[i] ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 border-neutral-200 border-dashed text-neutral-400'}
                    ${isMetaWin ? 'bg-rose-500 border-rose-500 text-white' : ''}
                  `}
                >
                  {metaInput[i]?.letter || ''}
                </button>
              ))}
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2">
              {/* Letter bank */}
              <AnimatePresence>
                {metaLetters.map((item, i) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMetaLetterClick(item, i)}
                    className="w-12 h-14 sm:w-14 sm:h-16 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-xl font-bold hover:bg-neutral-50 hover:border-neutral-300 transition-all text-neutral-800"
                  >
                    {item.letter}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {(isGameOver || isMetaWin) && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-neutral-100"
              >
                <h2 className="text-4xl font-serif font-bold tracking-tight mb-2 text-neutral-900">{isMetaWin ? 'Mind Blown!' : 'Game Over!'}</h2>
                <p className="text-sm text-neutral-500 mb-6">{isMetaWin ? 'You solved the meta-connection.' : 'You ran out of mistakes.'}</p>
                
                <div className="mb-6 w-full text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100 max-h-64 overflow-y-auto">
                  <h3 className="font-bold text-[10px] text-neutral-400 uppercase tracking-widest mb-3 text-center">Today&apos;s Solution</h3>
                  <div className="flex flex-col gap-2">
                    {puzzle.groups.map(g => (
                      <div key={g.theme} className="bg-white border border-neutral-200 p-3 rounded-xl">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{g.theme}</div>
                        <div className="text-xs font-medium text-neutral-700">{g.items.join(', ')}</div>
                      </div>
                    ))}
                    <div className="mt-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                      <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Meta Connection</div>
                      <div className="text-sm font-bold text-rose-900 tracking-widest">{puzzle.metaAnswer}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleShare}
                    className="w-full py-3.5 rounded-full bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
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
                  <p>First, find 4 groups of 4 related words.</p>
                  <p>Then, use the names of those 4 groups to solve the final anagram.</p>
                  <p>Watch out for words that might belong to multiple categories!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3.5 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-colors active:scale-95">
                  Play
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Layers" userId={user?.uid} />
    </div>
  );
}
