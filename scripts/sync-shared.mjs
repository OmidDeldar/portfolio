/**
 * Copies the two framework-free source files that both halves of the app need:
 *
 *   api/src/data/portfolio.data.ts            -> web/src/data/portfolio.data.ts
 *   api/src/modules/terminal/terminal.engine.ts -> web/src/lib/terminal.engine.ts
 *
 * The API is the single source of truth. The web copies exist so the site
 * still renders (and the terminal still works) when the API is unreachable.
 *
 * Run it after editing either file:  npm run sync
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const BANNER =
  '/* AUTO-GENERATED — do not edit.\n' +
  ' * Source of truth: %SOURCE%\n' +
  ' * Regenerate with: npm run sync\n' +
  ' */\n\n';

/** @type {{from: string, to: string, rewrite?: (s: string) => string}[]} */
const files = [
  {
    from: 'api/src/data/portfolio.data.ts',
    to: 'web/src/data/portfolio.data.ts',
  },
  {
    from: 'api/src/modules/terminal/terminal.engine.ts',
    to: 'web/src/lib/terminal.engine.ts',
    // The engine imports the data file by its path inside the API tree;
    // in the web tree that file sits at ../data/portfolio.data.
    rewrite: (source) =>
      source.replace("from '../../data/portfolio.data'", "from '../data/portfolio.data'"),
  },
];

let count = 0;
for (const file of files) {
  const from = join(root, file.from);
  const to = join(root, file.to);
  mkdirSync(dirname(to), { recursive: true });

  if (file.rewrite) {
    const source = readFileSync(from, 'utf8');
    writeFileSync(to, BANNER.replace('%SOURCE%', file.from) + file.rewrite(source), 'utf8');
  } else {
    const source = readFileSync(from, 'utf8');
    writeFileSync(to, BANNER.replace('%SOURCE%', file.from) + source, 'utf8');
  }
  count++;
  console.log(`  synced  ${file.from}  ->  ${file.to}`);
}

console.log(`\n${count} shared file(s) in sync.`);
