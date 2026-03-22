import { COMPOUND_WORDS } from './split-words';
import { shuffleArray } from './utils/shuffle';

export interface Puzzle {
  date: string;
  pairs: [string, string][];
}

export function getDailyPuzzle(dateStr: string): Puzzle {
  // Use the date string as a seed to generate a consistent puzzle for the day
  const shuffledWords = shuffleArray(COMPOUND_WORDS, dateStr);
  
  const selectedPairs: [string, string][] = [];
  const usedWords = new Set<string>();
  
  for (const pair of shuffledWords) {
    if (selectedPairs.length >= 8) break;
    
    const [first, second] = pair;
    
    // Ensure no double ups of splits (e.g., no SUN+GLASSES and SUN+SHINE)
    // Also ensure a word isn't used as both a first half and a second half (e.g., PLAY+TIME and TIME+TABLE)
    if (!usedWords.has(first) && !usedWords.has(second)) {
      selectedPairs.push(pair);
      usedWords.add(first);
      usedWords.add(second);
    }
  }
  
  // Fallback in case we somehow didn't find 8 pairs (shouldn't happen with our large list)
  if (selectedPairs.length < 8) {
    return {
      date: dateStr,
      pairs: [
        ['PINE', 'APPLE'],
        ['SUN', 'GLASSES'],
        ['WATER', 'MELON'],
        ['SNOW', 'MAN'],
        ['STAR', 'FISH'],
        ['JELLY', 'BEAN'],
        ['PAN', 'CAKE'],
        ['RAIN', 'BOW']
      ]
    };
  }

  return {
    date: dateStr,
    pairs: selectedPairs
  };
}

export function generateRandomPuzzle(): Puzzle {
  return getDailyPuzzle(Date.now().toString());
}
