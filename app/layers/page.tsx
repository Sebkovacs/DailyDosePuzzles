"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyLayers, generateRandomLayers, LayersPuzzle, DailyLayers } from '@/lib/layers';
import { shuffleArray } from '@/lib/puzzles';
import { HelpCircle, Share2, X, MessageSquare, Dices } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { updateStreak, saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Layers.module.css';

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
      const answerNoSpaces = puzzleForMode.metaAnswer.replace(/\s/g, '');
      const letters = answerNoSpaces.split('').map((letter: string, i: number) => ({ id: `meta-${i}`, letter }));
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
    
    const answerNoSpaces = puzzle?.metaAnswer.replace(/\s/g, '') || '';

    if (newInput.length === answerNoSpaces.length) {
      if (newInput.map(x => x.letter).join('') === answerNoSpaces) {
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
          const letters = answerNoSpaces.split('').map((letter: string, i: number) => ({ id: `meta-retry-${Date.now()}-${i}`, letter }));
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

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? (
    <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback" aria-label="Give Feedback">
      <MessageSquare size={18} />
    </button>
  ) : null;

  const rightActions = (
    <>
      {isTester && (
        <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle" aria-label="Random Puzzle">
          <Dices size={18} />
        </button>
      )}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help" aria-label="Help">
        <HelpCircle size={18} />
      </button>
    </>
  );

  return (
    <GameLayout
      title="Layers"
      subtitle={isPlayTest ? 'Playtest' : dateString}
      leftActions={leftActions}
      rightActions={rightActions}
    >
      <div className={styles.container}>
        {!isGroupsSolved ? (
          <>
            <div className={styles.modeToggle}>
              <button 
                onClick={() => { setIsEasyMode(true); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                className={`${styles.modeBtn} ${isEasyMode ? styles.modeBtnActive : ''}`}
              >
                Easy
              </button>
              <button 
                onClick={() => { setIsEasyMode(false); setMistakes(0); setSelectedWords([]); setSolvedGroups([]); setMetaInput([]); setIsMetaWin(false); }}
                className={`${styles.modeBtn} ${!isEasyMode ? styles.modeBtnActive : ''}`}
              >
                Hard
              </button>
            </div>

            <div className={styles.instructions}>
              <h2 className={styles.instructionTitle}>Find 4 groups of 4.</h2>
            </div>

            <div className={styles.solvedGroups}>
              <AnimatePresence>
                {solvedGroups.map((group) => (
                  <motion.div
                    key={group.theme}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={styles.solvedGroup}
                  >
                    <span className={styles.solvedGroupTheme}>{group.theme}</span>
                    <span className={styles.solvedGroupItems}>{group.items.join(', ')}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.div 
              className={styles.grid}
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordClick(word)}
                      className={`${styles.wordBtn} ${isSelected ? styles.wordBtnSelected : ''}`}
                    >
                      <span>{word}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            <div className={styles.bottomArea}>
              <div className={styles.mistakesContainer}>
                <span className={styles.mistakesLabel}>Mistakes Remaining</span>
                {[...Array(MAX_MISTAKES)].map((_, i) => (
                  <div key={i} className={`${styles.mistakeDot} ${i < (MAX_MISTAKES - mistakes) ? styles.mistakeDotActive : ''}`} />
                ))}
              </div>
              <button 
                onClick={() => setSelectedWords([])}
                disabled={selectedWords.length === 0 || isGameOver}
                className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              >
                Deselect All
              </button>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.metaArea}
          >
            <div className={styles.instructions} style={{marginBottom: '32px'}}>
              <h2 className={styles.instructionTitle}>Groups Found!</h2>
              <p className={styles.instructionDesc}>Now, what connects these four groups?</p>
            </div>

            <div className={styles.solvedGroups} style={{width: '100%', marginBottom: '32px'}}>
              {solvedGroups.map((group) => (
                <div key={group.theme} className={styles.solvedGroup}>
                  <span className={styles.solvedGroupTheme}>{group.theme}</span>
                </div>
              ))}
            </div>

            <motion.div 
              className={styles.metaInputRow}
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {(() => {
                let slotIdx = 0;
                return puzzle.metaAnswer.split('').map((char, i) => {
                  if (char === ' ') {
                    return <div key={`space-${i}`} className={styles.metaSpace} />;
                  }
                  const currentSlot = slotIdx++;
                  const item = metaInput[currentSlot];
                  return (
                    <button
                      key={`input-${currentSlot}`}
                      onClick={() => item && handleMetaInputClick(item, currentSlot)}
                      className={`${styles.metaSlot} 
                        ${item ? styles.metaSlotFilled : styles.metaSlotEmpty} 
                        ${isMetaWin ? styles.metaSlotWin : ''}
                      `}
                    >
                      {item?.letter || ''}
                    </button>
                  );
                });
              })()}
            </motion.div>

            <div className={styles.metaLetters}>
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
                    className={styles.metaLetterBtn}
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
              className={styles.modalOverlay}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                className={styles.modalCard}
              >
                <h2 className={styles.modalTitle}>{isMetaWin ? 'Mind Blown!' : 'Game Over!'}</h2>
                <p className={styles.modalDesc}>{isMetaWin ? 'You solved the meta-connection.' : 'You ran out of mistakes.'}</p>
                
                <div className={styles.solutionBox}>
                  <h3 className={styles.solutionHeader}>Today&apos;s Solution</h3>
                  <div>
                    {puzzle.groups.map(g => (
                      <div key={g.theme} className={styles.solutionGroup}>
                        <div className={styles.solutionTheme}>{g.theme}</div>
                        <div className={styles.solutionItems}>{g.items.join(', ')}</div>
                      </div>
                    ))}
                    <div className={styles.solutionMeta}>
                      <div className={styles.solutionMetaLabel}>Meta Connection</div>
                      <div className={styles.solutionMetaAnswer}>{puzzle.metaAnswer}</div>
                    </div>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button 
                    onClick={handleShare}
                    className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied to Clipboard!' : 'Share Result'}
                  </button>
                  <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>
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
              className={styles.modalOverlay}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className={styles.modalCard}
              >
                <button onClick={() => setShowHelp(false)} className={styles.closeBtn} aria-label="Close">
                  <X size={20} />
                </button>
                <h2 className={styles.modalTitle}>How to Play</h2>
                <div className={styles.modalDesc} style={{textAlign: 'left', marginBottom: '32px'}}>
                  <p style={{marginBottom: '12px'}}>First, find 4 groups of 4 related words.</p>
                  <p style={{marginBottom: '12px'}}>Then, use the names of those 4 groups to solve the final anagram.</p>
                  <p>Watch out for words that might belong to multiple categories!</p>
                </div>
                <button onClick={() => setShowHelp(false)} className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
                  Play
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Layers" userId={user?.uid} />
    </GameLayout>
  );
}
