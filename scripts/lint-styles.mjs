#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['app', 'components'];
const EXTENSIONS = new Set(['.tsx', '.ts', '.css']);

const INLINE_STYLE_RE = /style\s*=\s*\{\{/g;
const LEGACY_TOKEN_RE = /var\(--(?:ink-|bg-|accent-(?!primary|secondary|tertiary)|wash-|shadow-ink|border-ink\))/g;

const findings = [];

function walk(dir) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return;

  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name === '.next' || entry.name === 'node_modules') continue;

    const relPath = path.join(dir, entry.name);
    const absPath = path.join(ROOT, relPath);

    if (entry.isDirectory()) {
      walk(relPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (!EXTENSIONS.has(ext)) continue;

    const text = fs.readFileSync(absPath, 'utf8');
    const lines = text.split(/\r?\n/);

    if (ext === '.tsx' || ext === '.ts') {
      lines.forEach((line, idx) => {
        if (INLINE_STYLE_RE.test(line) && !line.includes('${')) {
          findings.push({
            type: 'inline-style',
            file: relPath,
            line: idx + 1,
            message: 'Inline style object found. Move static styles to CSS Modules.',
          });
        }
        INLINE_STYLE_RE.lastIndex = 0;
      });
    }

    if (ext === '.tsx' || ext === '.ts' || ext === '.css') {
      lines.forEach((line, idx) => {
        if (LEGACY_TOKEN_RE.test(line)) {
          findings.push({
            type: 'legacy-token',
            file: relPath,
            line: idx + 1,
            message: 'Legacy token name detected. Migrate to semantic token families.',
          });
        }
        LEGACY_TOKEN_RE.lastIndex = 0;
      });
    }
  }
}

for (const dir of TARGET_DIRS) {
  walk(dir);
}

if (findings.length === 0) {
  console.log('Style audit passed. No inline styles or legacy tokens found in app/components.');
  process.exit(0);
}

console.error(`Style audit failed with ${findings.length} issue(s):`);
for (const finding of findings) {
  console.error(`- [${finding.type}] ${finding.file}:${finding.line} - ${finding.message}`);
}
process.exit(1);
