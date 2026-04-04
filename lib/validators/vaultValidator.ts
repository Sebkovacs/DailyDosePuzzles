import { VaultPuzzle, VaultClue } from '@/types/vault';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateVaultPuzzle(puzzle: VaultPuzzle): ValidationResult {
  const errors: string[] = [];

  // 1. Basic Schema Validation
  if (puzzle.gameType !== 'vault') errors.push('Invalid gameType: must be vault');
  if (!puzzle.content || !puzzle.solution) {
    return { isValid: false, errors: ['Missing content or solution'] };
  }

  const { clues, allowedSymbols, combinationLength } = puzzle.content;
  const { combination: targetCombination } = puzzle.solution;

  if (!allowedSymbols || allowedSymbols.length === 0) errors.push('Missing allowedSymbols');
  if (!combinationLength || combinationLength < 1) errors.push('Invalid combinationLength');
  if (targetCombination.length !== combinationLength) errors.push('Solution length does not match combinationLength');

  if (errors.length > 0) return { isValid: false, errors };

  // Helper: Calculate feedback for a guess against a target combination
  const calculateFeedback = (guess: string[], target: string[]) => {
    let correctCount = 0;
    let presentCount = 0;
    const targetFreq: Record<string, number> = {};
    const guessUnmatched: string[] = [];

    // First pass: Find exact matches (correct digit, correct place)
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === target[i]) {
        correctCount++;
      } else {
        targetFreq[target[i]] = (targetFreq[target[i]] || 0) + 1;
        guessUnmatched.push(guess[i]);
      }
    }

    // Second pass: Find present matches (correct digit, wrong place)
    for (const sym of guessUnmatched) {
      if (targetFreq[sym] > 0) {
        presentCount++;
        targetFreq[sym]--;
      }
    }

    return { correctCount, presentCount };
  };

  // Helper: Check if a given combination satisfies all clues based on the variant rules
  const isValidSolution = (combo: string[]) => {
    for (const clue of clues) {
      const feedback = calculateFeedback(clue.attempt, combo);
      const isMatch = feedback.correctCount === clue.feedback.correctCount &&
                      feedback.presentCount === clue.feedback.presentCount;

      if (puzzle.variant === 'corrupted' && clue.isCorrupted) {
        // The corrupted clue MUST be a lie, so the actual combo must NOT match its feedback
        if (isMatch) return false;
      } else {
        // Standard/Blitz variants, or non-corrupted clues MUST match
        if (!isMatch) return false;
      }
    }
    return true;
  };

  // 2. Solvability: Validate the provided solution actually satisfies the clues
  if (!isValidSolution(targetCombination)) {
    errors.push('The provided solution does not satisfy the given clues.');
  }

  // 3. Uniqueness: Brute force all possible combinations to ensure ONLY ONE solution exists
  if (combinationLength <= 5) { // Cap length to prevent CPU lockup
    let validCombinationsCount = 0;

    const generateAndTest = (currentCombo: string[]) => {
      if (validCombinationsCount > 1) return; // Short-circuit if multiple solutions found
      if (currentCombo.length === combinationLength) {
        if (isValidSolution(currentCombo)) validCombinationsCount++;
        return;
      }
      for (const sym of allowedSymbols) generateAndTest([...currentCombo, sym]);
    };

    generateAndTest([]);

    if (validCombinationsCount === 0) errors.push('Puzzle is unsolvable (0 valid combinations).');
    if (validCombinationsCount > 1) errors.push('Puzzle is not unique (multiple valid combinations require guessing).');
  }

  return { isValid: errors.length === 0, errors };
}