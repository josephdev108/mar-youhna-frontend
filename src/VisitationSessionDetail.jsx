import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from './api'
import MemberProfileModal from './MemberProfileModal'

export default function VisitationSessionDetail({ showToast, Modal, Icon }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('choose')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileMemberId, setProfileMemberId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/visitation-sessions/${id}`, {
        params: searchDebounced ? { search: searchDebounced } : {},
      })
      setData(res)
    } catch {
      setData(null)
      showToast('فشل تحميل الجلسة', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, searchDebounced, showToast])

  useEffect(() => {
    load()
  }, [load])

  const session = data?.session?.data ?? data?.session
  const summary = data?.summary
  const members = data?.members ?? []

  const pendingCount = useMemo(() => members.filter((m) => !m.record).length, [members])

  const filteredMembers = useMemo(() => {
    if (statusFilter === 'done') return members.filter((m) => m.record?.status === 'done')
    if (statusFilter === 'not_exist') return members.filter((m) => m.record?.status === 'not_exist')
    if (statusFilter === 'pending') return members.filter((m) => !m.record)
    return members
  }, [members, statusFilter])

  const openMember = (m) => {
    setSelected(m)
    if (m.record?.status === 'done') {
      setStep('notes')
      setNotes(m.record.notes ?? '')
    } else if (m.record?.status === 'not_exist') {
      setStep('view')
    } else {
      setStep('choose')
      setNotes('')
    }
  }

  const closeModal = () => {
    setSelected(null)
    setStep('choose')
    setNotes('')
  }

  const saveRecord = async (status, recordNotes = null) => {
    if (!selected) return
    setSaving(true)
    try {
      const payload = {
        member_id: selected.id,
        status,
        notes: status === 'done' ? recordNotes ?? notes : null,
      }
      const { data: res } = await api.post(`/visitation-sessions/${id}/records`, payload)
      showToast('تم الحفظ ✓')
      closeModal()
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          summary: res.summary,
          members: prev.members.map((m) =>
            m.id === selected.id
              ? {
                  ...m,
                  record: {
                    id: res.record?.id,
                    status: payload.status,
                    notes: payload.notes,
                  },
                }
              : m,
          ),
        }
      })
    } catch {
      showToast('فشل الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !data) {
    return <div className="py-20 text-center text-slate-500">جاري التحميل...</div>
  }

  if (!session) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">الجلسة غير موجودة</p>
        <button type="button" onClick={() => navigate('/visitations')} className="mt-4 font-bold text-violet-600">
          رجوع
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10">
      <button
        type="button"
        onClick={() => navigate('/visitations')}
        className="flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-800"
      >
        {Icon.arrowLeft('w-4 h-4')}
        رجوع للجلسات
      </button>

      <div className="rounded-2xl bg-gradient-to-l from-violet-600 to-purple-700 p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">افتقاد — {session.day}</h1>
        <p className="mt-1 text-sm text-violet-100">{(session.servants ?? []).map((s) => s.name).join(' · ')}</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{summary.done_count}</p>
            <p className="text-xs text-slate-500">تمت الزيارة</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-500">{summary.not_exist_count}</p>
            <p className="text-xs text-slate-500">غير موجود</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-500">{pendingCount}</p>
            <p className="text-xs text-slate-500">لم يُسجّل</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-700">{members.length}</p>
            <p className="text-xs text-slate-500">إجمالي المخدومين</p>
          </div>
        </div>
      )}

      <div className="relative">
        {Icon.search('absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none')}
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm shadow-sm"
          placeholder="بحث بالاسم أو الموبايل أو العنوان..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'الكل', count: members.length },
          { key: 'done', label: 'تمت', count: summary?.done_count ?? 0 },
          { key: 'not_exist', label: 'غير موجود', count: summary?.not_exist_count ?? 0 },
          { key: 'pending', label: 'لم يُسجّل', count: pendingCount },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              statusFilter === key ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200'
            }`}
          >
            {label}
            <span className={`mr-1.5 ${statusFilter === key ? 'text-violet-200' : 'text-slate-400'}`}>({count})</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="max-h-[60vh] divide-y divide-slate-50 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">لا يوجد مخدومين في هذا الفلتر</p>
          ) : (
          filteredMembers.map((m) => {
            const st = m.record?.status
            const border =
              st === 'done' ? 'border-r-4 border-r-emerald-500' : st === 'not_exist' ? 'border-r-4 border-r-red-500' : ''
            return (
              <div key={m.id} className={`flex w-full items-center gap-2 px-4 py-3.5 text-right ${border}`}>
                <button
                  type="button"
                  onClick={() => setProfileMemberId(m.id)}
                  title="الملف الشخصي"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                >
                  {Icon.eye('w-4 h-4')}
                </button>
                <button
                  type="button"
                  onClick={() => openMember(m)}
                  className="flex min-w-0 flex-1 items-center justify-between text-right"
                >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800">
                    {m.name}
                    {m.batch ? <span className="mr-2 text-xs font-normal text-slate-400">· {m.batch}</span> : ''}
                  </p>
                  {m.phone && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">موبايل</span>
                      <a
                        href={`tel:${m.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono font-medium text-blue-600 hover:underline"
                        dir="ltr"
                      >
                        {m.phone}
                      </a>
                    </p>
                  )}
                  {m.address && (
                    <p className="mt-0.5 flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="shrink-0 font-bold text-slate-400">عنوان</span>
                      <span>{m.address}</span>
                    </p>
                  )}
                  {m.record?.notes && <p className="mt-1 text-xs text-slate-400">{m.record.notes}</p>}
                </div>
                <span
                  className={`mr-2 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    st === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : st === 'not_exist'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {st === 'done' ? 'تمت ✓' : st === 'not_exist' ? 'غير موجود' : '—'}
                </span>
                </button>
              </div>
            )
          }))}
        </div>
      </div>

      {profileMemberId && (
        <MemberProfileModal
          memberId={profileMemberId}
          onClose={() => setProfileMemberId(null)}
          Modal={Modal}
          Icon={Icon}
        />
      )}

      {selected && (
        <Modal title={selected.name} onClose={closeModal}>
          {(selected.phone || selected.address) && (
            <div className="mb-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm">
              {selected.phone && (
                <p className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">موبايل</span>
                  <a href={`tel:${selected.phone}`} className="font-mono font-medium text-blue-600" dir="ltr">
                    {selected.phone}
                  </a>
                </p>
              )}
              {selected.address && (
                <p className="flex items-start gap-2 text-slate-700">
                  <span className="shrink-0 text-xs font-bold text-slate-400">عنوان</span>
                  <span>{selected.address}</span>
                </p>
              )}
            </div>
          )}
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">اختر حالة الافتقاد لهذا المخدوم:</p>
              <button
                type="button"
                onClick={() => setStep('notes')}
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                تمت الزيارة ✓
              </button>
              <button
                type="button"
                onClick={() => saveRecord('not_exist')}
                disabled={saving}
                className="w-full rounded-xl bg-red-100 py-3.5 text-sm font-bold text-red-700 hover:bg-red-200 disabled:opacity-60"
              >
                المخدوم غير موجود
              </button>
            </div>
          )}

          {step === 'notes' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                saveRecord('done', notes)
              }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-emerald-700">تمت الزيارة</p>
              <div>
                <label className="mb-1 block text-xs text-slate-500">ملاحظات (اختياري)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات عن الافتقاد..."
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl border py-3 text-sm font-bold">
                  إلغاء
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60">
                  {saving ? '...' : 'حفظ'}
                </button>
              </div>
            </form>
          )}

          {step === 'view' && selected.record?.status === 'not_exist' && (
            <div className="space-y-3">
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">المخدوم غير موجود في الافتقاد</p>
              <button type="button" onClick={() => setStep('choose')} className="w-full rounded-xl border py-3 text-sm font-bold">
                تعديل الحالة
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
