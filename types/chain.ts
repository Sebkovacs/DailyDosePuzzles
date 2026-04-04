import { BasePuzzle } from './puzzle';

export type ChainVariant = 'standard' | 'blind-link' | 'versus';

export interface ChainContent {
  /** The fixed starting concept */
  startWord: string;
  /** The fixed destination concept */
  endWord: string;
  /** Provided intermediate words to be ordered (empty in 'blind-link' variant) */
  jumbledIntermediates: string[];
}

export interface ChainSolution {
  /** The verified valid sequence from start to end */
  validChain: string[];
  /** 
   * Required minimum associative strength between links (for AI evaluation in blind/versus modes) 
   */
  linkStrengthThreshold?: number;
}

export interface ChainPuzzle extends BasePuzzle<ChainContent, ChainSolution> {
  gameType: 'chain';
  variant: ChainVariant;
}