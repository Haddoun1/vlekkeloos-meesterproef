export const slugify = (value) =>
  value
    ?.toLowerCase()
    .trim()
    .replaceAll(" ", "-")
    .replaceAll("ë", "e")
    .replaceAll("é", "e");