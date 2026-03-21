export interface ChainPuzzle {
  startWord: string;
  endWord: string;
  chain: string[];
}

export interface DailyChain {
  date: string;
  puzzle: ChainPuzzle;
}

export const CHAIN_PUZZLES: DailyChain[] = [
  {
    date: '2026-03-18',
    puzzle: {
      startWord: 'FIRE',
      endWord: 'LACE',
      chain: ['WOOD', 'WORK', 'HORSE', 'SHOE']
    }
  },
  {
    date: '2026-03-19',
    puzzle: {
      startWord: 'WATER',
      endWord: 'BOARD',
      chain: ['FALL', 'OUT', 'BACK', 'WATER']
    }
  },
  {
    date: '2026-03-20',
    puzzle: {
      startWord: 'SUN',
      endWord: 'KEEPER',
      chain: ['SET', 'BACK', 'TRACK', 'RECORD']
    }
  },
  {
    date: '2026-03-21',
    puzzle: {
      startWord: 'BLACK',
      endWord: 'HOLE',
      chain: ['JACK', 'POT', 'BELLY', 'BUTTON']
    }
  },
  {
    date: '2026-03-22',
    puzzle: {
      startWord: 'SAND',
      endWord: 'CATCHER',
      chain: ['PAPER', 'BAG', 'PIPE', 'DREAM']
    }
  }
];

export function getDailyChain(dateStr: string): DailyChain {
  const puzzle = CHAIN_PUZZLES.find(p => p.date === dateStr);
  return puzzle || CHAIN_PUZZLES[0];
}

export function generateRandomChain(): DailyChain {
  const randomIndex = Math.floor(Math.random() * CHAIN_PUZZLES.length);
  return CHAIN_PUZZLES[randomIndex];
}
