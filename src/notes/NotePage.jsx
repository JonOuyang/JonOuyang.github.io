import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadNote, flat, ancestorSlugs, titleCase } from './contentTree';
import Markdown from './Markdown';
import Toc from './Toc';

function Breadcrumb({ slug }) {
  const ancestors = ancestorSlugs(slug);
  if (!ancestors.length) return null;
  return (
    <div className="n-breadcrumb">
      {ancestors.map((a, i) => (
        <span key={a}>
          {i > 0 ? <span className="n-breadcrumb-sep">/</span> : null}
          <span className="n-breadcrumb-part">{titleCase(a.split('/').pop())}</span>
        </span>
      ))}
    </div>
  );
}

export default function NotePage() {
  const params = useParams();
  const slug = (params['*'] || '').replace(/\/+$/, '');
  const [state, setState] = useState({ status: 'loading', note: null });
  const articleRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', note: null });
    loadNote(slug).then((note) => {
      if (cancelled) return;
      setState(note ? { status: 'ready', note } : { status: 'not-found', note: null });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    // Skip the reset when the URL already carries a hash (deep link to a
    // section, or a same-note TOC jump) — Toc.jsx owns scrolling in that
    // case, and it needs to run after the note body renders.
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (state.status === 'loading') {
    return (
      <div className="n-article-col">
        <div className="n-article n-article-loading">Loading…</div>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="n-article-col">
        <div className="n-article">
          <div className="n-not-found">
            <h1>Not found</h1>
            <p>
              There&rsquo;s no note at <code>/notes/{slug}</code>.
            </p>
            <Link to="/notes">&larr; Back to notes</Link>
          </div>
        </div>
      </div>
    );
  }

  const { note } = state;
  const title = note.data.title || note.title;
  const idx = flat.findIndex((item) => item.slug === note.slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="n-article-col">
      <article className="n-article n-article-enter" ref={articleRef} key={note.slug}>
        <Breadcrumb slug={note.slug} />
        <h1 className="n-title">{title}</h1>
        {note.data.description ? (
          <p className="n-description">{note.data.description}</p>
        ) : null}
        {note.data.updated ? (
          <div className="n-updated">Updated {note.data.updated}</div>
        ) : null}
        <div className="n-body">
          <Markdown body={note.body} slug={note.slug} isIndex={note.isIndex} />
        </div>

        {(prev || next) && (
          <nav className="n-prevnext" aria-label="Prev / next note">
            {prev ? (
              <Link to={`/notes/${prev.slug}`} className="n-prevnext-card n-prevnext-prev">
                <span className="n-prevnext-label">&larr; Previous</span>
                <span className="n-prevnext-title">{prev.title}</span>
              </Link>
            ) : (
              <span className="n-prevnext-card n-prevnext-empty" />
            )}
            {next ? (
              <Link to={`/notes/${next.slug}`} className="n-prevnext-card n-prevnext-next">
                <span className="n-prevnext-label">Next &rarr;</span>
                <span className="n-prevnext-title">{next.title}</span>
              </Link>
            ) : (
              <span className="n-prevnext-card n-prevnext-empty" />
            )}
          </nav>
        )}
      </article>
      <Toc articleRef={articleRef} watch={note.slug + note.body.length} />
    </div>
  );
}
