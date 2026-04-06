import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('app/api/arena/generate/route.ts Security Assertions', () => {
  const content = readFileSync(join(process.cwd(), 'app/api/arena/generate/route.ts'), 'utf-8');

  assert.ok(!content.includes('NEXT_PUBLIC_GEMINI_API_KEY'), 'NEXT_PUBLIC prefix must not be used for API keys');
  assert.ok(content.includes('Number.isInteger(count)'), 'Strict integer validation must be used for AI prompt inputs');
});