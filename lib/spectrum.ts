export interface SpectrumItem {
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

export function generateRandomSpectrum(): DailySpectrum {
  const randomIndex = Math.floor(Math.random() * SPECTRUM_PUZZLES.length);
  return SPECTRUM_PUZZLES[randomIndex];
}
