export interface RootsPuzzle {
  targetWord: string;
  originTranslation: string;
  originLanguage: string;
  clues: string[];
}

const POOL: RootsPuzzle[] = [
  {
    targetWord: "HIPPOPOTAMUS",
    originTranslation: "River Horse",
    originLanguage: "Ancient Greek",
    clues: [
      "It is a large, mostly herbivorous mammal.",
      "It spends most of its day wallowing in water or mud.",
      "It is native to sub-Saharan Africa.",
      "It starts with the letter 'H' and has 12 letters."
    ]
  },
  {
    targetWord: "HELICOPTER",
    originTranslation: "Spiral Wing",
    originLanguage: "French / Greek",
    clues: [
      "It is a highly versatile mode of transportation.",
      "It can move vertically and hover in place.",
      "It is heavily utilized in rescue missions and news broadcasting.",
      "It starts with the letter 'H' and has 10 letters."
    ]
  },
  {
    targetWord: "DISASTER",
    originTranslation: "Bad Star",
    originLanguage: "Ancient Greek / Italian",
    clues: [
      "It denotes a sudden event causing great damage.",
      "Ancient people blamed these events on unfavorable astrological alignments.",
      "Synonyms include 'catastrophe' and 'calamity'.",
      "It starts with the letter 'D' and has 8 letters."
    ]
  },
  {
    targetWord: "SARCOPHAGUS",
    originTranslation: "Flesh Eater",
    originLanguage: "Ancient Greek",
    clues: [
      "It is an object, not a living creature.",
      "It was highly prominent in Ancient Egypt.",
      "It is a stone coffin, typically adorned with a sculpture or inscription.",
      "It starts with the letter 'S' and has 11 letters."
    ]
  }
];

export const getDailyRoots = (dateStr: string): RootsPuzzle => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
  return POOL[Math.abs(hash) % POOL.length];
};

export const generateRandomRoots = (): RootsPuzzle => {
  return POOL[Math.floor(Math.random() * POOL.length)];
};