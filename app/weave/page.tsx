"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDailyWeave, generateRandomWeave, WeavePuzzle } from '@/lib/weave';
import { HelpCircle, Share2, X, MessageSquare, Dices, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { saveGameStats } from '@/lib/firebase';
import { FeedbackModal } from '@/components/FeedbackModal';
import { GameLayout } from '@/components/GameLayout';
import styles from './Weave.module.css';

export default function Weave() {
  const [mounted, setMounted] = useState(false);
  const [dateString, setDateString] = useState('');
  const [puzzle, setPuzzle] = useState<WeavePuzzle | null>(null);
  
  const [paths, setPaths] = useState<Record<string, number[]>>({});
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [isWin, setIsWin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPlayTest, setIsPlayTest] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  
  const { user, profile } = useAuth();
  const isTester = profile?.role === 'tester' || profile?.role === 'admin';

  const handleShare = () => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    const text = `Weave - ${dateString}\n${isWin ? `Connected the board in ${time}s ⚡` : 'Failed'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomPuzzle = () => {
    setPuzzle(generateRandomWeave());
    setPaths({});
    setActiveColor(null);
    setIsWin(false);
    setIsPlayTest(true);
    setStartTime(Date.now());
  };

  useEffect(() => {
    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateString(localDate);
    setPuzzle(getDailyWeave(localDate));
    setStartTime(Date.now());
    setMounted(true);
  }, []);

  // Advanced Pointer Dragging Engine
  const getIndexFromEvent = (e: React.PointerEvent) => {
    if (!gridRef.current || !puzzle) return -1;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return -1;
    const col = Math.floor((x / rect.width) * puzzle.size);
    const row = Math.floor((y / rect.height) * puzzle.size);
    return row * puzzle.size + col;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isWin) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const index = getIndexFromEvent(e);
    if (index === -1) return;

    const node = puzzle?.nodes.find(n => n.start === index || n.end === index);
    if (node) {
      setActiveColor(node.id);
      setPaths(prev => ({ ...prev, [node.id]: [index] }));
    } else {
      // Check if grabbing an existing path by its tail
      for (const [color, path] of Object.entries(paths)) {
        const pathIdx = path.indexOf(index);
        if (pathIdx !== -1) {
          setActiveColor(color);
          setPaths(prev => ({ ...prev, [color]: path.slice(0, pathIdx + 1) }));
          break;
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeColor || isWin || !puzzle) return;
    const index = getIndexFromEvent(e);
    if (index === -1) return;

    const currentPath = paths[activeColor] || [];
    const lastIndex = currentPath[currentPath.length - 1];
    if (lastIndex === index) return;

    const size = puzzle.size;
    const isAdjacent = (
      (Math.abs(lastIndex - index) === 1 && Math.floor(lastIndex / size) === Math.floor(index / size)) ||
      Math.abs(lastIndex - index) === size
    );

    if (!isAdjacent) return;

    // If tracing back over our own path, rewind
    const existingIdx = currentPath.indexOf(index);
    if (existingIdx !== -1) {
      setPaths(prev => ({ ...prev, [activeColor]: currentPath.slice(0, existingIdx + 1) }));
      return;
    }

    // Check if we collided with another fixed node
    const isOtherNode = puzzle.nodes.some(n => n.id !== activeColor && (n.start === index || n.end === index));
    if (isOtherNode) return;

    // Cut any other color's path if we cross it
    const newPaths = { ...paths };
    for (const [color, path] of Object.entries(newPaths)) {
      if (color !== activeColor) {
        const cutIdx = path.indexOf(index);
        if (cutIdx !== -1) {
          newPaths[color] = path.slice(0, cutIdx);
        }
      }
    }

    newPaths[activeColor] = [...currentPath, index];
    setPaths(newPaths);

    // Did we reach the target node?
    const activeNode = puzzle.nodes.find(n => n.id === activeColor);
    if (activeNode && (activeNode.start === index || activeNode.end === index)) {
      setActiveColor(null);
    }
  };

  const handlePointerUp = () => {
    setActiveColor(null);
  };

  useEffect(() => {
    if (!puzzle || isWin) return;
    let allConnected = true;
    for (const node of puzzle.nodes) {
      const path = paths[node.id];
      if (!path || path.length < 2) { allConnected = false; break; }
      const first = path[0];
      const last = path[path.length - 1];
      const connects = (first === node.start && last === node.end) || (first === node.end && last === node.start);
      if (!connects) { allConnected = false; break; }
    }
    if (allConnected) {
      setIsWin(true);
      saveGameStats(user?.uid || null, { gameName: 'Weave', date: dateString, mode: 'standard', won: true, mistakes: 0, attempts: 1, timeToCompleteSeconds: Math.floor((Date.now() - startTime) / 1000), isPlayTest });
    }
  }, [paths, puzzle, isWin, dateString, isPlayTest, startTime, user]);

  const getCellCenter = (index: number, size: number) => {
    const x = index % size;
    const y = Math.floor(index / size);
    return { x: (x + 0.5) * (100 / size), y: (y + 0.5) * (100 / size) };
  };

  if (!mounted || !puzzle) return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-paper)', fontFamily: 'var(--font-official)' }}>Loading...</div>;

  const leftActions = isTester ? <button onClick={() => setShowFeedback(true)} className={styles.iconBtn} title="Give Feedback"><MessageSquare size={18} /></button> : null;
  const rightActions = (
    <>
      {isTester && <button onClick={handleRandomPuzzle} className={styles.iconBtn} title="Random Puzzle"><Dices size={18} /></button>}
      <button onClick={() => setShowHelp(true)} className={styles.iconBtn} title="Help"><HelpCircle size={18} /></button>
    </>
  );

  return (
    <GameLayout title="Weave" subtitle={isPlayTest ? 'Playtest' : dateString} leftActions={leftActions} rightActions={rightActions}>
      <div className={styles.container}>
        <div className={styles.instructions}>
          <h2 className={styles.instructionTitle}>Connect the colors.</h2>
          <p className={styles.instructionDesc}>Draw paths between matching nodes without crossing.</p>
        </div>

        <div 
          className={styles.gridWrapper} 
          ref={gridRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* SVG Overlay for drawing the thick letterpress paths */}
          <svg className={styles.svgOverlay} viewBox="0 0 100 100" preserveAspectRatio="none">
            {Object.entries(paths).map(([colorId, path]) => {
              const node = puzzle.nodes.find(n => n.id === colorId);
              if (!node || path.length < 2) return null;
              const points = path.map(idx => {
                const c = getCellCenter(idx, puzzle.size);
                return `${c.x},${c.y}`;
              }).join(' ');
              return <polyline key={colorId} points={points} stroke={node.colorVar} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            })}
          </svg>

          {/* CSS Grid for the Nodes */}
          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)` }}>
            {[...Array(puzzle.size * puzzle.size)].map((_, i) => {
              const node = puzzle.nodes.find(n => n.start === i || n.end === i);
              return (
                <div key={i} className={styles.cell}>
                  {node && <div className={`${styles.nodeDot} ${!isWin && !paths[node.id] ? styles.nodeDotPulse : ''}`} style={{ backgroundColor: node.colorVar }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.bottomArea}>
          <div className={styles.actionsRow}>
            <button onClick={() => setPaths({})} disabled={isWin || Object.keys(paths).length === 0} className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}><RotateCcw size={18} /> Clear Board</button>
          </div>
        </div>

        <AnimatePresence>
          {isWin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className={styles.modalCard}>
                <h2 className={styles.modalTitle}>Woven!</h2>
                <p className={styles.modalDesc}>You perfectly connected the board.</p>
                <div className={styles.modalActions}>
                  <button onClick={handleShare} className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}><Share2 size={18} /> {copied ? 'Copied!' : 'Share'}</button>
                  <Link href="/" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}>Back to Menu</Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} gameName="Weave" userId={user?.uid} />
    </GameLayout>
  );
}