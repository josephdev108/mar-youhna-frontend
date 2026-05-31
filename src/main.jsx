import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { BrandingProvider } from './BrandingContext.jsx'
import './index.css'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </BrowserRouter>
  </StrictMode>,
)
