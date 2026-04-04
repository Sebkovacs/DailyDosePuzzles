/**
 * Core Game Types mapped to the 12-game portfolio
 */
export type GameType =
  | 'vault'
  | 'numbers'
  | 'lexicon'
  | 'root'
  | 'chain'
  | 'stab'
  | 'layers'
  | 'spectrum'
  | 'split'
  | 'shift'
  | 'dilemma'
  | 'blind';

/**
 * Strict progression of a puzzle's lifecycle.
 * Invariant: A puzzle may only move forward through this sequence.
 */
export type PuzzleStatus =
  | 'draft'
  | 'validated'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'archived';

export type DifficultyBand = 1 | 2 | 3 | 4 | 5;

export interface BasePuzzle<TContent = unknown, TSolution = unknown> {
  id: string;
  gameType: GameType;
  variant: string;
  schemaVersion: number;
  content: TContent;
  solution: TSolution;
  difficultyBand: DifficultyBand;
  rulesetId: string;
  metadata: Record<string, unknown>;
  status: PuzzleStatus;
}
