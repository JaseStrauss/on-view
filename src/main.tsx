import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import { ThemeProvider } from '@/contexts/theme-context'
import { AppToaster } from '@/components/app-toaster'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <AppToaster />
    </ThemeProvider>
  </StrictMode>,
)
