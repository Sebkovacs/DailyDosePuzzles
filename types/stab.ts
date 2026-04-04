import { BasePuzzle } from './puzzle';

export type StabVariant = 'standard' | 'ladder' | 'anagram';

export interface StabContent {
  /** The framing start word */
  startWord: string;
  /** The framing end word */
  endWord: string;
  /** The number of allowed attempts */
  maxAttempts: number;
  /** Word length constraint */
  wordLength: number;
}

export interface StabSolution {
  /** The exact hidden middle word */
  targetWord: string;
}

export interface StabPuzzle extends BasePuzzle<StabContent, StabSolution> {
  gameType: 'stab';
  variant: StabVariant;
}