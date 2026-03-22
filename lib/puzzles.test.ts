import test from 'node:test';
import assert from 'node:assert/strict';
import { getDailyPuzzle, generateRandomPuzzle, shuffleArray } from './puzzles.ts';

test('shuffleArray', async (t) => {
  await t.test('is deterministic with the same seed', () => {
    const array = [1, 2, 3, 4, 5];
    const seed = 'test-seed';
    const shuffled1 = shuffleArray(array, seed);
    const shuffled2 = shuffleArray(array, seed);

    assert.deepEqual(shuffled1, shuffled2);
  });

  await t.test('produces different results with different seeds', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled1 = shuffleArray(array, 'seed-1');
    const shuffled2 = shuffleArray(array, 'seed-2');

    assert.notDeepEqual(shuffled1, shuffled2);
  });

  await t.test('contains all original elements', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array, 'test-seed');

    assert.equal(shuffled.length, array.length);
    for (const item of array) {
      assert.ok(shuffled.includes(item));
    }
  });
});

test('getDailyPuzzle', async (t) => {
  await t.test('returns deterministic 8 pairs for a given date', () => {
    const dateStr = '2023-10-25';
    const puzzle1 = getDailyPuzzle(dateStr);
    const puzzle2 = getDailyPuzzle(dateStr);

    assert.equal(puzzle1.date, dateStr);
    assert.equal(puzzle1.pairs.length, 8);
    assert.deepEqual(puzzle1, puzzle2);
  });

  await t.test('returns different pairs for different dates', () => {
    const puzzle1 = getDailyPuzzle('2023-10-25');
    const puzzle2 = getDailyPuzzle('2023-10-26');

    assert.notDeepEqual(puzzle1.pairs, puzzle2.pairs);
  });

  await t.test('does not reuse words in first or second halves', () => {
    const puzzle = getDailyPuzzle('2023-10-27');
    const usedWords = new Set<string>();

    for (const [first, second] of puzzle.pairs) {
      assert.ok(!usedWords.has(first), `Word ${first} was reused`);
      assert.ok(!usedWords.has(second), `Word ${second} was reused`);
      usedWords.add(first);
      usedWords.add(second);
    }
  });
});

test('generateRandomPuzzle', async (t) => {
  await t.test('returns 8 pairs and a valid date string', () => {
    const puzzle = generateRandomPuzzle();
    assert.ok(puzzle.date.length > 0);
    assert.equal(puzzle.pairs.length, 8);
  });
});
