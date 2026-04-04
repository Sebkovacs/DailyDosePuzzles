import { BasePuzzle } from './puzzle';

/**
 * Vault game variants based on the 12-game catalog specifications.
 */
export type VaultVariant = 'standard' | 'corrupted' | 'blitz';

export interface VaultClue {
  /** The guessed sequence (e.g., ["4", "1", "9"]) */
  attempt: string[];
  feedback: {
    /** Number of digits that are correct AND in the correct position */
    correctCount: number;
    /** Number of digits that are correct BUT in the wrong position */
    presentCount: number;
  };
  /** 
   * Used ONLY in the 'corrupted' variant to flag if this specific clue is the lie. 
   * This field must be stripped out before the puzzle is sent to the client.
   */
  isCorrupted?: boolean;
  /** Optional text flavor for UI display, e.g., "One number is correct and well placed" */
  textOverride?: string;
}

export interface VaultContent {
  /** The list of previous attempts and feedback given to the user */
  clues: VaultClue[];
  /** Allowable symbols/digits (e.g., ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) */
  allowedSymbols: string[];
  /** The length of the combination (e.g., 3 for a 3-digit lock) */
  combinationLength: number;
}

export interface VaultSolution {
  /** The final exact combination that opens the vault */
  combination: string[];
}

/**
 * The strict, immutable Puzzle schema tailored for the Vault game.
 */
export interface VaultPuzzle extends BasePuzzle<VaultContent, VaultSolution> {
  gameType: 'vault';
  variant: VaultVariant;
}