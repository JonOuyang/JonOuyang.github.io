export const parseBoldSegments = (text) => {
  if (!text) return [];
  const segments = [];
  let cursor = 0;

  while (cursor < text.length) {
    const start = text.indexOf("**", cursor);
    if (start === -1) {
      segments.push({ text: text.slice(cursor), bold: false });
      break;
    }

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), bold: false });
    }

    const end = text.indexOf("**", start + 2);
    if (end === -1) {
      segments.push({ text: text.slice(start), bold: false });
      break;
    }

    segments.push({ text: text.slice(start + 2, end), bold: true });
    cursor = end + 2;
  }

  return segments;
};

export const renderInlineMarkdown = (text, renderBold) => {
  const segments = parseBoldSegments(text);
  if (!segments.length) return text;
  return segments.map((segment, index) =>
    segment.bold ? renderBold(segment.text, index) : segment.text
  );
};
