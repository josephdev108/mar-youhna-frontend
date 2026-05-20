import { useState } from 'react'
import api from './api'
import { captureCurrentLocation, hasMemberLocation, openMemberInMaps } from './memberLocation'

export default function MemberLocationActions({
  member,
  onUpdated,
  showToast,
  compact = false,
  className = '',
}) {
  const [saving, setSaving] = useState(false)

  const saveLocation = async () => {
    setSaving(true)
    try {
      const { lat, lng } = await captureCurrentLocation()
      const { data } = await api.patch(`/members/${member.id}/location`, {
        location_lat: lat,
        location_lng: lng,
      })
      const updated = data.data ?? data
      onUpdated?.(updated)
      showToast('تم حفظ موقع المخدوم ✓')
    } catch (err) {
      showToast(err.message || err.response?.data?.message || 'فشل حفظ الموقع', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (hasMemberLocation(member)) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => openMemberInMaps(member)}
          className={
            compact
              ? 'inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-800 hover:bg-violet-100'
              : 'flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700'
          }
        >
          <span aria-hidden>📍</span>
          فتح الموقع على الخريطة
        </button>
        {!compact && (
          <button
            type="button"
            disabled={saving}
            onClick={saveLocation}
            className="w-full rounded-xl border border-violet-200 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-50 disabled:opacity-50"
          >
            {saving ? 'جاري التحديث...' : 'تحديث الموقع (موقعي الحالي)'}
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={saving}
      onClick={saveLocation}
      className={
        compact
          ? `inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50 ${className}`
          : `flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50 ${className}`
      }
    >
      <span aria-hidden>📌</span>
      {saving ? 'جاري تحديد الموقع...' : 'تسجيل موقع المخدوم (موقعي الحالي)'}
    </button>
  )
}
