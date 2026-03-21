"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyLayers, generateRandomLayers, LayersPuzzle } from '@/lib/layers';
import { shuffleArray } from '@/lib/puzzles';
import { ChevronLeft, HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Layers() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
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
          <h1 className="text-6xl font-serif font-black tracking-tight leading-none">LAYERS</h1>
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
        {!isGroupsSolved ? (
          <>
            <div className="flex justify-center mb-2">
              <div className="bg-neutral-300 p-0.5 rounded-sm flex gap-1 border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]">
                <button 
                  onClick={() => { setIsEasyMode(true); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${isEasyMode ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
                >
                  Easy
                </button>
                <button 
                  onClick={() => { setIsEasyMode(false); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-colors ${!isEasyMode ? 'bg-white text-black border-[1.5px] border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'text-neutral-600 hover:text-[#1A1A1A] border-[1.5px] border-transparent'}`}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="text-center mb-2">
              <h2 className="text-base font-serif font-bold leading-tight">Find 4 groups of 4.</h2>
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <AnimatePresence>
                {solvedGroups.map((group) => (
                  <motion.div
                    key={group.theme}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="w-full bg-[#00FF00] border-[1.5px] border-[#1A1A1A] rounded-sm py-2 flex flex-col items-center justify-center shadow-[3px_3px_0px_#1A1A1A]"
                  >
                    <span className="font-black text-[#1A1A1A] tracking-wider uppercase text-xs">{group.theme}</span>
                    <span className="text-[10px] font-bold text-[#1A1A1A]/70 mt-0.5">{group.items.join(', ')}</span>
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
                {activeWords.map((word) => {
                  const isSelected = selectedWords.includes(word);
                  return (
                    <motion.button
                      key={word}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => handleWordClick(word)}
                      className={`
                        aspect-[4/3] rounded-sm font-black text-[10px] sm:text-xs transition-all duration-200 flex items-center justify-center uppercase tracking-tight border-[1.5px] border-[#1A1A1A]
                        ${isSelected ? 'bg-neutral-800 text-white translate-y-[1px] translate-x-[1px] shadow-[3px_3px_0px_#1A1A1A]' : 'bg-white text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:bg-neutral-300 active:translate-y-[1px] active:translate-x-[1px] active:shadow-none'}
                      `}
                    >
                      <span className="break-words px-1 text-center leading-tight">{word}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <div className="mt-auto flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mr-1">Mistakes</span>
                {[...Array(MAX_MISTAKES)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-sm transition-colors duration-300 ${i < (MAX_MISTAKES - mistakes) ? 'bg-[#FF4444]' : 'bg-neutral-300'}`} />
                ))}
              </div>
              <button 
                onClick={() => setSelectedWords([])}
                disabled={selectedWords.length === 0 || isGameOver}
                className="w-full py-1.5 rounded-sm border-[1.5px] border-[#1A1A1A] font-black text-[#1A1A1A] bg-white hover:bg-neutral-300 disabled:opacity-50 transition-all shadow-[4px_4px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#1A1A1A] text-base uppercase tracking-wider"
              >
                Deselect All
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center h-full"
          >
            <div className="text-center mb-4">
              <h2 className="text-4xl font-serif font-black text-[#1A1A1A] tracking-tight mb-1">Groups Found!</h2>
              <p className="text-[10px] font-bold text-neutral-600">Now, what connects these four groups?</p>
            </div>

            <div className="flex flex-col gap-1 w-full mb-4">
              {solvedGroups.map((group) => (
                <div key={group.theme} className="w-full bg-neutral-300 border-[1.5px] border-[#1A1A1A] rounded-sm py-2 flex flex-col items-center justify-center shadow-[3px_3px_0px_#1A1A1A]">
                  <span className="font-black text-[#1A1A1A] tracking-wider uppercase text-xs">{group.theme}</span>
                </div>
              ))}
            </div>

            <motion.div 
              className="flex gap-1 mb-4 flex-wrap justify-center"
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {/* Input slots */}
              {[...Array(puzzle.metaAnswer.length)].map((_, i) => (
                <button
                  key={`input-${i}`}
                  onClick={() => metaInput[i] && handleMetaInputClick(metaInput[i], i)}
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-sm flex items-center justify-center text-xl font-black border-[1.5px] transition-all
                    ${metaInput[i] ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[3px_3px_0px_#1A1A1A]' : 'bg-neutral-200 border-[#1A1A1A] border-dashed'}
                    ${isMetaWin ? 'bg-[#00FF00] border-[#1A1A1A] text-[#1A1A1A]' : ''}
                  `}
                >
                  {metaInput[i]?.letter || ''}
                </button>
              ))}
            </motion.div>

            <div className="flex flex-wrap justify-center gap-1">
              {/* Letter bank */}
              <AnimatePresence>
                {metaLetters.map((item, i) => (
                  <motion.button
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleMetaLetterClick(item, i)}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-white border-[1.5px] border-[#1A1A1A] rounded-sm flex items-center justify-center text-xl font-black shadow-[4px_4px_0px_#1A1A1A] hover:bg-neutral-300 hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0px_#1A1A1A] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none transition-all"
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
            >
              <div className="bg-white p-6 rounded-lg shadow-[10px_10px_0px_#1A1A1A] text-center max-w-sm w-full border-2 border-[#1A1A1A]">
                <h2 className="text-6xl font-serif font-black tracking-tight mb-1">{isMetaWin ? 'MIND BLOWN!' : 'GAME OVER!'}</h2>
                <p className="text-base font-bold text-neutral-600 mb-4">{isMetaWin ? 'You solved the meta-connection.' : 'You ran out of mistakes.'}</p>
                
                <div className="mb-5 w-full text-left bg-neutral-300 p-3 rounded-md border-2 border-neutral-300 max-h-64 overflow-y-auto">
                  <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-wider mb-2 text-center">Today&apos;s Solution</h3>
                  <div className="flex flex-col gap-1.5">
                    {puzzle.groups.map(g => (
                      <div key={g.theme} className="bg-white border-2 border-[#1A1A1A] p-2 rounded-md shadow-[3px_3px_0px_#1A1A1A]">
                        <div className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider mb-0.5">{g.theme}</div>
                        <div className="text-xs font-bold text-neutral-600">{g.items.join(', ')}</div>
                      </div>
                    ))}
                    <div className="mt-1 bg-[#00FF00] border-2 border-[#1A1A1A] p-2 rounded-md text-center shadow-[3px_3px_0px_#1A1A1A]">
                      <div className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider mb-0.5">Meta Connection</div>
                      <div className="text-sm font-black text-[#1A1A1A] tracking-widest">{puzzle.metaAnswer}</div>
                    </div>
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
                  <p>First, find 4 groups of 4 related words.</p>
                  <p>Then, use the names of those 4 groups to solve the final anagram.</p>
                  <p>Watch out for words that might belong to multiple categories!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-base font-black hover:bg-black transition-colors border-2 border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Layers" />
    </div>
  );
}
