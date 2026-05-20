import { useEffect, useState } from 'react'
import api from './api'
import { useBranding } from './BrandingContext'
import BrandLogo from './BrandLogo'

const COLOR_FIELDS = [
  { key: 'color_primary', label: 'اللون الأساسي' },
  { key: 'color_primary_dark', label: 'الأساسي الداكن' },
  { key: 'color_primary_darker', label: 'الأساسي الأغمق (القائمة)' },
  { key: 'color_accent', label: 'اللون الذهبي' },
  { key: 'color_accent_light', label: 'الذهبي الفاتح' },
]

export default function Settings({ showToast }) {
  const { branding, applyBranding, refreshBranding } = useBranding()
  const [form, setForm] = useState({ ...branding })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ ...branding })
    setLogoPreview(branding.logo_url)
    setRemoveLogo(false)
    setLogoFile(null)
  }, [branding])

  const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setRemoveLogo(false)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body = new FormData()
      body.append('app_name', form.app_name)
      body.append('app_subtitle', form.app_subtitle ?? '')
      COLOR_FIELDS.forEach(({ key }) => body.append(key, form[key]))
      if (logoFile) body.append('logo', logoFile)
      if (removeLogo) body.append('remove_logo', '1')

      const { data } = await api.post('/branding', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      applyBranding(data.data)
      showToast('تم حفظ الإعدادات ✓')
      setLogoFile(null)
      setRemoveLogo(false)
    } catch (err) {
      const msg = err.response?.data?.message ?? 'فشل الحفظ'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('استعادة الإعدادات الافتراضية؟')) return
    setSaving(true)
    try {
      const { data } = await api.post('/branding/reset')
      applyBranding(data.data)
      await refreshBranding()
      showToast('تمت الاستعادة')
    } catch {
      showToast('فشل الاستعادة', 'error')
    } finally {
      setSaving(false)
    }
  }

  const previewBranding = { ...form, logo_url: removeLogo ? null : (logoPreview || form.logo_url) }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">إعدادات المظهر</h1>
        <p className="mt-1 text-sm text-slate-500">اللوجو، اسم الاجتماع، والألوان</p>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">الهوية</h2>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">اسم الاجتماع</label>
            <input
              className="input-field"
              value={form.app_name}
              onChange={(e) => setForm((f) => ({ ...f, app_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">العنوان الفرعي</label>
            <input
              className="input-field"
              value={form.app_subtitle ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, app_subtitle: e.target.value }))}
              placeholder="مثال: للخريجين"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-500">اللوجو</label>
            <div className="flex flex-wrap items-center gap-4">
              <BrandLogo
                branding={previewBranding}
                className="h-20 w-20 rounded-full bg-white p-1 shadow ring-2 ring-gold-300/50 object-contain"
              />
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onLogoChange}
                  className="block text-xs text-slate-600"
                />
                {(form.logo_url || logoPreview) && !removeLogo && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveLogo(true)
                      setLogoFile(null)
                      setLogoPreview(null)
                    }}
                    className="text-xs font-bold text-red-600"
                  >
                    إزالة اللوجو المخصص
                  </button>
                )}
                <p className="text-[10px] text-slate-400">PNG أو JPG — حد أقصى 2 ميجا</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">الألوان</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold text-slate-500">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-stone-200"
                  />
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="input-field flex-1 font-mono text-xs uppercase"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-800">معاينة</h2>
          <div
            className="sidebar-shell flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
            style={{
              background: `linear-gradient(to bottom, ${previewBranding.color_primary_darker}, ${previewBranding.color_primary_dark}, ${previewBranding.color_primary})`,
            }}
          >
            <BrandLogo branding={previewBranding} className="h-16 w-16 rounded-full bg-white p-1 object-contain" />
            <p className="text-sm font-bold text-white">{previewBranding.app_name}</p>
            {previewBranding.app_subtitle && (
              <p className="text-xs" style={{ color: previewBranding.color_accent_light }}>
                {previewBranding.app_subtitle}
              </p>
            )}
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{ backgroundColor: previewBranding.color_primary }}
            >
              زر أساسي
            </button>
            <button
              type="button"
              className="rounded-xl px-4 py-2 text-xs font-bold"
              style={{ backgroundColor: previewBranding.color_accent, color: previewBranding.color_primary_darker }}
            >
              زر ذهبي
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary flex-1 px-6 py-3 text-sm sm:flex-none sm:min-w-[160px]">
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-stone-50 disabled:opacity-60"
          >
            استعادة الافتراضي
          </button>
        </div>
      </form>
    </div>
  )
}
