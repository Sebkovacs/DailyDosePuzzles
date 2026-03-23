export interface VaultPuzzle {
  code: string;
  rules: string[];
}

export interface DailyVault {
  date: string;
  puzzle: VaultPuzzle;
}

export const VAULT_PUZZLES: DailyVault[] = [
  {
    date: '2026-03-18',
    puzzle: {
      code: '3841',
      rules: [
        "1856 - One digit is right and in its place",
        "3418 - Three digits are right, but only one is in its place",
        "7241 - Two digits are right and in their place",
        "8301 - Two digits are right, but both are in the wrong place",
        "3814 - All four digits are right, but two are in the wrong place"
      ]
    }
  },
  {
    date: '2026-03-19',
    puzzle: {
      code: '5294',
      rules: [
        "1234 - Two digits are right and in their place",
        "5678 - One digit is right and in its place",
        "9012 - Two digits are right, but both are in the wrong place",
        "4592 - All four digits are right, but none are in their place",
        "5249 - All four digits are right, but two are in the wrong place"
      ]
    }
  },
  {
    date: '2026-03-20',
    puzzle: {
      code: '6035',
      rules: [
        "1234 - One digit is right and in its place",
        "5678 - Two digits are right, but both are in the wrong place",
        "9012 - One digit is right and in its place",
        "3560 - All four digits are right, but none are in their place",
        "6053 - All four digits are right, but two are in the wrong place"
      ]
    }
  },
  {
    date: '2026-03-21',
    puzzle: {
      code: '8147',
      rules: [
        "1234 - Two digits are right, but both are in the wrong place",
        "5678 - Two digits are right, but both are in the wrong place",
        "9012 - One digit is right and in its place",
        "4781 - All four digits are right, but none are in their place",
        "8174 - All four digits are right, but two are in the wrong place"
      ]
    }
  },
  {
    date: '2026-03-22',
    puzzle: {
      code: '2759',
      rules: [
        "1234 - One digit is right, but in the wrong place",
        "5678 - Two digits are right, but both are in the wrong place",
        "9012 - Two digits are right, but both are in the wrong place",
        "2795 - All four digits are right, but two are in the wrong place",
        "7259 - All four digits are right, but two are in the wrong place"
      ]
    }
  }
];

export function getDailyVault(dateStr: string): DailyVault {
  const puzzle = VAULT_PUZZLES.find(p => p.date === dateStr);
  return puzzle || VAULT_PUZZLES[0];
}

export function generateRandomVault(): DailyVault {
  const randomIndex = Math.floor(Math.random() * VAULT_PUZZLES.length);
  return VAULT_PUZZLES[randomIndex];
}
