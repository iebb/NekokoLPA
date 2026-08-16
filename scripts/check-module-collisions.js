#!/usr/bin/env node
/**
 * Fails if two importable files share a basename in the same directory.
 *
 * Metro resolves extensions in the order js, jsx, json, ts, tsx — note that
 * .json and .js both win over .ts. So a `features.json` sitting next to a
 * `features.ts` silently shadows the module: `import {x} from './features'`
 * yields the JSON, every named export is undefined, and the app dies at
 * startup with "undefined is not a function". TypeScript does not catch this,
 * because tsc resolves .ts first and therefore disagrees with the bundler.
 *
 * This has happened twice in this repo (tamagui.config.js shadowing
 * tamagui.config.ts, and shared/config/features.json shadowing features.ts),
 * so it is worth a check.
 */
const fs = require('fs');
const path = require('path');

const RESOLUTION_ORDER = ['js', 'jsx', 'json', 'ts', 'tsx'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'Pods', 'ios', 'android']);
const ROOTS = ['src'];
/** Root-level config files that are imported without an extension. */
const ROOT_BASENAMES = ['tamagui.config'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const collisions = [];

function record(key, exts) {
  if (exts.length < 2) return;
  const winner = RESOLUTION_ORDER.find(e => exts.includes(e));
  collisions.push({key, exts, winner});
}

const groups = new Map();
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const ext = path.extname(file).slice(1);
    if (!RESOLUTION_ORDER.includes(ext)) continue;
    const key = path.join(path.dirname(file), path.basename(file, path.extname(file)));
    groups.set(key, [...(groups.get(key) ?? []), ext]);
  }
}
for (const [key, exts] of groups) record(key, exts);

for (const base of ROOT_BASENAMES) {
  record(
    base,
    RESOLUTION_ORDER.filter(e => fs.existsSync(`${base}.${e}`)),
  );
}

if (collisions.length === 0) {
  console.log('No module basename collisions.');
  process.exit(0);
}

console.error('Module basename collisions found — the bundler and tsc will disagree:\n');
for (const {key, exts, winner} of collisions) {
  console.error(`  ${key}  [${exts.join(', ')}]  -> Metro resolves .${winner}`);
}
console.error('\nRename one of each pair so imports are unambiguous.');
process.exit(1);
