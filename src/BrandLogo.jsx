import { useBranding } from './BrandingContext'

const FALLBACK_LOGO = '/logo.png'

export default function BrandLogo({ className = 'h-12 w-12 object-contain', alt, branding: brandingProp, ...props }) {
  const { branding: contextBranding } = useBranding()
  const branding = brandingProp ?? contextBranding
  const src = branding?.logo_url || FALLBACK_LOGO
  const altText = alt ?? [branding?.app_name, branding?.app_subtitle].filter(Boolean).join(' — ')

  return (
    <img
      src={src}
      alt={altText}
      className={className}
      onError={(e) => {
        if (e.currentTarget.src !== FALLBACK_LOGO) {
          e.currentTarget.src = FALLBACK_LOGO
        }
      }}
      {...props}
    />
  )
}
