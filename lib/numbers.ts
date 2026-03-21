export interface NumbersPuzzle {
  target: number;
  numbers: number[];
}

export const NUMBERS_PUZZLES: Record<string, NumbersPuzzle> = {
  '2026-03-21': {
    target: 453,
    numbers: [75, 25, 6, 3, 8, 2]
  },
  '2026-03-22': {
    target: 813,
    numbers: [100, 50, 8, 4, 3, 1]
  },
  '2026-03-23': {
    target: 327,
    numbers: [50, 25, 10, 7, 4, 2]
  },
  '2026-03-24': {
    target: 684,
    numbers: [100, 75, 50, 9, 6, 2]
  },
  '2026-03-25': {
    target: 512,
    numbers: [25, 10, 8, 5, 4, 2]
  },
};

export function getDailyNumbers(dateStr: string): NumbersPuzzle {
  return NUMBERS_PUZZLES[dateStr] || {
    target: 123,
    numbers: [100, 25, 10, 5, 2, 1]
  };
}

export function generateRandomNumbers(): NumbersPuzzle {
  const target = Math.floor(Math.random() * 899) + 101; // 101 to 999
  const largeNumbers = [25, 50, 75, 100];
  const smallNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  
  // Pick 2 large and 4 small, or 1 large and 5 small (randomly)
  const numLarge = Math.random() > 0.5 ? 2 : 1;
  const numSmall = 6 - numLarge;
  
  const selectedLarge = [...largeNumbers].sort(() => 0.5 - Math.random()).slice(0, numLarge);
  const selectedSmall = [...smallNumbers].sort(() => 0.5 - Math.random()).slice(0, numSmall);
  
  return {
    target,
    numbers: [...selectedLarge, ...selectedSmall].sort(() => 0.5 - Math.random())
  };
}
