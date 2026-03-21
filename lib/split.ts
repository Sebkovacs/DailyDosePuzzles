export interface SplitPuzzle {
  pairs: [string, string][];
}

export interface DailySplit {
  date: string;
  puzzle: SplitPuzzle;
}

export const PUZZLES: DailySplit[] = [
  {
    date: '2026-03-18',
    puzzle: {
      pairs: [
        ['AFTER', 'MATH'], ['BACK', 'LASH'], ['CATA', 'COMB'], ['DOWN', 'POUR'],
        ['EVER', 'GREEN'], ['FORE', 'SIGHT'], ['GRAND', 'STAND'], ['HEAD', 'QUARTERS'],
        ['OUT', 'BREAK'], ['OVER', 'CAST'], ['UNDER', 'TAKER'], ['UP', 'RISING'],
        ['WITH', 'DRAW'], ['CROSS', 'BOW'], ['SAFE', 'GUARD'], ['WHIRL', 'WIND']
      ]
    }
  },
  {
    date: '2026-03-19',
    puzzle: {
      pairs: [
        ['ARCH', 'ETYPE'], ['BENE', 'FACTOR'], ['CHRONO', 'LOGY'], ['DEMO', 'GRAPHIC'],
        ['EQUI', 'NOX'], ['FRAN', 'CHISE'], ['GEO', 'METRY'], ['HYPER', 'BOLE'],
        ['KLEPTO', 'MANIA'], ['MEGA', 'LOMANIA'], ['NEO', 'PHYTE'], ['OMNI', 'POTENT'],
        ['POLY', 'MATH'], ['PSEUDO', 'NYM'], ['RETRO', 'SPECT'], ['TELE', 'PATHY']
      ]
    }
  },
  {
    date: '2026-03-20',
    puzzle: {
      pairs: [
        ['IDIO', 'SYNCRASY'], ['JUXTA', 'POSITION'], ['LEXI', 'CON'], ['PARA', 'DIGM'],
        ['QUINT', 'ESSENCE'], ['REPER', 'TOIRE'], ['SYCO', 'PHANT'], ['TAUTO', 'LOGY'],
        ['UBIQUI', 'TOUS'], ['VICARI', 'OUS'], ['WANDER', 'LUST'], ['XYLO', 'PHONE'],
        ['ANACH', 'RONISM'], ['BELL', 'IGERENT'], ['CACO', 'PHONY'], ['DIAPH', 'ANOUS']
      ]
    }
  },
  {
    date: '2026-03-21',
    puzzle: {
      pairs: [
        ['YACHT', 'SMAN'], ['ZEAL', 'OUS'], ['AERO', 'DYNAMIC'], ['BIBLIO', 'PHILE'],
        ['DICHOTO', 'MY'], ['EPHEM', 'ERAL'], ['FAC', 'SIMILE'], ['GERON', 'TOLOGY'],
        ['HELI', 'COPTER'], ['ICONO', 'CLAST'], ['JURIS', 'DICTION'], ['KALEIDO', 'SCOPE'],
        ['LABYR', 'INTH'], ['MACRO', 'COSM'], ['NARC', 'ISSISM'], ['OBFUS', 'CATE']
      ]
    }
  },
  {
    date: '2026-03-22',
    puzzle: {
      pairs: [
        ['PANE', 'GYRIC'], ['QUAR', 'ANTINE'], ['RECAL', 'CITRANT'], ['SACRO', 'SANCT'],
        ['TACI', 'TURN'], ['ULTI', 'MATUM'], ['VACIL', 'LATE'], ['XENO', 'PHOBIA'],
        ['YIELD', 'ING'], ['ZOO', 'LOGY'], ['ABER', 'RATION'], ['BOULE', 'VARD'],
        ['CAMOU', 'FLAGE'], ['DEBIL', 'ITATE'], ['ECLEC', 'TIC'], ['FASTI', 'DIOUS']
      ]
    }
  }
];

export function getDailyPuzzle(dateStr: string): DailySplit {
  const puzzle = PUZZLES.find(p => p.date === dateStr);
  return puzzle || PUZZLES[0];
}

export function generateRandomSplit(): DailySplit {
  const randomIndex = Math.floor(Math.random() * PUZZLES.length);
  return PUZZLES[randomIndex];
}

export function shuffleArray<T>(array: T[], seed: string): T[] {
  let currentIndex = array.length, temporaryValue, randomIndex;
  let seedNum = seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

  const random = () => {
    const x = Math.sin(seedNum++) * 10000;
    return x - Math.floor(x);
  };

  const newArray = [...array];
  while (0 !== currentIndex) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = newArray[currentIndex];
    newArray[currentIndex] = newArray[randomIndex];
    newArray[randomIndex] = temporaryValue;
  }
  return newArray;
}
