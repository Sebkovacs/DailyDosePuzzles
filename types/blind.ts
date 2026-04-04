import { BasePuzzle } from './puzzle';

export type BlindVariant = 'standard' | 'liar' | 'minimalist';

export interface BlindQuestion {
  id: string;
  prompt: string;
  /** Used in 'liar' variant to denote the deliberately false clue */
  isLie?: boolean;
}

export interface BlindContent {
  /** The 5 fragmented logic/trivia questions acting as 'touches' */
  questions: BlindQuestion[];
}

export interface BlindSolution {
  /** The 5 correct answers to the individual questions */
  questionAnswers: Record<string, string>;
  /** The overarching entity/object uniting the 5 answers */
  metaTruth: string;
  /** Contextual explanation linking the answers to the truth */
  explanation: string;
}

export interface BlindPuzzle extends BasePuzzle<BlindContent, BlindSolution> {
  gameType: 'blind';
  variant: BlindVariant;
}