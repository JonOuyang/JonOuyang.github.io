import { parseArticleMarkdown } from "./articleParser";

let indexCache = null;

export const fetchArticleIndex = async () => {
  if (indexCache) return indexCache;

  const resp = await fetch("/articles/index.json");
  if (!resp.ok) {
    throw new Error("Failed to load article index");
  }
  const json = await resp.json();
  indexCache = json.articles || [];
  return indexCache;
};

export const loadArticleBySlug = async (slug) => {
  if (!slug) return null;
  const resp = await fetch(`/articles/${slug}.md`);
  if (!resp.ok) return null;
  const markdown = await resp.text();
  const parsed = parseArticleMarkdown(markdown);
  return {
    ...parsed.meta,
    sections: parsed.sections,
    content: parsed.content
  };
};

export const loadArticleById = async (id) => {
  const index = await fetchArticleIndex();
  const entry = index.find((item) => item.id === Number(id));
  if (!entry) return null;
  return loadArticleBySlug(entry.slug);
};
