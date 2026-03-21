export interface LayersGroup {
  id: string;
  theme: string;
  items: string[];
}

export interface LayersPuzzle {
  groups: LayersGroup[];
  metaPrompt: string;
  metaAnswer: string;
}

export interface DailyLayers {
  date: string;
  easy: LayersPuzzle;
  hard: LayersPuzzle;
}

export const LAYERS_PUZZLES: DailyLayers[] = [
  {
    date: '2026-03-18',
    easy: {
      groups: [
        { id: '1', theme: 'Colors', items: ['RED', 'BLUE', 'GREEN', 'YELLOW'] },
        { id: '2', theme: 'Shapes', items: ['CIRCLE', 'SQUARE', 'TRIANGLE', 'OVAL'] },
        { id: '3', theme: 'Animals', items: ['DOG', 'CAT', 'BIRD', 'FISH'] },
        { id: '4', theme: 'Fruits', items: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE'] }
      ],
      metaPrompt: 'What do all these themes have in common?',
      metaAnswer: 'BASIC CONCEPTS'
    },
    hard: {
      groups: [
        { id: '1', theme: 'Words ending in "ough"', items: ['THOUGH', 'THROUGH', 'ROUGH', 'COUGH'] },
        { id: '2', theme: 'Types of knots', items: ['BOWLINE', 'HITCH', 'BEND', 'SLIP'] },
        { id: '3', theme: 'Musical terms', items: ['TEMPO', 'PITCH', 'CHORD', 'SCALE'] },
        { id: '4', theme: 'Synonyms for "fast"', items: ['QUICK', 'RAPID', 'SWIFT', 'FLEET'] }
      ],
      metaPrompt: 'What links the four themes?',
      metaAnswer: 'THEY ALL HAVE FOUR ITEMS'
    }
  },
  {
    date: '2026-03-19',
    easy: {
      groups: [
        { id: '1', theme: 'Planets', items: ['MARS', 'VENUS', 'JUPITER', 'SATURN'] },
        { id: '2', theme: 'Metals', items: ['GOLD', 'SILVER', 'COPPER', 'IRON'] },
        { id: '3', theme: 'Oceans', items: ['ATLANTIC', 'PACIFIC', 'INDIAN', 'ARCTIC'] },
        { id: '4', theme: 'Continents', items: ['AFRICA', 'ASIA', 'EUROPE', 'ANTARCTICA'] }
      ],
      metaPrompt: 'What do these groups represent?',
      metaAnswer: 'EARTH AND SPACE'
    },
    hard: {
      groups: [
        { id: '1', theme: 'Palindromes', items: ['RADAR', 'LEVEL', 'ROTOR', 'CIVIC'] },
        { id: '2', theme: 'Anagrams of "STOP"', items: ['POST', 'POTS', 'SPOT', 'TOPS'] },
        { id: '3', theme: 'Words with double letters', items: ['BOOK', 'TREE', 'DOOR', 'ROOM'] },
        { id: '4', theme: 'Words starting with "Q"', items: ['QUEEN', 'QUICK', 'QUIET', 'QUILT'] }
      ],
      metaPrompt: 'What is the meta connection?',
      metaAnswer: 'WORDPLAY'
    }
  }
];

export function getDailyLayers(dateStr: string): DailyLayers {
  const puzzle = LAYERS_PUZZLES.find(p => p.date === dateStr);
  return puzzle || LAYERS_PUZZLES[0];
}

export function generateRandomLayers(): DailyLayers {
  const randomIndex = Math.floor(Math.random() * LAYERS_PUZZLES.length);
  return LAYERS_PUZZLES[randomIndex];
}
