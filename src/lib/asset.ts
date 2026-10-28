/** Resolves a public/ path against Vite's base so it works under /<repo>/ on GitHub Pages. */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
