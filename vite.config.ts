import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  define: {
    __APP_BRAND__: JSON.stringify(process.env.APP_BRAND || 'The Key Financial'),
    __PRIMARY_COLOR__: JSON.stringify(process.env.PRIMARY_COLOR || '#043d44'),
    __ACCENT_COLOR__: JSON.stringify(process.env.ACCENT_COLOR || '#f3b600')
  }
})
