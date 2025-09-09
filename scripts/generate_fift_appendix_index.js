#!/usr/bin/env node
/**
 * Generate an A–Z list of Fift words (name + stack effect) from fiftbase.txt Appendix A.
 * - Extract bullet lines that start with "• ".
 * - Keep only the first line of each bullet (to avoid multi-line descriptions).
 * - Filter to names that start with an ASCII letter A–Z (case-insensitive),
 *   so they fit into A–Z sections. Symbol-prefixed words (like ", #, $, etc.) are skipped.
 * - Group by first letter (uppercase) and output Markdown bullets.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const srcPath = path.join(repoRoot, 'fiftbase.txt');

function parseBullets(text) {
  const lines = text.split(/\r?\n/);
  const bullets = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*•\s+/.test(line)) {
      // capture the first line only for this bullet
      const first = line.replace(/^\s*•\s+/, '').trim();
      bullets.push(first);
    }
  }
  return bullets;
}

function extractNameAndSig(bullet) {
  // bullet like: 'abort"…" ( – ) , description...'
  // Take everything up to the first closing parenthesis to keep signature
  const idx = bullet.indexOf(')');
  let head = bullet;
  if (idx !== -1) {
    head = bullet.slice(0, idx + 1);
  }
  // Now separate name and signature
  const paren = head.indexOf('(');
  let name = head.trim();
  let sig = '';
  if (paren !== -1) {
    name = head.slice(0, paren).trim();
    sig = head.slice(paren).trim();
  }
  return { name, sig };
}

function isLetterWord(name) {
  // Accept words that start with ASCII letter after trimming quotes/spaces
  const m = name.match(/[A-Za-z]/);
  if (!m) return false;
  // Ensure the first non-space character is a letter
  const first = name.trim()[0];
  return /[A-Za-z]/.test(first);
}

function generateAZSection(entriesByLetter) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const out = [];
  for (const L of letters) {
    out.push(`## ${L}`);
    const items = entriesByLetter[L] || [];
    if (items.length === 0) {
      out.push('\n–\n');
      continue;
    }
    for (const { name, sig } of items) {
      // Escape backticks within name/sig if any
      const safeName = name.replace(/`/g, '\\`');
      const safeSig = sig.replace(/`/g, '\\`');
      out.push(`\n- \`${safeName}\` ${safeSig}`);
    }
    out.push('');
  }
  return out.join('\n');
}

function main() {
  const text = fs.readFileSync(srcPath, 'utf8');
  // Narrow to Appendix A by finding the first "Appendix A. List of Fift words" occurrence
  const startIdx = text.indexOf('Appendix A. List of Fift words');
  const appendix = startIdx !== -1 ? text.slice(startIdx) : text;
  const bullets = parseBullets(appendix);
  const entries = bullets.map(extractNameAndSig)
    .filter(({ name }) => isLetterWord(name));

  // Group by first letter (uppercase)
  const byLetter = {};
  for (const e of entries) {
    const L = e.name.trim()[0].toUpperCase();
    if (!byLetter[L]) byLetter[L] = [];
    byLetter[L].push(e);
  }
  // Sort entries inside each letter by name
  for (const L of Object.keys(byLetter)) {
    byLetter[L].sort((a, b) => a.name.localeCompare(b.name));
  }

  const md = generateAZSection(byLetter);
  process.stdout.write(md);
}

main();

