export interface ShiftPuzzle {
  words: string[];
}

export interface DailyShift {
  date: string;
  easy: ShiftPuzzle;
  hard: ShiftPuzzle;
}

export const SHIFT_PUZZLES: DailyShift[] = [
  {
    date: '2026-03-18',
    easy: { words: ['APPLE', 'BERRY', 'LEMON', 'MELON', 'PEACH'] },
    hard: { words: ['CRIMSON', 'EMERALD', 'FUCHSIA', 'MAGENTA', 'SAFFRON'] }
  },
  {
    date: '2026-03-19',
    easy: { words: ['WATER', 'EARTH', 'FLAME', 'WINDS', 'STORM'] },
    hard: { words: ['TSUNAMI', 'VOLCANO', 'TORNADO', 'CYCLONE', 'MONSOON'] }
  },
  {
    date: '2026-03-20',
    easy: { words: ['CHAIR', 'TABLE', 'COUCH', 'STOOL', 'BENCH'] },
    hard: { words: ['ARMOIRE', 'CREDENZA', 'OTTOMAN', 'RECLINER', 'WARDROBE'] }
  },
  {
    date: '2026-03-21',
    easy: { words: ['PIZZA', 'PASTA', 'BREAD', 'SALAD', 'SOUP'] },
    hard: { words: ['LASAGNA', 'RAVIOLI', 'GNOCCHI', 'RISOTTO', 'POLENTA'] }
  },
  {
    date: '2026-03-22',
    easy: { words: ['GUITAR', 'PIANO', 'DRUMS', 'FLUTE', 'VIOLIN'] },
    hard: { words: ['CLARINET', 'TROMBONE', 'SAXOPHONE', 'XYLOPHONE', 'ACCORDION'] }
  }
];

export function getDailyShift(dateStr: string): DailyShift {
  const puzzle = SHIFT_PUZZLES.find(p => p.date === dateStr);
  return puzzle || SHIFT_PUZZLES[0];
}

export function generateRandomShift(): DailyShift {
  const randomIndex = Math.floor(Math.random() * SHIFT_PUZZLES.length);
  return SHIFT_PUZZLES[randomIndex];
}
