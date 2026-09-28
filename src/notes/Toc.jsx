import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

// Reads h2/h3 headings out of the rendered article (rehype-slug already gave
// them ids) and tracks which one is active via IntersectionObserver.
//
// Click-to-jump mirrors the pattern used in the /projects article page
// (src/hidden/projects/ProjectDetailPage2.jsx `scrollToSection`): smooth
// scrollIntoView, set the active item immediately (no waiting on the
// observer), and lock the observer for ~800ms so the scroll-spy doesn't
// flicker through intermediate headings mid-scroll.
export default function Toc({ articleRef, watch }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const isScrollingRef = useRef(false);
  const hasHandledInitialHashRef = useRef(false);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) {
      setHeadings([]);
      return undefined;
    }

    hasHandledInitialHashRef.current = false;

    // Let react-markdown finish painting before we scan the DOM.
    const raf = requestAnimationFrame(() => {
      const nodes = Array.from(el.querySelectorAll('h2, h3'));
      const next = nodes.map((n) => {
        // Headings can contain KaTeX math. textContent would mash the hidden
        // MathML copy and the visual copy together ("O(n2)O(n^2)"), so keep
        // the rendered markup instead, minus the MathML duplicate and any links.
        const clone = n.cloneNode(true);
        clone.querySelectorAll('.katex-mathml, a').forEach((x) => {
          if (x.tagName === 'A') x.replaceWith(...x.childNodes);
          else x.remove();
        });
        return {
          id: n.id,
          text: clone.textContent.trim(),
          html: clone.innerHTML, // our own rendered markdown, not user input
          level: n.tagName === 'H3' ? 3 : 2,
        };
      });
      setHeadings(next);

      // On initial load with a URL hash (e.g. shared link to a section),
      // jump to it once the note body — and therefore the heading ids —
      // actually exist in the DOM.
      if (!hasHandledInitialHashRef.current) {
        hasHandledInitialHashRef.current = true;
        const hash = window.location.hash?.slice(1);
        if (hash) {
          const target = next.find((h) => h.id === hash);
          if (target) {
            const node = document.getElementById(hash);
            if (node) {
              isScrollingRef.current = true;
              node.scrollIntoView({ behavior: 'auto', block: 'start' });
              setActiveId(hash);
              setTimeout(() => {
                isScrollingRef.current = false;
              }, 800);
            }
          }
        }
      }
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  useEffect(() => {
    if (!headings.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.1, 0.25, 0.5] }
    );

    headings.forEach((h) => {
      const node = document.getElementById(h.id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (e, id) => {
    const node = document.getElementById(id);
    if (!node) return;
    e.preventDefault();

    isScrollingRef.current = true;
    setActiveId(id);
    node.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });

    // Reflect the section in the URL without a router navigation/re-render.
    // Pass through the existing history.state (react-router's {usr,key,idx})
    // instead of null, so Back/Forward bookkeeping isn't disturbed.
    history.replaceState(history.state, '', `#${id}`);

    // Re-enable the scroll-spy after the scroll animation completes.
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  if (!headings.length) return null;

  return (
    <nav className="n-toc" aria-label="On this page">
      <div className="n-toc-title">On this page</div>
      <ul className="n-toc-list">
        {headings.map((h) => (
          <li key={h.id} className={`n-toc-item n-toc-level-${h.level}`}>
            <a
              href={`#${h.id}`}
              className={activeId === h.id ? 'n-toc-active' : ''}
              onClick={(e) => handleClick(e, h.id)}
              title={h.text}
              dangerouslySetInnerHTML={{ __html: h.html }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
