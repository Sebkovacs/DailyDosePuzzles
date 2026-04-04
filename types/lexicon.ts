import { BasePuzzle } from './puzzle';

export type LexiconVariant = 'standard' | 'reverse' | 'alter-ego';

export interface LexiconContent {
  /** The primary word or definition being tested */
  prompt: string;
  /** The multiple choice options presented to the user */
  options: {
    id: string;
    text: string;
  }[];
}

export interface LexiconSolution {
  /** The ID of the correct option */
  correctOptionId: string;
  /** An interesting fact or etymology revealed upon completion */
  factoid?: string;
}

export interface LexiconPuzzle extends BasePuzzle<LexiconContent, LexiconSolution> {
  gameType: 'lexicon';
  variant: LexiconVariant;
}