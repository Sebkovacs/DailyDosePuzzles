const fs = require('fs');
const path = require('path');

const lexiconContent = `export interface LexiconPuzzle {
  word: string;
  realDefinition: string;
  fakeDefinitions: string[];
}

export interface DailyLexicon {
  date: string;
  easy: LexiconPuzzle;
  hard: LexiconPuzzle;
}

export const LEXICON_PUZZLES: DailyLexicon[] = [
  {
    date: '2026-03-18',
    easy: {
      word: "FARRAGO",
      realDefinition: "A confused mixture.",
      fakeDefinitions: [
        "A type of aged, hard Italian cheese.",
        "A sudden, violent, and localized storm.",
        "A traditional, fast-paced Spanish dance.",
        "A state of deep, trance-like meditation.",
        "A rare species of ground-dwelling orchid."
      ]
    },
    hard: {
      word: "ULOTRICHOUS",
      realDefinition: "Having crisp, curly hair.",
      fakeDefinitions: [
        "Relating to the study of ancient, unglazed pottery.",
        "A deep, resonant sound produced by certain brass instruments.",
        "A rare, carnivorous plant found in tropical rainforests.",
        "Characterized by excessive, unwarranted complaining.",
        "A specific type of high-altitude atmospheric phenomenon."
      ]
    }
  },
  {
    date: '2026-03-19',
    easy: {
      word: "DEFENESTRATE",
      realDefinition: "To throw someone out of a window.",
      fakeDefinitions: [
        "To remove the fences from a property.",
        "To officially pardon a criminal.",
        "To aggressively defend a legal position.",
        "To remove the windows from a building.",
        "To publicly humiliate a politician."
      ]
    },
    hard: {
      word: "SNICKERSNEE",
      realDefinition: "A large knife.",
      fakeDefinitions: [
        "A suppressed, mocking laugh.",
        "A small, quick movement of the head.",
        "A type of traditional Dutch pastry.",
        "A sudden, sharp pain in the knee.",
        "A small, hidden compartment in a desk."
      ]
    }
  },
  {
    date: '2026-03-20',
    easy: {
      word: "GARGANTUAN",
      realDefinition: "Enormous.",
      fakeDefinitions: [
        "A mythical beast with three heads.",
        "A type of ancient Roman siege weapon.",
        "A loud, echoing sound.",
        "A deep gorge or ravine.",
        "A traditional French stew."
      ]
    },
    hard: {
      word: "TARADIDDLE",
      realDefinition: "A petty lie or pretentious nonsense.",
      fakeDefinitions: [
        "A small, fast-moving stream.",
        "A traditional Irish stringed instrument.",
        "A type of woven fabric used in kilts.",
        "A sudden, uncontrollable muscle spasm.",
        "A tool used for shaping leather."
      ]
    }
  },
  {
    date: '2026-03-21',
    easy: {
      word: "MELLIFLUOUS",
      realDefinition: "Sweet or musical; pleasant to hear.",
      fakeDefinitions: [
        "A sticky substance produced by certain trees.",
        "A type of soft, glowing light.",
        "A feeling of deep sadness or melancholy.",
        "A slow, meandering river.",
        "A type of highly fragrant flower."
      ]
    },
    hard: {
      word: "CALLIPYGIAN",
      realDefinition: "Having well-shaped buttocks.",
      fakeDefinitions: [
        "Relating to the study of beautiful handwriting.",
        "A type of ancient Greek architectural column.",
        "Characterized by a pale, sickly complexion.",
        "A rare, iridescent gemstone.",
        "A specific type of complex mathematical curve."
      ]
    }
  },
  {
    date: '2026-03-22',
    easy: {
      word: "CACOPHONY",
      realDefinition: "A harsh, discordant mixture of sounds.",
      fakeDefinitions: [
        "A type of large, colorful tropical bird.",
        "A sudden, violent outburst of emotion.",
        "A complex system of underground caves.",
        "A traditional, spicy Mexican dish.",
        "A state of complete and utter confusion."
      ]
    },
    hard: {
      word: "BUMF",
      realDefinition: "Useless or tedious printed material.",
      fakeDefinitions: [
        "A dull, heavy blow.",
        "A small, unkempt tuft of hair.",
        "A type of coarse, woolen fabric.",
        "A sudden, unexpected failure.",
        "A clumsy, awkward movement."
      ]
    }
  }
];

export function getDailyLexicon(dateStr: string): DailyLexicon {
  const puzzle = LEXICON_PUZZLES.find(p => p.date === dateStr);
  return puzzle || LEXICON_PUZZLES[0];
}
`;

const vaultContent = `export interface VaultPuzzle {
  code: string;
  rules: string[];
}

export interface DailyVault {
  date: string;
  easy: VaultPuzzle;
  hard: VaultPuzzle;
}

export const VAULT_PUZZLES: DailyVault[] = [
  {
    date: '2026-03-18',
    easy: {
      code: '4683',
      rules: [
        "The first digit is 4.",
        "The sum of the first two digits is 10.",
        "The third digit is twice the first.",
        "The final digit is half of the second."
      ]
    },
    hard: {
      code: '7391',
      rules: [
        "All digits are odd and unique.",
        "The sum of the first and last digit equals 8.",
        "The third digit is the square of the second.",
        "The first digit is a prime number greater than 5."
      ]
    }
  },
  {
    date: '2026-03-19',
    easy: {
      code: '1357',
      rules: [
        "All digits are odd.",
        "The digits are in strictly increasing order.",
        "The sum of the first and last digit equals the sum of the middle two.",
        "The last digit is 7.",
        "The first digit is 1."
      ]
    },
    hard: {
      code: '8246',
      rules: [
        "All digits are even and unique.",
        "The first digit is the cube of the second.",
        "The third digit is half of the first.",
        "The sum of all digits is 20."
      ]
    }
  },
  {
    date: '2026-03-20',
    easy: {
      code: '2468',
      rules: [
        "All digits are even.",
        "The digits are in strictly increasing order.",
        "The first digit is 2.",
        "The last digit is 8."
      ]
    },
    hard: {
      code: '9317',
      rules: [
        "All digits are odd and unique.",
        "The first digit is the square of the second.",
        "The third digit is the difference between the first and the last.",
        "The sum of the first and third digits is 10."
      ]
    }
  },
  {
    date: '2026-03-21',
    easy: {
      code: '5050',
      rules: [
        "The first and third digits are identical.",
        "The second and fourth digits are identical.",
        "The sum of all digits is 10.",
        "The second digit is 0."
      ]
    },
    hard: {
      code: '6183',
      rules: [
        "All digits are unique.",
        "The third digit is the sum of the first and second.",
        "The fourth digit is half of the first.",
        "The sum of all digits is 18."
      ]
    }
  },
  {
    date: '2026-03-22',
    easy: {
      code: '1122',
      rules: [
        "The first two digits are identical.",
        "The last two digits are identical.",
        "The sum of all digits is 6.",
        "The first digit is 1."
      ]
    },
    hard: {
      code: '5941',
      rules: [
        "All digits are unique.",
        "The second digit is the square of the third.",
        "The first digit is the sum of the third and fourth.",
        "The sum of all digits is 19."
      ]
    }
  }
];

export function getDailyVault(dateStr: string): DailyVault {
  const puzzle = VAULT_PUZZLES.find(p => p.date === dateStr);
  return puzzle || VAULT_PUZZLES[0];
}
`;

const shiftContent = `export interface ShiftPuzzle {
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
`;

const splitContent = `export interface SplitPuzzle {
  pairs: [string, string][];
}

export interface DailySplit {
  date: string;
  easy: SplitPuzzle;
  hard: SplitPuzzle;
}

export const PUZZLES: DailySplit[] = [
  {
    date: '2026-03-18',
    easy: {
      pairs: [
        ['SUN', 'FLOWER'], ['RAIN', 'BOW'], ['STAR', 'LIGHT'], ['MOON', 'BEAM'],
        ['SNOW', 'MAN'], ['WATER', 'FALL'], ['FIRE', 'FLY'], ['EARTH', 'QUAKE']
      ]
    },
    hard: {
      pairs: [
        ['AFTER', 'MATH'], ['BACK', 'LASH'], ['CATA', 'COMB'], ['DOWN', 'POUR'],
        ['EVER', 'GREEN'], ['FORE', 'SIGHT'], ['GRAND', 'STAND'], ['HEAD', 'QUARTERS']
      ]
    }
  },
  {
    date: '2026-03-19',
    easy: {
      pairs: [
        ['PAN', 'CAKE'], ['CUP', 'CAKE'], ['CHEESE', 'CAKE'], ['SHORT', 'CAKE'],
        ['FRUIT', 'CAKE'], ['POUND', 'CAKE'], ['SPONGE', 'CAKE'], ['HOT', 'CAKE']
      ]
    },
    hard: {
      pairs: [
        ['ARCH', 'ETYPE'], ['BENE', 'FACTOR'], ['CHRONO', 'LOGY'], ['DEMO', 'GRAPHIC'],
        ['EQUI', 'NOX'], ['FRAN', 'CHISE'], ['GEO', 'METRY'], ['HYPER', 'BOLE']
      ]
    }
  },
  {
    date: '2026-03-20',
    easy: {
      pairs: [
        ['BASE', 'BALL'], ['BASKET', 'BALL'], ['FOOT', 'BALL'], ['VOLLEY', 'BALL'],
        ['SNOW', 'BALL'], ['PAINT', 'BALL'], ['DODGE', 'BALL'], ['PIN', 'BALL']
      ]
    },
    hard: {
      pairs: [
        ['IDIO', 'SYNCRASY'], ['JUXTA', 'POSITION'], ['KLEPTO', 'MANIA'], ['LEXI', 'CON'],
        ['MEGA', 'LOMANIA'], ['NEO', 'PHYTE'], ['OMNI', 'POTENT'], ['PARA', 'DIGM']
      ]
    }
  },
  {
    date: '2026-03-21',
    easy: {
      pairs: [
        ['BED', 'ROOM'], ['BATH', 'ROOM'], ['LIVING', 'ROOM'], ['DINING', 'ROOM'],
        ['PLAY', 'ROOM'], ['SUN', 'ROOM'], ['MUD', 'ROOM'], ['GUEST', 'ROOM']
      ]
    },
    hard: {
      pairs: [
        ['QUINT', 'ESSENCE'], ['REPER', 'TOIRE'], ['SYCO', 'PHANT'], ['TAUTO', 'LOGY'],
        ['UBIQUI', 'TOUS'], ['VICARI', 'OUS'], ['WANDER', 'LUST'], ['XYLO', 'PHONE']
      ]
    }
  },
  {
    date: '2026-03-22',
    easy: {
      pairs: [
        ['AIR', 'PORT'], ['SEA', 'PORT'], ['PASS', 'PORT'], ['EX', 'PORT'],
        ['IM', 'PORT'], ['RE', 'PORT'], ['SUP', 'PORT'], ['TRANS', 'PORT']
      ]
    },
    hard: {
      pairs: [
        ['YACHT', 'SMAN'], ['ZEAL', 'OUS'], ['AERO', 'DYNAMIC'], ['BIBLIO', 'PHILE'],
        ['CACO', 'PHONY'], ['DICHOTO', 'MY'], ['EPHEM', 'ERAL'], ['FAC', 'SIMILE']
      ]
    }
  }
];

export function getDailyPuzzle(dateStr: string): DailySplit {
  const puzzle = PUZZLES.find(p => p.date === dateStr);
  return puzzle || PUZZLES[0];
}
`;

const spectrumContent = `export interface SpectrumItem {
  id: string;
  text: string;
  value: number;
}

export interface SpectrumPuzzle {
  metric: string;
  items: SpectrumItem[];
}

export interface DailySpectrum {
  date: string;
  easy: SpectrumPuzzle;
  hard: SpectrumPuzzle;
}

export const SPECTRUM_PUZZLES: DailySpectrum[] = [
  {
    date: '2026-03-18',
    easy: {
      metric: "Planets by Distance from Sun",
      items: [
        { id: '1', text: 'Mercury', value: 1 },
        { id: '2', text: 'Venus', value: 2 },
        { id: '3', text: 'Earth', value: 3 },
        { id: '4', text: 'Mars', value: 4 },
        { id: '5', text: 'Jupiter', value: 5 },
        { id: '6', text: 'Saturn', value: 6 },
        { id: '7', text: 'Uranus', value: 7 },
        { id: '8', text: 'Neptune', value: 8 }
      ]
    },
    hard: {
      metric: "Elements by Atomic Number",
      items: [
        { id: '1', text: 'Hydrogen', value: 1 },
        { id: '2', text: 'Carbon', value: 6 },
        { id: '3', text: 'Oxygen', value: 8 },
        { id: '4', text: 'Iron', value: 26 },
        { id: '5', text: 'Silver', value: 47 },
        { id: '6', text: 'Gold', value: 79 },
        { id: '7', text: 'Lead', value: 82 },
        { id: '8', text: 'Uranium', value: 92 }
      ]
    }
  },
  {
    date: '2026-03-19',
    easy: {
      metric: "US Coins by Value",
      items: [
        { id: '1', text: 'Penny', value: 1 },
        { id: '2', text: 'Nickel', value: 5 },
        { id: '3', text: 'Dime', value: 10 },
        { id: '4', text: 'Quarter', value: 25 },
        { id: '5', text: 'Half Dollar', value: 50 },
        { id: '6', text: 'Sacagawea Dollar', value: 100 },
        { id: '7', text: 'Two Dollar Bill', value: 200 },
        { id: '8', text: 'Five Dollar Bill', value: 500 }
      ]
    },
    hard: {
      metric: "Historical Events by Year",
      items: [
        { id: '1', text: 'Magna Carta', value: 1215 },
        { id: '2', text: 'Printing Press', value: 1440 },
        { id: '3', text: 'Columbus Voyage', value: 1492 },
        { id: '4', text: 'Jamestown', value: 1607 },
        { id: '5', text: 'Declaration of Independence', value: 1776 },
        { id: '6', text: 'French Revolution', value: 1789 },
        { id: '7', text: 'American Civil War', value: 1861 },
        { id: '8', text: 'Wright Brothers Flight', value: 1903 }
      ]
    }
  },
  {
    date: '2026-03-20',
    easy: {
      metric: "Animals by Average Lifespan",
      items: [
        { id: '1', text: 'House Fly', value: 28 },
        { id: '2', text: 'Mouse', value: 365 },
        { id: '3', text: 'Dog', value: 4745 },
        { id: '4', text: 'Horse', value: 10950 },
        { id: '5', text: 'Elephant', value: 25550 },
        { id: '6', text: 'Human', value: 29200 },
        { id: '7', text: 'Galapagos Tortoise', value: 36500 },
        { id: '8', text: 'Bowhead Whale', value: 73000 }
      ]
    },
    hard: {
      metric: "Countries by Population (2024)",
      items: [
        { id: '1', text: 'Iceland', value: 380000 },
        { id: '2', text: 'New Zealand', value: 5200000 },
        { id: '3', text: 'Australia', value: 26000000 },
        { id: '4', text: 'Canada', value: 39000000 },
        { id: '5', text: 'United Kingdom', value: 68000000 },
        { id: '6', text: 'Japan', value: 123000000 },
        { id: '7', text: 'United States', value: 340000000 },
        { id: '8', text: 'India', value: 1440000000 }
      ]
    }
  }
];

export function getDailySpectrum(dateStr: string): DailySpectrum {
  const puzzle = SPECTRUM_PUZZLES.find(p => p.date === dateStr);
  return puzzle || SPECTRUM_PUZZLES[0];
}
`;

const chainContent = `export interface ChainPuzzle {
  startWord: string;
  endWord: string;
  chain: string[];
}

export interface DailyChain {
  date: string;
  easy: ChainPuzzle;
  hard: ChainPuzzle;
}

export const CHAIN_PUZZLES: DailyChain[] = [
  {
    date: '2026-03-18',
    easy: {
      startWord: 'FIRE',
      endWord: 'BARRIER',
      chain: ['TRUCK', 'STOP', 'SIGN', 'LANGUAGE']
    },
    hard: {
      startWord: 'BLACK',
      endWord: 'BOARD',
      chain: ['HOLE', 'PUNCH', 'CARD', 'GAME']
    }
  },
  {
    date: '2026-03-19',
    easy: {
      startWord: 'WATER',
      endWord: 'GLASS',
      chain: ['FALL', 'OUT', 'FIT', 'EYE']
    },
    hard: {
      startWord: 'PAPER',
      endWord: 'WORK',
      chain: ['WEIGHT', 'LIFT', 'OFF', 'GROUND']
    }
  },
  {
    date: '2026-03-20',
    easy: {
      startWord: 'SUN',
      endWord: 'LIGHT',
      chain: ['FLOWER', 'POT', 'HOLE', 'PUNCH']
    },
    hard: {
      startWord: 'TIME',
      endWord: 'MACHINE',
      chain: ['ZONE', 'OUT', 'CAST', 'IRON']
    }
  }
];

export function getDailyChain(dateStr: string): DailyChain {
  const puzzle = CHAIN_PUZZLES.find(p => p.date === dateStr);
  return puzzle || CHAIN_PUZZLES[0];
}
`;

const layersContent = `export interface LayersGroup {
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
`;

fs.writeFileSync('./lib/lexicon.ts', lexiconContent);
fs.writeFileSync('./lib/vault.ts', vaultContent);
fs.writeFileSync('./lib/shift.ts', shiftContent);
fs.writeFileSync('./lib/split.ts', splitContent);
fs.writeFileSync('./lib/spectrum.ts', spectrumContent);
fs.writeFileSync('./lib/chain.ts', chainContent);
fs.writeFileSync('./lib/layers.ts', layersContent);

console.log('All lib files updated successfully.');
