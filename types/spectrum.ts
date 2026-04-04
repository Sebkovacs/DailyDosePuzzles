import { BasePuzzle } from './puzzle';

export type SpectrumVariant = 'standard' | 'blind' | '2d-grid';

export interface SpectrumContent {
  /** The items to be ordered */
  items: string[];
  /** Description of the dimension (hidden in 'blind' variant) */
  dimensionDescription?: string;
  /** Description for Y-axis (used only in '2d-grid' variant) */
  dimensionDescriptionY?: string;
}

export interface SpectrumSolution {
  /** Items ordered correctly along the primary dimension */
  orderedSequence: string[];
  /** Maps items to Y-axis rank (used only in '2d-grid' variant) */
  sequenceY?: Record<string, number>;
  /** Explanation for the true dimension (useful for revealing 'blind' variant answers) */
  metaExplanation?: string;
}

export interface SpectrumPuzzle extends BasePuzzle<SpectrumContent, SpectrumSolution> {
  gameType: 'spectrum';
  variant: SpectrumVariant;
}