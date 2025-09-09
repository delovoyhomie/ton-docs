#!/usr/bin/env node
/**
 * Extract letter-starting Fift keywords from src/theme/prism/prism-fift.js and render A–Z MD bullets.
 */
const fs = require('fs');
const path = require('path');

const prismPath = path.join(process.cwd(), 'src/theme/prism/prism-fift.js');
const src = fs.readFileSync(prismPath, 'utf8');

const m = src.match(/'keyword':\s*\/\\b\(\?:([\s\S]*?)\)\\b\//);
if (!m) {
  throw new Error('Could not find keyword regex in prism-fift.js');
}
const alt = m[1];
// Split on | and trim
const tokens = alt.split('|').map(s => s.trim()).filter(Boolean);

// Keep only letter-starting tokens
const letterTokens = tokens.filter(t => /^[a-zA-Z]/.test(t));

// Group by first letter uppercase
const byLetter = {};
for (const t of letterTokens) {
  const L = t[0].toUpperCase();
  if (!byLetter[L]) byLetter[L] = [];
  byLetter[L].push(t);
}
for (const L of Object.keys(byLetter)) {
  byLetter[L].sort((a,b) => a.localeCompare(b));
}

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let out = '';
for (const L of letters) {
  out += `## ${L}\n\n`;
  const list = byLetter[L] || [];
  if (list.length === 0) {
    out += '–\n\n';
    continue;
  }
  for (const t of list) {
    out += `- \`${t}\`\n`;
  }
  out += '\n';
}
process.stdout.write(out);

