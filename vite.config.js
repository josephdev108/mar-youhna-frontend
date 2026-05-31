import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// marjohn.stmaryabram.com document root is already public_html/marjohn — use base /
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
})
