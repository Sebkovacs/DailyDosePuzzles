import { BasePuzzle } from './puzzle';

export type ShiftVariant = 'standard' | 'locked' | 'sync';

export interface ShiftContent {
  /** 2D array of letters representing the starting scrambled grid */
  initialGrid: string[][];
  /** Coordinates of cells that cannot be shifted (used in 'locked' variant) */
  lockedCells?: { row: number; col: number }[];
}

export interface ShiftSolution {
  /** The valid words that must be formed horizontally across the rows */
  targetWords: string[];
  /** 
   * Matrix of target grid layout to easily validate against. 
   */
  targetGrid: string[][];
}

export interface ShiftPuzzle extends BasePuzzle<ShiftContent, ShiftSolution> {
  gameType: 'shift';
  variant: ShiftVariant;
}