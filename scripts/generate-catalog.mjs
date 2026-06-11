#!/usr/bin/env node
/**
 * Regenerate plugins/catalog.json from plugin directory names.
 * Run from repo root: node scripts/generate-catalog.mjs
 */
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginsDir = path.join(root, 'plugins');

const entries = await readdir(pluginsDir, { withFileTypes: true });
const slugs = entries
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

const catalog = { slugs };
const outPath = path.join(pluginsDir, 'catalog.json');
await writeFile(outPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Wrote ${slugs.length} slugs to ${outPath}`);
