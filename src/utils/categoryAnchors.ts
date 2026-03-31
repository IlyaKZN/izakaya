export function getCategoryAnchor(category: string) {
  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return `category-${normalized || 'section'}`
}
