export interface WeaveNode {
  id: string;
  colorVar: string;
  start: number;
  end: number;
}

export interface WeavePuzzle {
  size: number;
  nodes: WeaveNode[];
}

const POOL: WeavePuzzle[] = [
  {
    size: 5,
    nodes: [
      { id: 'A', colorVar: 'var(--accent-sanguine)', start: 0, end: 14 },
      { id: 'B', colorVar: 'var(--accent-indigo)', start: 1, end: 23 },
      { id: 'C', colorVar: 'var(--accent-viridian)', start: 5, end: 19 },
      { id: 'D', colorVar: 'var(--accent-ochre)', start: 10, end: 22 },
      { id: 'E', colorVar: 'var(--accent-teal)', start: 20, end: 24 }
    ]
  },
  {
    size: 5,
    nodes: [
      { id: 'A', colorVar: 'var(--accent-sanguine)', start: 0, end: 24 },
      { id: 'B', colorVar: 'var(--accent-indigo)', start: 2, end: 22 },
      { id: 'C', colorVar: 'var(--accent-viridian)', start: 4, end: 16 },
      { id: 'D', colorVar: 'var(--accent-ochre)', start: 6, end: 18 },
      { id: 'E', colorVar: 'var(--accent-teal)', start: 8, end: 12 }
    ]
  },
  {
    size: 5,
    nodes: [
      { id: 'A', colorVar: 'var(--accent-sanguine)', start: 0, end: 4 },
      { id: 'B', colorVar: 'var(--accent-indigo)', start: 20, end: 24 },
      { id: 'C', colorVar: 'var(--accent-viridian)', start: 1, end: 21 },
      { id: 'D', colorVar: 'var(--accent-ochre)', start: 2, end: 22 },
      { id: 'E', colorVar: 'var(--accent-teal)', start: 3, end: 23 }
    ]
  }
];

export const getDailyWeave = (dateStr: string): WeavePuzzle => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
  return POOL[Math.abs(hash) % POOL.length];
};

export const generateRandomWeave = (): WeavePuzzle => {
  return POOL[Math.floor(Math.random() * POOL.length)];
};