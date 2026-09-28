import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import Manim from './Manim';
import 'katex/dist/katex.min.css';

function resolveHref(href, slug, isIndex) {
  if (!href) return { type: 'plain', href };
  if (/^https?:\/\//i.test(href)) return { type: 'external', href };
  if (/^(mailto:|tel:|#)/i.test(href)) return { type: 'plain', href };
  if (href.startsWith('/assets/')) return { type: 'plain', href };
  if (href.startsWith('/notes/')) return { type: 'internal', href: href.replace(/\.md(#|$)/, '$1') };
  if (href.startsWith('/')) return { type: 'plain', href };

  const baseDir = isIndex ? slug : slug.split('/').slice(0, -1).join('/');
  const basePath = '/notes/' + (baseDir ? baseDir + '/' : '');
  try {
    const url = new URL(href, 'http://notes-local' + basePath);
    const resolved = url.pathname.replace(/\.md$/, '') + url.search + url.hash;
    return { type: 'internal', href: resolved };
  } catch {
    return { type: 'plain', href };
  }
}

function getCodeText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getCodeText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return getCodeText(children.props.children);
  }
  return '';
}

// Plain-text content of a hast node (headings etc. are made of text/element
// children, e.g. `**Insights**` produces an h2 > strong > text tree).
function hastText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) return node.children.map(hastText).join('');
  return '';
}

// Every note ends with `## Insights` then `## Sources` (see
// src/notes/README.md). This groups each of those h2 headings together
// with the block-level siblings that follow it — up to the next h1/h2 — into
// a `<section data-note-section="insights|sources">`, so Markdown.jsx can
// give the two sections distinct restrained styling. Small hand-rolled hast
// transform (no unist-util-visit et al.) to avoid adding a dependency; runs
// as a rehype plugin, after rehype-slug so heading ids already exist, and
// moves nodes rather than recreating them so those ids (and the TOC, which
// just queries the rendered DOM) are unaffected.
function rehypeNoteSections() {
  return (tree) => {
    const children = tree.children || [];
    const next = [];
    let i = 0;
    while (i < children.length) {
      const node = children[i];
      if (node.type === 'element' && node.tagName === 'h2') {
        const text = hastText(node).trim().toLowerCase();
        const kind = text === 'insights' ? 'insights' : text === 'sources' ? 'sources' : null;
        if (kind) {
          const group = [node];
          let j = i + 1;
          while (j < children.length) {
            const sibling = children[j];
            if (sibling.type === 'element' && /^h[12]$/.test(sibling.tagName)) break;
            group.push(sibling);
            j++;
          }
          next.push({
            type: 'element',
            tagName: 'section',
            // hast keeps `data-*` attribute names literal (not camelCased) —
            // this is what react-markdown then passes straight through as a
            // `data-note-section` prop / DOM attribute.
            properties: { 'data-note-section': kind },
            children: group,
          });
          i = j;
          continue;
        }
      }
      next.push(node);
      i++;
    }
    tree.children = next;
  };
}

export default function Markdown({ body, slug, isIndex }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeSlug, rehypeKatex, rehypeHighlight, rehypeNoteSections]}
      components={{
        section({ node, children, ...props }) {
          const kind = node?.properties?.['data-note-section'];
          if (kind === 'insights' || kind === 'sources') {
            return (
              <section className={`n-callout n-callout-${kind}`} {...props}>
                {children}
              </section>
            );
          }
          return <section {...props}>{children}</section>;
        },
        pre({ children }) {
          const codeEl = Array.isArray(children) ? children[0] : children;
          const className = codeEl?.props?.className || '';
          if (className.includes('language-manim')) {
            const raw = getCodeText(codeEl.props.children);
            return <Manim raw={raw} />;
          }
          return <pre>{children}</pre>;
        },
        a({ href, children }) {
          const resolved = resolveHref(href, slug, isIndex);
          if (resolved.type === 'external') {
            return (
              <a href={resolved.href} target="_blank" rel="noreferrer noopener">
                {children}
              </a>
            );
          }
          if (resolved.type === 'internal') {
            return <Link to={resolved.href}>{children}</Link>;
          }
          return <a href={resolved.href}>{children}</a>;
        },
        img({ src, alt }) {
          return (
            <figure className="n-figure">
              <img src={src} alt={alt || ''} loading="lazy" />
              {alt ? <figcaption>{alt}</figcaption> : null}
            </figure>
          );
        },
        p({ node, children }) {
          const onlyChild = node?.children?.length === 1 ? node.children[0] : null;
          if (onlyChild && onlyChild.tagName === 'img') {
            return <>{children}</>;
          }
          return <p>{children}</p>;
        },
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
