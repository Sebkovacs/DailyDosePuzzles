export interface StabPuzzle {
  startWord: string;
  targetWord: string;
  endWord: string;
}

const POOL: StabPuzzle[] = [
  { startWord: "COLD", targetWord: "PLAY", endWord: "TIME" },
  { startWord: "SAND", targetWord: "BANK", endWord: "NOTE" },
  { startWord: "FIRE", targetWord: "WOOD", endWord: "WORK" },
  { startWord: "SNOW", targetWord: "BALL", endWord: "PARK" },
  { startWord: "WATER", targetWord: "FALL", endWord: "OUT" }
];

export const getDailyStab = (dateStr: string): StabPuzzle => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
  }
  return POOL[Math.abs(hash) % POOL.length];
};

export const generateRandomStab = (): StabPuzzle => {
  return POOL[Math.floor(Math.random() * POOL.length)];
};