import { BasePuzzle } from './puzzle';

export type LayersVariant = 'standard' | 'stacked' | 'sequence';

export interface LayersContent {
  /** A scrambled array of words (16 for 'standard', 25 for 'stacked') */
  gridWords: string[];
}

export interface LayerGroup {
  theme: string;
  words: string[];
}

export interface LayersSolution {
  /** The correct categorization of words into groups */
  groups: LayerGroup[];
  /** The overarching meta-theme connecting the groups */
  metaTheme: string;
}

export interface LayersPuzzle extends BasePuzzle<LayersContent, LayersSolution> {
  gameType: 'layers';
  variant: LayersVariant;
}