import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: process.env.GITHUB_PAGES
      ? "embed-files-to-png"
      : "./",
  plugins: [react()],
})
