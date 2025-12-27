export const projectSlugFromTitle = (title) => {
  if (!title) return "";
  const baseTitle = title.split(":")[0].trim();

  return baseTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
