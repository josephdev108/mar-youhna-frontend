import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'

export default function Programs({ showToast, Icon }) {
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/annual-programs')
      setList(data.data ?? [])
    } catch {
      showToast('فشل تحميل البرامج', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/annual-programs/${id}`)
      setDeletingId(null)
      showToast('تم الحذف')
      await load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="card-hero flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">أرشيف البرامج السنوية</h1>
          <p className="mt-1 text-sm text-gold-100">مرجع للسنوات السابقة — مواضيع، مؤتمرات، خلوات، ومحاضرات البرنامج</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/programs/new')}
          className="btn-gold shrink-0 px-4 py-2 text-sm"
        >
          + برنامج سنة جديد
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-slate-400">جاري التحميل...</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm text-slate-500">لا توجد برامج مسجّلة بعد</p>
          <button type="button" onClick={() => navigate('/programs/new')} className="btn-primary mt-4 px-6 py-2 text-sm">
            إضافة أول برنامج
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/programs/${p.id}`)}
                  className="text-right"
                >
                  <p className="text-2xl font-bold text-church-800">{p.year}</p>
                  {p.slogan && <p className="mt-1 text-sm font-medium text-slate-700">{p.slogan}</p>}
                  {p.verse && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">{p.verse}</p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(p.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="حذف"
                >
                  {Icon?.trash?.('w-4 h-4')}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg bg-church-50 px-2 py-1 font-bold text-church-800">{p.topics_count} موضوع</span>
                <span className="rounded-lg bg-gold-100 px-2 py-1 font-bold text-church-900">{p.conferences_count} مؤتمر</span>
                <span className="rounded-lg bg-stone-100 px-2 py-1 font-bold text-stone-700">{p.retreats_count} خلوة</span>
                {(p.program_lectures_count ?? 0) > 0 && (
                  <span className="rounded-lg bg-amber-50 px-2 py-1 font-bold text-amber-900">{p.program_lectures_count} محاضرة</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/programs/${p.id}`)}
                  className="flex-1 rounded-xl bg-church-800 py-2 text-xs font-bold text-white hover:bg-church-900"
                >
                  عرض
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/programs/${p.id}/edit`)}
                  className="flex-1 rounded-xl border border-church-200 py-2 text-xs font-bold text-church-800 hover:bg-church-50"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p className="font-bold text-slate-800">حذف برنامج السنة؟</p>
            <p className="mt-2 text-sm text-slate-500">سيتم حذف كل المواضيع والمؤتمرات والخلوات ومحاضرات البرنامج المرتبطة.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border py-2 text-sm font-bold text-slate-600">
                إلغاء
              </button>
              <button type="button" onClick={() => handleDelete(deletingId)} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
