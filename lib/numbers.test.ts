import * as assert from 'node:assert';
import { test } from 'node:test';
import { getDailyNumbers, NUMBERS_PUZZLES } from './numbers.ts';

test('getDailyNumbers - existing date', () => {
  const result = getDailyNumbers('2026-03-21');
  assert.deepStrictEqual(result, NUMBERS_PUZZLES['2026-03-21']);
});

test('getDailyNumbers - fallback (missing date)', () => {
  const result = getDailyNumbers('2000-01-01');
  assert.deepStrictEqual(result, {
    target: 123,
    numbers: [100, 25, 10, 5, 2, 1]
  });
});

test('getDailyNumbers - fallback (empty string)', () => {
  const result = getDailyNumbers('');
  assert.deepStrictEqual(result, {
    target: 123,
    numbers: [100, 25, 10, 5, 2, 1]
  });
});
