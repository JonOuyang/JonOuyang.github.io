import { projectSlugFromTitle } from "./projectSlug";

const headingToId = (title) => projectSlugFromTitle(title || "");

export const parseArticleMarkdown = (markdown) => {
  const parsed = {
    meta: {},
    sections: [],
    content: {}
  };

  if (!markdown) return parsed;

  let body = markdown;
  const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (frontmatterMatch) {
    const raw = frontmatterMatch[1].trim();
    if (raw.startsWith("{")) {
      try {
        parsed.meta = JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to parse article frontmatter JSON", err);
      }
    }
    body = markdown.slice(frontmatterMatch[0].length);
  }

  const lines = body.split(/\r?\n/);
  let currentSection = null;
  let paragraphLines = [];

  const ensureSection = (title) => {
    if (currentSection) return;
    const fallbackTitle = title || "Overview";
    const id = headingToId(fallbackTitle) || "overview";
    currentSection = { id, title: fallbackTitle };
    parsed.sections.push(currentSection);
    parsed.content[id] = { paragraphs: [], figures: [] };
  };

  const commitParagraph = () => {
    if (!paragraphLines.length) return;
    ensureSection();
    const paragraph = paragraphLines.join(" ").trim();
    if (paragraph) {
      parsed.content[currentSection.id].paragraphs.push(paragraph);
    }
    paragraphLines = [];
  };

  const addFigure = (src, caption) => {
    ensureSection();
    const normalizedSrc = src || "";
    const extension = normalizedSrc.split("?")[0].toLowerCase();
    const isVideo = extension.endsWith(".mp4") || extension.endsWith(".webm") || extension.endsWith(".mov");
    parsed.content[currentSection.id].figures.push({
      src,
      caption,
      type: isVideo ? "video" : "image"
    });
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      commitParagraph();
      const title = trimmed.slice(3).trim();
      const id = headingToId(title) || "section";
      currentSection = { id, title };
      parsed.sections.push(currentSection);
      parsed.content[id] = { paragraphs: [], figures: [] };
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      commitParagraph();
      addFigure(imageMatch[2], imageMatch[1]);
      continue;
    }

    if (!trimmed) {
      commitParagraph();
      continue;
    }

    paragraphLines.push(trimmed);
  }

  commitParagraph();

  return parsed;
};
