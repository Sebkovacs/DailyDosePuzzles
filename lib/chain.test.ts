import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { getDailyChain, CHAIN_PUZZLES } from './chain.ts';

describe('getDailyChain', () => {
  test('returns the correct puzzle for a valid date', () => {
    // '2026-03-19' is the second puzzle in the array
    const date = '2026-03-19';
    const result = getDailyChain(date);

    assert.deepStrictEqual(result, CHAIN_PUZZLES[1]);
    assert.strictEqual(result.date, date);
  });

  test('returns the first puzzle as a fallback for an invalid date', () => {
    const invalidDate = '1999-01-01';
    const result = getDailyChain(invalidDate);

    assert.deepStrictEqual(result, CHAIN_PUZZLES[0]);
  });

  test('returns the first puzzle as a fallback for an empty date string', () => {
    const result = getDailyChain('');

    assert.deepStrictEqual(result, CHAIN_PUZZLES[0]);
  });
});
