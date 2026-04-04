import { BasePuzzle } from './puzzle';

export type SplitVariant = 'standard' | 'triplets' | 'chain-split';

export interface SplitContent {
  /** Scrambled halves (or thirds) of elements. Typically 36 elements for a 6x6 grid. */
  fragments: string[];
  /** Specifies how many fragments make a whole (2 for standard pairs, 3 for triplets) */
  fragmentsPerGroup: number;
}

export interface SplitSolution {
  /** 
   * Array of valid grouped combinations.
   * E.g., for pairs: [["hot", "dog"], ["race", "car"]]
   * E.g., for triplets: [["air", "plane", "ticket"], ...]
   */
  validGroups: string[][];
  /** Defines sequential unlocking dependencies for 'chain-split' */
  unlockSequence?: Record<string, string[]>;
}

export interface SplitPuzzle extends BasePuzzle<SplitContent, SplitSolution> {
  gameType: 'split';
  variant: SplitVariant;
}