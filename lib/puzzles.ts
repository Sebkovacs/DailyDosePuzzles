import { COMPOUND_WORDS } from './split-words';

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

export function shuffleArray<T>(array: T[], seed: string): T[] {
  let m = array.length, t, i;
  let hash = 0;
  for (let j = 0; j < seed.length; j++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(j);
    hash |= 0;
  }
  
  const random = () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };

  const newArray = [...array];
  while (m) {
    i = Math.floor(random() * m--);
    t = newArray[m];
    newArray[m] = newArray[i];
    newArray[i] = t;
  }
  return newArray;
}
