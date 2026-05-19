import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'

export default function VisitationSessions({ showToast, Modal, Icon }) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [servants, setServants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [form, setForm] = useState({ day: new Date().toISOString().slice(0, 10), servant_ids: [] })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sessRes, servRes] = await Promise.all([
        api.get('/visitation-sessions'),
        api.get('/servants?per_page=100').catch(() => ({ data: { data: [] } })),
      ])
      setSessions(sessRes.data.data ?? sessRes.data ?? [])
      setServants(servRes.data.data ?? [])
    } catch {
      showToast('فشل تحميل جلسات الافتقاد', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const toggleServant = (id) => {
    setForm((prev) => ({
      ...prev,
      servant_ids: prev.servant_ids.includes(id)
        ? prev.servant_ids.filter((x) => x !== id)
        : [...prev.servant_ids, id],
    }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.servant_ids.length === 0) {
      showToast('اختار خادم واحد على الأقل', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/visitation-sessions', form)
      setShowAdd(false)
      setForm({ day: new Date().toISOString().slice(0, 10), servant_ids: [] })
      showToast('تم إنشاء جلسة الافتقاد ✓')
      await load()
    } catch {
      showToast('فشل الإنشاء', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/visitation-sessions/${id}`)
      setDeletingId(null)
      showToast('تم الحذف')
      await load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700"
        >
          {Icon.plus('w-4 h-4')}
          جلسة افتقاد جديدة
        </button>
      </div>

      {showAdd && (
        <Modal title="جلسة افتقاد جديدة" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">يوم الافتقاد *</label>
              <input
                type="date"
                required
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                value={form.day}
                onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs text-slate-500">الخدام المشاركون *</label>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {servants.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">لا يوجد خدام</p>
                ) : (
                  servants.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                        form.servant_ids.includes(s.id) ? 'bg-violet-50 text-violet-800' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.servant_ids.includes(s.id)}
                        onChange={() => toggleServant(s.id)}
                        className="rounded border-slate-300"
                      />
                      <span className="font-medium">{s.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border py-3 text-sm font-bold">
                إلغاء
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:opacity-60">
                {saving ? '...' : 'إنشاء'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeletingId(null)}>
          <p className="mb-5 text-sm text-slate-600">حذف جلسة الافتقاد وجميع سجلاتها؟</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border py-3 text-sm font-bold">
              إلغاء
            </button>
            <button type="button" onClick={() => handleDelete(deletingId)} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white">
              حذف
            </button>
          </div>
        </Modal>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-700">جلسات الافتقاد</h2>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">جاري التحميل...</p>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-2 text-5xl">🏠</div>
            <p className="text-sm">لا توجد جلسات افتقاد</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => navigate(`/visitations/${s.id}`)}
                  className="flex flex-1 items-start gap-3 text-right"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    {Icon.home('w-5 h-5')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{s.day}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(s.servants ?? []).map((sv) => sv.name).join(' · ') || '—'}
                    </p>
                    <p className="mt-1 text-xs">
                      <span className="font-bold text-emerald-600">تمت: {s.done_count ?? 0}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="font-bold text-red-500">غير موجود: {s.not_exist_count ?? 0}</span>
                    </p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/visitations/${s.id}`)}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700"
                  >
                    فتح
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(s.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
                  >
                    {Icon.trash('w-4 h-4 inline')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
