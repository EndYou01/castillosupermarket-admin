import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


const API_TARGET = 'https://castillosupermarket-backend.vercel.app'

// Proxy de desarrollo: el navegador llama rutas relativas (mismo origen, sin CORS)
// y Vite las reenvía al backend server-to-server (sin header Origin, que el backend permite).
const proxy = Object.fromEntries(
  ['/ventas', '/capital', '/patrimonio', '/productos'].map((p) => [
    p,
    { target: API_TARGET, changeOrigin: true, secure: true },
  ])
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
})
