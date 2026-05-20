import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from './api'

const DEFAULTS = {
  app_name: 'اجتماع ماريوحنا',
  app_subtitle: 'للخريجين',
  logo_url: null,
  color_primary: '#8b0000',
  color_primary_dark: '#6b0000',
  color_primary_darker: '#3d0000',
  color_accent: '#c5a059',
  color_accent_light: '#f5ecd4',
}

const BrandingContext = createContext({
  branding: DEFAULTS,
  loading: true,
  refreshBranding: async () => {},
  applyBranding: () => {},
})

export function applyBrandingToDocument(b) {
  const root = document.documentElement
  root.style.setProperty('--brand-primary', b.color_primary)
  root.style.setProperty('--brand-primary-dark', b.color_primary_dark)
  root.style.setProperty('--brand-primary-darker', b.color_primary_darker)
  root.style.setProperty('--brand-accent', b.color_accent)
  root.style.setProperty('--brand-accent-light', b.color_accent_light)
  document.title = b.app_subtitle
    ? `${b.app_name} — ${b.app_subtitle}`
    : b.app_name
  const themeMeta = document.querySelector('meta[name="theme-color"]')
  if (themeMeta) themeMeta.setAttribute('content', b.color_primary)
}

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const applyBranding = useCallback((b) => {
    const merged = { ...DEFAULTS, ...b }
    setBranding(merged)
    applyBrandingToDocument(merged)
    try {
      localStorage.setItem('branding', JSON.stringify(merged))
    } catch {
      /* ignore */
    }
  }, [])

  const refreshBranding = useCallback(async () => {
    try {
      const { data } = await api.get('/branding')
      applyBranding(data)
    } catch {
      const cached = localStorage.getItem('branding')
      if (cached) {
        try {
          applyBranding(JSON.parse(cached))
        } catch {
          applyBranding(DEFAULTS)
        }
      } else {
        applyBranding(DEFAULTS)
      }
    } finally {
      setLoading(false)
    }
  }, [applyBranding])

  useEffect(() => {
    const cached = localStorage.getItem('branding')
    if (cached) {
      try {
        applyBranding(JSON.parse(cached))
      } catch {
        /* use defaults until fetch */
      }
    }
    refreshBranding()
  }, [refreshBranding, applyBranding])

  const value = useMemo(
    () => ({ branding, loading, refreshBranding, applyBranding }),
    [branding, loading, refreshBranding, applyBranding],
  )

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  return useContext(BrandingContext)
}
