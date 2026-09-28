import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tree, ancestorSlugs } from './contentTree';

const STORAGE_KEY = 'notes.sidebar.open';

function loadOpenSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function saveOpenSet(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // private mode / quota — sidebar just won't remember state, that's fine
  }
}

function Chevron({ open }) {
  return (
    <svg
      className={`n-chevron${open ? ' n-chevron-open' : ''}`}
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

function TreeItem({ node, depth, openSet, toggle, currentSlug, onNavigate }) {
  if (node.isFile) {
    const isActive = currentSlug === node.slug;
    return (
      <li className="n-tree-node">
        <div className="n-tree-row" style={{ '--n-depth': depth }}>
          <span className="n-tree-chevron-spacer" />
          <Link
            to={`/notes/${node.slug}`}
            className={`n-tree-label${isActive ? ' n-active' : ''}`}
            onClick={onNavigate}
          >
            {node.title}
          </Link>
        </div>
      </li>
    );
  }

  const isOpen = openSet.has(node.slug);
  const isActive = Boolean(node.index) && currentSlug === node.slug;

  return (
    <li className="n-tree-node">
      <div className="n-tree-row" style={{ '--n-depth': depth }}>
        <button
          type="button"
          className="n-tree-chevron-btn"
          onClick={() => toggle(node.slug)}
          aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
          aria-expanded={isOpen}
        >
          <Chevron open={isOpen} />
        </button>
        {node.index ? (
          <Link
            to={`/notes/${node.slug}`}
            className={`n-tree-label n-tree-folder${isActive ? ' n-active' : ''}`}
            onClick={onNavigate}
          >
            {node.title}
          </Link>
        ) : (
          <span
            className="n-tree-label n-tree-folder"
            role="button"
            tabIndex={0}
            onClick={() => toggle(node.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(node.slug);
              }
            }}
          >
            {node.title}
          </span>
        )}
      </div>
      {node.children.length > 0 && (
        // Always rendered (never unmounted) so the open/close transition can
        // actually animate: a grid row track sized 0fr<->1fr, with the real
        // content measured against `1fr` and clipped by the wrapper's
        // `overflow: hidden`. No manual height measuring, no layout jank,
        // and it nests cleanly for sub-folders.
        <div className={`n-tree-fold${isOpen ? ' n-tree-fold-open' : ''}`}>
          <div className="n-tree-fold-inner">
            <ul className="n-tree-children">
              {node.children.map((child) => (
                <TreeItem
                  key={child.slug || child.name}
                  node={child}
                  depth={depth + 1}
                  openSet={openSet}
                  toggle={toggle}
                  currentSlug={currentSlug}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

export default function Sidebar({ currentSlug, onNavigate }) {
  // Ancestors of the *initial* slug are folded into the very first state
  // (rather than added afterward in an effect) so those folders start
  // already-open on first paint instead of visibly animating open — the
  // open/close transition should only ever play for a deliberate click.
  const [openSet, setOpenSet] = useState(() => {
    const initial = loadOpenSet();
    if (currentSlug) {
      for (const slug of [...ancestorSlugs(currentSlug), currentSlug]) {
        initial.add(slug);
      }
    }
    return initial;
  });

  useEffect(() => {
    if (!currentSlug) return;
    const toOpen = [...ancestorSlugs(currentSlug), currentSlug];
    setOpenSet((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const slug of toOpen) {
        if (!next.has(slug)) {
          next.add(slug);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [currentSlug]);

  useEffect(() => {
    saveOpenSet(openSet);
  }, [openSet]);

  const toggle = useCallback((slug) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  return (
    <aside className="n-sidebar">
      <div className="n-sidebar-header">
        <span className="n-wordmark">notes</span>
        <Link to="/" className="n-home-link">&larr; home</Link>
      </div>
      <nav className="n-tree-scroll" aria-label="Notes navigation">
        <ul className="n-tree n-tree-root">
          {tree.children.map((child) => (
            <TreeItem
              key={child.slug || child.name}
              node={child}
              depth={0}
              openSet={openSet}
              toggle={toggle}
              currentSlug={currentSlug}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
