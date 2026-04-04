import { BasePuzzle } from './puzzle';

export type RootVariant = 'standard' | 'tree' | 'obscured';

export interface RootContent {
  /** The ancient root word (e.g., Latin/Greek) */
  rootWord: string;
  /** Meaning of the root (partially redacted in 'obscured' variant) */
  meaning: string;
  /** Array of clues revealed progressively after failed attempts */
  clues: string[];
}

export interface RootSolution {
  /** The modern target word(s). 'tree' variant requires multiple words. */
  targetWords: string[];
  /** Etymological breakdown to display on success */
  etymologyExplanation: string;
}

export interface RootPuzzle extends BasePuzzle<RootContent, RootSolution> {
  gameType: 'root';
  variant: RootVariant;
}