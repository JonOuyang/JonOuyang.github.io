#!/usr/bin/env node
// Verifies every note under src/notes/content/**/*.md:
//   - has frontmatter with a non-empty `title`
//   - has an `## Insights` heading
//   - has a `## Sources` heading
//   - `## Insights` comes before `## Sources`
//
// Reuses the same hand-rolled frontmatter parser the app itself uses
// (src/notes/frontmatter.js) rather than duplicating that logic.
//
// Usage: node scripts/check-notes.mjs   (or `npm run check:notes`)
// Exits 1 (after printing a table) if any file fails.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/notes/frontmatter.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(repoRoot, 'src', 'notes', 'content');

function walk(dir) {
  let out = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

// Finds a `## <heading>` line (case-insensitive), ignoring anything inside
// fenced code blocks so a stray `## Insights` example in a code sample
// doesn't false-positive.
function findHeadingIndex(body, heading) {
  const lines = body.split('\n');
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'i');
  let inFence = false;
  let offset = 0;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    } else if (!inFence && re.test(line)) {
      return offset;
    }
    offset += line.length + 1; // +1 for the '\n' stripped by split
  }
  return -1;
}

function checkFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(raw);
  const rel = path.relative(repoRoot, file);

  const hasTitle = typeof data.title === 'string' && data.title.trim().length > 0;
  const insightsIdx = findHeadingIndex(body, 'insights');
  const sourcesIdx = findHeadingIndex(body, 'sources');
  const hasInsights = insightsIdx !== -1;
  const hasSources = sourcesIdx !== -1;
  const orderOk = hasInsights && hasSources && insightsIdx < sourcesIdx;

  const pass = hasTitle && hasInsights && hasSources && orderOk;

  return {
    file: rel,
    title: hasTitle ? 'ok' : 'MISSING',
    insights: hasInsights ? 'ok' : 'MISSING',
    sources: hasSources ? 'ok' : 'MISSING',
    order: hasInsights && hasSources ? (orderOk ? 'ok' : 'WRONG ORDER') : '-',
    result: pass ? 'PASS' : 'FAIL',
    pass,
  };
}

function main() {
  const files = walk(contentDir).sort();

  if (files.length === 0) {
    console.log(`No .md files under ${path.relative(repoRoot, contentDir)} yet — nothing to check.`);
    process.exit(0);
  }

  const rows = files.map(checkFile);
  console.table(
    rows.map(({ file, title, insights, sources, order, result }) => ({
      file,
      title,
      insights,
      sources,
      order,
      result,
    }))
  );

  const failed = rows.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.error(`\n${failed.length}/${rows.length} note(s) failed the check.`);
    process.exit(1);
  }

  console.log(`\nAll ${rows.length} note(s) passed.`);
}

main();
