import { describe, test } from 'node:test';
import assert from 'node:assert';
import { shuffleArray } from './puzzles.ts';

describe('shuffleArray', () => {
  test('should not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original, 'seed1');
    assert.deepStrictEqual(original, copy);
  });

  test('should return an array with the exact same elements', () => {
    const original = ['apple', 'banana', 'cherry', 'date'];
    const result = shuffleArray(original, 'seed2');

    assert.strictEqual(result.length, original.length);
    for (const item of original) {
      assert.ok(result.includes(item));
    }
  });

  test('should produce the same array order given the same seed', () => {
    const original = Array.from({ length: 50 }, (_, i) => i);
    const result1 = shuffleArray(original, 'deterministic-seed');
    const result2 = shuffleArray(original, 'deterministic-seed');

    assert.deepStrictEqual(result1, result2);
  });

  test('should produce different array orders given different seeds', () => {
    const original = Array.from({ length: 50 }, (_, i) => i);
    const result1 = shuffleArray(original, 'seed-A');
    const result2 = shuffleArray(original, 'seed-B');

    assert.notDeepStrictEqual(result1, result2);
  });

  test('should correctly handle an empty array', () => {
    const result = shuffleArray([], 'empty-seed');
    assert.deepStrictEqual(result, []);
  });

  test('should correctly handle an array with 1 element', () => {
    const result = shuffleArray(['only-one'], 'single-seed');
    assert.deepStrictEqual(result, ['only-one']);
  });
});
