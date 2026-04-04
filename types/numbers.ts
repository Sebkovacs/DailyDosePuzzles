import { BasePuzzle } from './puzzle';

export type NumbersVariant = 'standard' | 'exacta' | 'chain-op';

export interface NumbersContent {
  /** The number the player is trying to reach */
  targetNumber: number;
  /** The 6 starting numbers (typically 3 small, 3 big) */
  startingNumbers: number[];
  /** Used for 'chain-op' variant to enforce order (e.g., ['+', '-', '*', '/']) */
  requiredSequence?: string[];
}

export interface NumbersSolution {
  /** A verified mathematical sequence to reach the target (or closest possible) */
  optimalExpression: string;
}

export interface NumbersPuzzle extends BasePuzzle<NumbersContent, NumbersSolution> {
  gameType: 'numbers';
  variant: NumbersVariant;
}