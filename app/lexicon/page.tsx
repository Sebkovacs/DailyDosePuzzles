"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyLexicon, generateRandomLexicon, LexiconPuzzle } from '@/lib/lexicon';
import { shuffleArray } from '@/lib/utils/shuffle';
import { ChevronLeft, HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Lexicon() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [mode, setMode] = useState<'easy' | 'hard'>('easy');
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [puzzle, setPuzzle] = useState<LexiconPuzzle | null>(null);
  
  const [options, setOptions] = useState<string[]>([]);
  const [guessedOptions, setGuessedOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const MAX_GUESSES = 3;

  const handleShare = () => {
    const text = `Lexicon (${mode}) - ${dateString}\n${isWin ? `Score: ${score}/3 🎭` : 'Failed 🎭'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    const randomDaily = generateRandomLexicon();
    setDailyPuzzle(randomDaily);
    setIsPlayTest(true);
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    
    const daily = getDailyLexicon(localDate);
    setDailyPuzzle(daily);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dailyPuzzle) {
      const currentPuzzle = dailyPuzzle[mode];
      setPuzzle(currentPuzzle);
      const allOptions = [currentPuzzle.realDefinition, ...currentPuzzle.fakeDefinitions];
      const seedStr = isPlayTest ? Date.now().toString() : dateString + mode;
      setOptions(shuffleArray(allOptions, seedStr));
      setGuessedOptions([]);
      setScore(0);
      setIsGameOver(false);
      setIsWin(false);
      setStartTime(Date.now());
    }
  }, [mode, dailyPuzzle, dateString, isPlayTest]);

  const handleOptionClick = (option: string) => {
    if (isGameOver || !puzzle || guessedOptions.includes(option)) return;
    
    const newGuessedOptions = [...guessedOptions, option];
    setGuessedOptions(newGuessedOptions);
    
    const isCorrect = option === puzzle.realDefinition;
    
    if (isCorrect) {
      const points = MAX_GUESSES - guessedOptions.length + 1;
      setScore(points);
      setIsWin(true);
      saveGameStats(user?.uid || null, {
        gameName: 'Lexicon',
        date: dateString,
        mode,
        won: true,
        mistakes: newGuessedOptions.length - 1,
        attempts: newGuessedOptions.length,
        timeToComplete: Math.floor((Date.now() - startTime) / 1000),
        isPlayTest
      });
      setTimeout(() => setIsGameOver(true), 1500);
    } else {
      if (newGuessedOptions.length >= MAX_GUESSES) {
        saveGameStats(user?.uid || null, {
          gameName: 'Lexicon',
          date: dateString,
          mode,
          won: false,
          mistakes: newGuessedOptions.length,
          attempts: newGuessedOptions.length,
          timeToComplete: Math.floor((Date.now() - startTime) / 1000),
          isPlayTest
        });
        setTimeout(() => setIsGameOver(true), 1500);
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
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b-[3px] border-[#1A1A1A] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 hover:bg-[#F5F2ED] rounded-none border-2 border-transparent hover:border-[#1A1A1A] transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          {isTester && (
            <button onClick={() => setShowFeedback(true)} className="p-2 hover:bg-[#F5F2ED] rounded-none border-2 border-transparent hover:border-[#1A1A1A] transition-colors text-blue-600" title="Give Feedback">
              <MessageSquare className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight uppercase">LEXICON</h1>
          <p className="text-xs font-bold text-[#1A1A1A]/60 uppercase tracking-widest mt-0.5">
            {isPlayTest ? 'PLAYTEST MODE' : dateString}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTester && (
            <button onClick={handleRandomPuzzle} className="p-2 hover:bg-[#F5F2ED] rounded-none border-2 border-transparent hover:border-[#1A1A1A] transition-colors text-emerald-600" title="Random Puzzle">
              <Dices className="w-6 h-6" />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="p-2 hover:bg-[#F5F2ED] rounded-none border-2 border-transparent hover:border-[#1A1A1A] transition-colors">
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 w-full max-w-md px-4 py-4 flex flex-col overflow-y-auto">
        {/* Mode Toggle */}
        <div className="flex w-full mb-6 border-[3px] border-[#1A1A1A] rounded-none overflow-hidden bg-white shadow-[4px_4px_0px_#1A1A1A]">
          <button
            onClick={() => setMode('easy')}
            className={`flex-1 py-2 text-sm font-black uppercase tracking-wider transition-colors ${
              mode === 'easy' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F5F2ED] text-[#1A1A1A]'
            }`}
          >
            Easy
          </button>
          <div className="w-[3px] bg-[#1A1A1A]" />
          <button
            onClick={() => setMode('hard')}
            className={`flex-1 py-2 text-sm font-black uppercase tracking-wider transition-colors ${
              mode === 'hard' ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F5F2ED] text-[#1A1A1A]'
            }`}
          >
            Hard
          </button>
        </div>

        {!isGameOver ? (
          <>
            <div className="text-center mb-6 bg-white border-[3px] border-[#1A1A1A] p-6 shadow-[6px_6px_0px_#1A1A1A]">
              <h2 className="text-4xl font-black tracking-tight uppercase mb-2">{puzzle.word}</h2>
              <p className="text-sm font-bold text-[#1A1A1A]/70 uppercase tracking-widest">Find the real definition.</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <AnimatePresence mode="wait">
                {options.map((option, i) => {
                  const isGuessed = guessedOptions.includes(option);
                  const isCorrect = option === puzzle.realDefinition;
                  
                  let buttonClass = "bg-white border-[#1A1A1A] text-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A]";
                  
                  if (isGuessed) {
                    if (isCorrect) {
                      buttonClass = "bg-[#00FF00] border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-y-[2px] translate-x-[2px]";
                    } else {
                      buttonClass = "bg-[#FF4444] border-[#1A1A1A] text-white opacity-80 shadow-none translate-y-[4px] translate-x-[4px]";
                    }
                  } else if (isWin && isCorrect) {
                     buttonClass = "bg-[#00FF00] border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0px_#1A1A1A] translate-y-[2px] translate-x-[2px]";
                  }

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleOptionClick(option)}
                      disabled={isGuessed || isWin || guessedOptions.length >= MAX_GUESSES}
                      className={`w-full p-4 border-[3px] text-left font-bold text-lg transition-all duration-300 ${buttonClass}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="mt-auto w-full flex justify-between items-center bg-white border-[3px] border-[#1A1A1A] p-3 shadow-[4px_4px_0px_#1A1A1A]">
              <span className="font-black uppercase tracking-wider text-sm">Chances</span>
              <div className="flex gap-1">
                {[...Array(MAX_GUESSES)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full border-2 border-[#1A1A1A] ${
                      i < guessedOptions.length ? 'bg-[#FF4444]' : 'bg-[#00FF00]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <div className="bg-white p-6 shadow-[8px_8px_0px_#F27D26] text-center max-w-sm w-full border-[4px] border-[#1A1A1A]">
              <h2 className="text-4xl font-black tracking-tight uppercase mb-2">{isWin ? 'WELL DONE!' : 'GAME OVER!'}</h2>
              <p className="text-lg font-bold text-[#1A1A1A]/70 mb-6">{isWin ? `You scored ${score} points.` : 'You ran out of guesses.'}</p>
              
              <div className="mb-6 w-full text-left bg-[#F5F2ED] p-4 border-[3px] border-[#1A1A1A]">
                <h3 className="font-black text-sm text-[#1A1A1A] uppercase tracking-wider mb-3 text-center">Today&apos;s Word</h3>
                <div className="bg-white border-[3px] border-[#1A1A1A] p-4 shadow-[4px_4px_0px_#1A1A1A]">
                  <div className="text-xl font-black text-[#1A1A1A] mb-2 uppercase tracking-widest">{puzzle.word}</div>
                  <div className="text-lg font-bold text-[#1A1A1A]/80">{puzzle.realDefinition}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleShare}
                  className="w-full py-3 bg-[#F27D26] text-[#1A1A1A] text-lg font-black uppercase tracking-widest border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  {copied ? 'Copied!' : 'Share'}
                </button>
                <Link href="/" className="block w-full py-3 bg-white text-[#1A1A1A] text-lg font-black uppercase tracking-widest border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#1A1A1A] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#1A1A1A] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all">
                  Menu
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 shadow-[8px_8px_0px_#00FF00] max-w-sm w-full relative border-[4px] border-[#1A1A1A]"
              >
                <button onClick={() => setShowHelp(false)} className="absolute top-3 right-3 p-2 text-[#1A1A1A] hover:bg-[#F5F2ED] border-2 border-transparent hover:border-[#1A1A1A] transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-black uppercase mb-4">How to Play</h2>
                <div className="space-y-4 text-lg font-bold text-[#1A1A1A]/80">
                  <p>You will be presented with an obscure word and six possible definitions.</p>
                  <p>Only <strong>one</strong> definition is real. The others are bluffs.</p>
                  <p>You have 3 guesses. Guess correctly on the first try for 3 points, second try for 2 points, and third try for 1 point.</p>
                </div>
                <button onClick={() => setShowHelp(false)} className="mt-8 w-full py-3 bg-[#1A1A1A] text-white text-lg font-black uppercase tracking-widest border-[3px] border-[#1A1A1A] shadow-[4px_4px_0px_#00FF00] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#00FF00] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all">
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Lexicon" />
    </div>
  );
}
