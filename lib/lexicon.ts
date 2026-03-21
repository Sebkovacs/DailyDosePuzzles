export interface LexiconPuzzle {
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

export function generateRandomLexicon(): DailyLexicon {
  const randomIndex = Math.floor(Math.random() * LEXICON_PUZZLES.length);
  return LEXICON_PUZZLES[randomIndex];
}
