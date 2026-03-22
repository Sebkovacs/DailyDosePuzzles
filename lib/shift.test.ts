import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';
import { getDailyShift, SHIFT_PUZZLES } from './shift.ts';

describe('getDailyShift', () => {
  test('returns the correct puzzle for a valid date string', () => {
    const validDate = SHIFT_PUZZLES[1].date;
    const result = getDailyShift(validDate);
    assert.deepEqual(result, SHIFT_PUZZLES[1]);
  });

  test('returns the fallback puzzle (first puzzle) for an invalid date string', () => {
    const invalidDate = '1999-01-01';
    const result = getDailyShift(invalidDate);
    assert.deepEqual(result, SHIFT_PUZZLES[0]);
  });

  test('returns the fallback puzzle (first puzzle) for an empty date string', () => {
    const emptyDate = '';
    const result = getDailyShift(emptyDate);
    assert.deepEqual(result, SHIFT_PUZZLES[0]);
  });
});
