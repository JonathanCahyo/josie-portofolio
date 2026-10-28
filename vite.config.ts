import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * GitHub Pages serves the site from https://<user>.github.io/<repo>/,
 * so production assets must be prefixed with the repo name.
 * Change REPO_NAME if the repository is named differently.
 */
const REPO_NAME = 'josie-portofolio'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? `/${REPO_NAME}/` : '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // The 3D scene is lazy-loaded, so three.js lands in its own async chunk.
    chunkSizeWarningLimit: 1200,
  },
}))
