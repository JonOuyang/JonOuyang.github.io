import { useState } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotePage from './NotePage';
import { flat } from './contentTree';
import './notes.css';

function useCurrentSlug() {
  const location = useLocation();
  return location.pathname.replace(/^\/notes\/?/, '').replace(/\/+$/, '');
}

function Landing() {
  return (
    <div className="n-article-col">
      <article className="n-article">
        <h1 className="n-title">Notes</h1>
        <p className="n-description">
          A running set of personal learning notes — math, ML, algorithms, and
          whatever else I&rsquo;m working through. Pick a page from the sidebar,
          or jump in below.
        </p>
        {flat.length === 0 ? (
          <p className="n-text-muted">No notes yet — check back soon.</p>
        ) : (
          <ul className="n-landing-list">
            {flat.map((item) => (
              <li key={item.slug}>
                <Link to={`/notes/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="3" y1="5.5" x2="17" y2="5.5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="14.5" x2="17" y2="14.5" />
    </svg>
  );
}

export default function NotesApp() {
  const slug = useCurrentSlug();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="notes-root">
      <button
        type="button"
        className="n-drawer-toggle"
        onClick={() => setDrawerOpen((v) => !v)}
        aria-label="Toggle notes navigation"
        aria-expanded={drawerOpen}
      >
        <HamburgerIcon />
      </button>
      {/* Always rendered (never unmounted) so the scrim can fade in/out
          instead of popping; visibility + interactivity are toggled via
          the modifier class in CSS. */}
      <div
        className={`n-drawer-scrim${drawerOpen ? ' n-drawer-scrim-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className={`n-layout${drawerOpen ? ' n-drawer-open' : ''}`}>
        <Sidebar currentSlug={slug} onNavigate={() => setDrawerOpen(false)} />
        <Routes>
          <Route index element={<Landing />} />
          <Route path="*" element={<NotePage />} />
        </Routes>
      </div>
    </div>
  );
}
