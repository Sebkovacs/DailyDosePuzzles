import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateRandomNumbers } from './numbers.ts';

test('generateRandomNumbers constraints', async (t) => {
  await t.test('target is between 101 and 999', () => {
    for (let i = 0; i < 1000; i++) {
      const { target } = generateRandomNumbers();
      assert.ok(target >= 101 && target <= 999, `Target ${target} is out of bounds`);
      assert.strictEqual(Math.floor(target), target, `Target ${target} is not an integer`);
    }
  });

  await t.test('numbers array has exactly 6 elements', () => {
    for (let i = 0; i < 1000; i++) {
      const { numbers } = generateRandomNumbers();
      assert.strictEqual(numbers.length, 6, `Numbers array length is ${numbers.length}`);
    }
  });

  await t.test('contains exactly 1 or 2 large numbers and the rest are small', () => {
    const largeNumbersSet = new Set([25, 50, 75, 100]);
    const smallNumbersSet = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    let seenOneLarge = false;
    let seenTwoLarge = false;

    for (let i = 0; i < 1000; i++) {
      const { numbers } = generateRandomNumbers();

      let largeCount = 0;
      let smallCount = 0;

      for (const num of numbers) {
        if (largeNumbersSet.has(num)) {
          largeCount++;
        } else if (smallNumbersSet.has(num)) {
          smallCount++;
        } else {
          assert.fail(`Invalid number generated: ${num}`);
        }
      }

      assert.ok(largeCount === 1 || largeCount === 2, `Invalid large numbers count: ${largeCount}`);
      assert.strictEqual(smallCount, 6 - largeCount, `Invalid small numbers count: ${smallCount}`);

      if (largeCount === 1) seenOneLarge = true;
      if (largeCount === 2) seenTwoLarge = true;
    }

    // Verify both combinations occur
    assert.ok(seenOneLarge, 'Expected to see at least one case with 1 large number');
    assert.ok(seenTwoLarge, 'Expected to see at least one case with 2 large numbers');
  });

  await t.test('contains no duplicates', () => {
    for (let i = 0; i < 1000; i++) {
      const { numbers } = generateRandomNumbers();
      const uniqueNumbers = new Set(numbers);
      assert.strictEqual(uniqueNumbers.size, numbers.length, 'Duplicate numbers found');
    }
  });
});
