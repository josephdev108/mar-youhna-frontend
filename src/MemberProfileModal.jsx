import { useCallback, useEffect, useState } from 'react'
import api from './api'
import MemberLocationActions from './MemberLocationActions'

export default function MemberProfileModal({ memberId, onClose, Modal, Icon, showToast }) {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/members/${memberId}/profile`)
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const member = profile?.member?.data ?? profile?.member
  const summary = profile?.summary
  const visitations = profile?.visitations ?? []

  const detailRows = member
    ? [
        { label: 'الموبايل', value: member.phone },
        { label: 'العنوان', value: member.address },
        { label: 'الكنيسة', value: member.church },
        { label: 'أب الاعتراف', value: member.confession_father },
        { label: 'تاريخ الميلاد', value: member.birth_date },
        { label: 'الدفعة', value: member.batch },
      ].filter((r) => r.value)
    : []

  return (
    <Modal wide title={member?.name ?? 'الملف الشخصي'} onClose={onClose}>
      {loading ? (
        <p className="py-12 text-center text-sm text-slate-400">جاري التحميل...</p>
      ) : !member ? (
        <p className="py-12 text-center text-sm text-slate-500">تعذر تحميل البيانات</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-l from-church-800 to-church-900 p-4 text-white">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">
              {member.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold">{member.name}</p>
              {member.phone && (
                <a href={`tel:${member.phone}`} className="mt-0.5 block font-mono text-sm text-gold-100" dir="ltr" onClick={(e) => e.stopPropagation()}>
                  {member.phone}
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-700">الموقع</h3>
            <MemberLocationActions
              member={member}
              showToast={showToast ?? (() => {})}
              onUpdated={(updated) =>
                setProfile((prev) => {
                  if (!prev) return prev
                  const m = prev.member?.data ?? prev.member
                  const next = {
                    ...m,
                    location_lat: updated.location_lat,
                    location_lng: updated.location_lng,
                  }
                  if (prev.member?.data) {
                    return { ...prev, member: { ...prev.member, data: next } }
                  }
                  return { ...prev, member: next }
                })
              }
            />
          </div>

          {detailRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-700">البيانات الشخصية</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {detailRows.map((row) => (
                  <div key={row.label} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-[10px] text-slate-400">{row.label}</p>
                    <p className="text-sm font-medium text-slate-800">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {member.relatives?.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-700">الأقارب</h3>
              <div className="space-y-1">
                {member.relatives.map((r, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-slate-500"> · {r.relation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {summary && (
            <div>
              <h3 className="mb-2 text-sm font-bold text-slate-700">ملخص الحضور</h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-church-50 py-2">
                  <p className="text-lg font-bold text-church-800">{summary.total_lectures}</p>
                  <p className="text-church-800">محاضرات</p>
                </div>
                <div className="rounded-lg bg-emerald-50 py-2">
                  <p className="text-lg font-bold text-emerald-600">{summary.present_count}</p>
                  <p className="text-emerald-700">حضر</p>
                </div>
                <div className="rounded-lg bg-red-50 py-2">
                  <p className="text-lg font-bold text-red-500">{summary.absent_count}</p>
                  <p className="text-red-600">غاب</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-bold text-slate-700">سجل الافتقاد</h3>
            {visitations.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">لا يوجد افتقاد مسجّل</p>
            ) : (
              <div className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100">
                {visitations.map((v) => (
                  <div key={v.id} className="flex items-start justify-between gap-2 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.session_day}</p>
                      <p className="text-[10px] text-slate-500">{(v.servants ?? []).map((s) => s.name).join(' · ')}</p>
                      {v.notes && <p className="mt-0.5 text-[10px] text-slate-600">{v.notes}</p>}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {v.status === 'done' ? 'تمت' : 'غير موجود'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
