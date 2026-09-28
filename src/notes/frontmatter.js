// Minimal hand-rolled frontmatter parser. No gray-matter.
// Expects simple `key: value` lines between `---` fences at the top of the file.
//
//   ---
//   title: Gradient Descent
//   description: one-line summary
//   updated: 2026-09-26
//   tags: optimization, ml
//   ---
//   body...
//
// Returns { data, body }. `data.tags`, when present, is an array of trimmed strings.
export function parseFrontmatter(raw) {
  if (typeof raw !== 'string') return { data: {}, body: '' };

  const text = raw.replace(/\r\n/g, '\n');

  if (!text.startsWith('---')) {
    return { data: {}, body: text };
  }

  const lines = text.split('\n');
  // lines[0] is the opening '---'
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }

  if (end === -1) {
    // No closing fence found; treat whole thing as body.
    return { data: {}, body: text };
  }

  const data = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (!key) continue;

    if (key === 'tags') {
      data.tags = value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      data[key] = value;
    }
  }

  const body = lines.slice(end + 1).join('\n').replace(/^\n+/, '');
  return { data, body };
}
