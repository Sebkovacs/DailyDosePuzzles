export interface VaultPuzzle {
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
      code: '042',
      rules: [
        "682 - One digit is right and in its place",
        "614 - One digit is right but in the wrong place",
        "206 - Two digits are right, but both are in the wrong place",
        "738 - All digits are wrong",
        "780 - One digit is right but in the wrong place"
      ]
    },
    hard: {
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
    easy: {
      code: '062',
      rules: [
        "682 - One digit is right and in its place",
        "614 - One digit is right but in the wrong place",
        "206 - Two digits are right, but both are in the wrong place",
        "738 - All digits are wrong",
        "380 - One digit is right but in the wrong place"
      ]
    },
    hard: {
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
    easy: {
      code: '718',
      rules: [
        "183 - Two digits are right, but both are in the wrong place",
        "738 - Two digits are right and in their place",
        "456 - All digits are wrong",
        "817 - All three digits are right, but none are in their place"
      ]
    },
    hard: {
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
    easy: {
      code: '592',
      rules: [
        "291 - Two digits are right, but only one is in its place",
        "245 - Two digits are right, but both are in the wrong place",
        "463 - All digits are wrong",
        "572 - Two digits are right and in their place",
        "952 - All three digits are right, but two are in the wrong place"
      ]
    },
    hard: {
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
    easy: {
      code: '381',
      rules: [
        "123 - Two digits are right, but both are in the wrong place",
        "456 - All digits are wrong",
        "789 - One digit is right and in its place",
        "318 - All three digits are right, but two are in the wrong place"
      ]
    },
    hard: {
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
