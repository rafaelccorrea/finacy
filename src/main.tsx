import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ─── Aplicar tema ANTES do React montar para evitar flash ─────────────────────
// Lê o tema salvo no localStorage (Zustand persist) e aplica imediatamente
;(function () {
  try {
    const stored = localStorage.getItem('finacy-theme')
    const theme = stored ? JSON.parse(stored)?.state?.theme : null
    // Default: dark
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  } catch {
    document.documentElement.classList.add('dark')
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
