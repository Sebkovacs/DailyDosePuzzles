import { BasePuzzle } from './puzzle';

export type DilemmaVariant = 'standard' | 'tribal' | 'consequence';

export interface DilemmaOption {
  id: string;
  text: string;
  /** Hidden weights mapping this choice to philosophical/personality traits */
  traitWeights: Record<string, number>;
}

export interface DilemmaStage {
  stageId: string;
  scenario: string;
  options: DilemmaOption[];
}

export interface DilemmaContent {
  /** The overarching premise */
  premise: string;
  stages: DilemmaStage[];
}

export interface DilemmaResultProfile {
  trait: string;
  threshold: number;
  description: string;
}

export interface DilemmaSolution {
  /** Mapping of final score profiles based on cumulative trait weights */
  resultProfiles: DilemmaResultProfile[];
}

export interface DilemmaPuzzle extends BasePuzzle<DilemmaContent, DilemmaSolution> {
  gameType: 'dilemma';
  variant: DilemmaVariant;
}