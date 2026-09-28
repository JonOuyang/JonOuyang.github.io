import { parseFrontmatter } from './frontmatter';

// Lazy loaders: each note is its own chunk, only fetched when opened.
const loaders = import.meta.glob('./content/**/*.md', { query: '?raw', import: 'default' });

function stripPrefix(name) {
  return name.replace(/^\d+-/, '');
}

export function titleCase(slugPart) {
  return slugPart
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Parse every glob key ('./content/01-machine-learning/02-optimization/01-gradient-descent.md')
// into ordering + slug info, entirely synchronously (paths only, no file contents).
function parsePath(key) {
  const relative = key.replace(/^\.\/content\//, '').replace(/\.md$/, '');
  const parts = relative.split('/');
  const isIndex = parts[parts.length - 1] === 'index';
  const segments = isIndex ? parts.slice(0, -1) : parts;

  const orders = parts.map((p) => {
    const m = p.match(/^(\d+)-/);
    return m ? parseInt(m[1], 10) : 0;
  });

  const slugSegments = segments.map(stripPrefix);
  const slug = slugSegments.join('/');
  const title = slugSegments.length
    ? titleCase(slugSegments[slugSegments.length - 1])
    : 'Notes';

  return { key, parts, segments, isIndex, orders, slugSegments, slug, title };
}

const entries = Object.keys(loaders).map(parsePath);

// Build a nested tree: { name, path (folder slug), order, index: entry|null, children: [] }
function buildTree(entries) {
  const root = { name: '', slug: '', order: 0, index: null, children: [], isRoot: true };

  for (const entry of entries) {
    if (entry.isIndex && entry.segments.length === 0) {
      // A top-level content/index.md — treat as root index (not expected per spec, but handle gracefully).
      root.index = entry;
      continue;
    }

    let node = root;
    const segCount = entry.isIndex ? entry.segments.length : entry.segments.length - 1;

    for (let i = 0; i < segCount; i++) {
      const rawSeg = entry.parts[i];
      const slugSeg = stripPrefix(rawSeg);
      const order = entry.orders[i];
      let child = node.children.find((c) => c.name === slugSeg && !c.isFile);
      if (!child) {
        child = {
          name: slugSeg,
          slug: node.slug ? `${node.slug}/${slugSeg}` : slugSeg,
          order,
          title: titleCase(slugSeg),
          index: null,
          children: [],
          isFile: false,
        };
        node.children.push(child);
      }
      node = child;
    }

    if (entry.isIndex) {
      node.index = entry;
    } else {
      const fileRawName = entry.parts[entry.parts.length - 1];
      const fileSlugName = stripPrefix(fileRawName);
      node.children.push({
        name: fileSlugName,
        slug: entry.slug,
        order: entry.orders[entry.orders.length - 1],
        title: entry.title,
        entry,
        isFile: true,
        children: [],
      });
    }
  }

  const sortNode = (node) => {
    node.children.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  };
  sortNode(root);

  return root;
}

export const tree = buildTree(entries);

// Flat, tree-ordered list of every visible page (folder index pages + files),
// used for prev/next navigation and slug lookup.
function flatten(node, acc) {
  if (!node.isRoot) {
    if (node.isFile) {
      acc.push({ slug: node.slug, title: node.title, entry: node.entry });
    } else if (node.index) {
      acc.push({ slug: node.slug, title: node.title, entry: node.index });
    }
  }
  if (!node.isFile) {
    for (const child of node.children) flatten(child, acc);
  }
  return acc;
}

export const flat = flatten(tree, []);

export const bySlug = new Map(flat.map((item) => [item.slug, item]));

// Loads + parses a single note by slug. Returns { data, body, title, slug } or null.
export async function loadNote(slug) {
  const item = bySlug.get(slug);
  if (!item) return null;
  const raw = await loaders[item.entry.key]();
  const { data, body } = parseFrontmatter(raw);
  return {
    slug: item.slug,
    title: item.title,
    isIndex: item.entry.isIndex,
    data,
    body,
  };
}

// Finds which top-level ancestor slugs (folders) contain the given slug, for
// sidebar auto-expand. Returns an array of folder slugs, root-to-leaf.
export function ancestorSlugs(slug) {
  if (!slug) return [];
  const parts = slug.split('/');
  const result = [];
  for (let i = 1; i < parts.length; i++) {
    result.push(parts.slice(0, i).join('/'));
  }
  return result;
}
