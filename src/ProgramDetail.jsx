import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from './api'
import {
  buildFormData,
  emptyConference,
  emptyPoint,
  emptyProgramLecture,
  emptyRetreat,
  emptySubtopic,
  emptyTopic,
  prepareSavePayload,
  programFromApi,
} from './programForm'

export default function ProgramDetail({ showToast, Icon }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = location.pathname.endsWith('/new')

  const [tab, setTab] = useState('info')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [slogan, setSlogan] = useState('')
  const [verse, setVerse] = useState('')
  const [topics, setTopics] = useState([emptyTopic()])
  const [conferences, setConferences] = useState([emptyConference()])
  const [retreats, setRetreats] = useState([emptyRetreat()])
  const [programLectures, setProgramLectures] = useState([])

  const load = useCallback(async () => {
    if (isNew) return
    setLoading(true)
    try {
      const { data } = await api.get(`/annual-programs/${id}`)
      const p = programFromApi(data.data)
      setYear(p.year)
      setSlogan(p.slogan)
      setVerse(p.verse)
      setTopics(p.topics?.length ? p.topics : [emptyTopic()])
      setConferences(p.conferences?.length ? p.conferences : [emptyConference()])
      setRetreats(p.retreats?.length ? p.retreats : [emptyRetreat()])
      setProgramLectures(p.program_lectures ?? [])
    } catch {
      showToast('فشل تحميل البرنامج', 'error')
      navigate('/programs')
    } finally {
      setLoading(false)
    }
  }, [id, isNew, navigate, showToast])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    const form = { year, slogan, verse, topics, conferences, retreats, program_lectures: programLectures }
    const prepared = prepareSavePayload(form)
    if (prepared.error) {
      showToast(prepared.error, 'error')
      return
    }

    setSaving(true)
    try {
      const fd = buildFormData(prepared.payload, prepared.topicFiles, prepared.conferenceFiles)

      if (isNew) {
        const { data } = await api.post('/annual-programs', fd)
        showToast('تم إضافة البرنامج ✓')
        const newId = data.data?.id
        navigate(newId ? `/programs/${newId}` : '/programs')
      } else {
        await api.post(`/annual-programs/${id}`, fd)
        showToast('تم الحفظ ✓')
        navigate(`/programs/${id}`)
      }
    } catch (err) {
      const msg = err.response?.data?.message
        ?? (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : 'فشل الحفظ')
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'info', label: 'البيانات' },
    { key: 'topics', label: `المواضيع (${topics.filter((t) => t.name?.trim()).length})` },
    { key: 'conferences', label: `المؤتمرات (${conferences.filter((c) => c.title?.trim()).length})` },
    { key: 'retreats', label: `الخلوات (${retreats.filter((r) => r.name?.trim()).length})` },
    { key: 'lectures', label: `محاضرات البرنامج (${programLectures.filter((l) => l.name?.trim()).length})` },
  ]

  if (loading) {
    return <p className="py-20 text-center text-slate-500">جاري التحميل...</p>
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('/programs')} className="flex items-center gap-1 text-sm font-bold text-church-800">
            {Icon?.arrowLeft?.('w-4 h-4')}
            البرامج
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-bold text-slate-600">{isNew ? 'برنامج جديد' : `تعديل ${year}`}</span>
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={() => navigate(`/programs/${id}`)}
            className="rounded-xl border border-church-200 px-3 py-1.5 text-xs font-bold text-church-800 hover:bg-church-50"
          >
            عرض البطاقات
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-stone-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${
              tab === t.key ? 'bg-white text-church-800 shadow-sm' : 'text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">السنة *</label>
            <input
              type="number"
              className="input-field"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min={2000}
              max={2100}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">شعار السنة</label>
            <input className="input-field" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="عنوان أو شعار البرنامج" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">الآية</label>
            <textarea className="input-field min-h-[100px]" value={verse} onChange={(e) => setVerse(e.target.value)} placeholder="آية السنة..." />
          </div>
        </div>
      )}

      {tab === 'topics' && (
        <div className="space-y-3">
          {topics.map((topic, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-church-800">موضوع {i + 1}</span>
                {topics.length > 1 && (
                  <button type="button" onClick={() => setTopics((t) => t.filter((_, j) => j !== i))} className="text-xs text-red-600 font-bold">
                    حذف
                  </button>
                )}
              </div>
              <input
                className="input-field mb-3"
                placeholder="اسم الموضوع"
                value={topic.name}
                onChange={(e) => setTopics((arr) => arr.map((t, j) => (j === i ? { ...t, name: e.target.value } : t)))}
              />
              <div className="flex flex-wrap items-center gap-3">
                {(topic.image_url || topic.imageFile) && !topic.remove_image && (
                  <img
                    src={topic.imageFile ? URL.createObjectURL(topic.imageFile) : topic.image_url}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-stone-200"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setTopics((arr) => arr.map((t, j) => (j === i ? { ...t, imageFile: file, remove_image: false } : t)))
                  }}
                />
                {topic.image_url && !topic.imageFile && (
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => setTopics((arr) => arr.map((t, j) => (j === i ? { ...t, remove_image: true } : t)))}
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setTopics((t) => [...t, emptyTopic()])} className="w-full rounded-xl border-2 border-dashed border-church-200 py-3 text-sm font-bold text-church-800">
            + موضوع
          </button>
        </div>
      )}

      {tab === 'conferences' && (
        <div className="space-y-3">
          {conferences.map((conf, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-between">
                <span className="text-xs font-bold text-church-800">مؤتمر {i + 1}</span>
                {conferences.length > 1 && (
                  <button type="button" onClick={() => setConferences((c) => c.filter((_, j) => j !== i))} className="text-xs font-bold text-red-600">
                    حذف
                  </button>
                )}
              </div>
              <input
                className="input-field mb-3"
                placeholder="عنوان المؤتمر"
                value={conf.title}
                onChange={(e) => setConferences((arr) => arr.map((c, j) => (j === i ? { ...c, title: e.target.value } : c)))}
              />
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {(conf.image_url || conf.imageFile) && !conf.remove_image && (
                  <img
                    src={conf.imageFile ? URL.createObjectURL(conf.imageFile) : conf.image_url}
                    alt=""
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setConferences((arr) => arr.map((c, j) => (j === i ? { ...c, imageFile: file, remove_image: false } : c)))
                  }}
                />
              </div>
              <p className="mb-2 text-xs font-bold text-slate-500">مواضيع فرعية</p>
              {(conf.subtopics ?? []).map((sub, si) => (
                <div key={si} className="mb-2 flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="موضوع فرعي"
                    value={sub.title}
                    onChange={(e) =>
                      setConferences((arr) =>
                        arr.map((c, j) =>
                          j === i
                            ? {
                                ...c,
                                subtopics: c.subtopics.map((s, k) => (k === si ? { ...s, title: e.target.value } : s)),
                              }
                            : c,
                        ),
                      )
                    }
                  />
                  {(conf.subtopics?.length ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setConferences((arr) =>
                          arr.map((c, j) => (j === i ? { ...c, subtopics: c.subtopics.filter((_, k) => k !== si) } : c)),
                        )
                      }
                      className="shrink-0 text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setConferences((arr) =>
                    arr.map((c, j) => (j === i ? { ...c, subtopics: [...(c.subtopics ?? []), emptySubtopic()] } : c)),
                  )
                }
                className="text-xs font-bold text-church-800"
              >
                + موضوع فرعي
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setConferences((c) => [...c, emptyConference()])} className="w-full rounded-xl border-2 border-dashed border-gold-300 py-3 text-sm font-bold text-church-800">
            + مؤتمر
          </button>
        </div>
      )}

      {tab === 'lectures' && (
        <div className="space-y-3">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
            مرجع لمحاضرات سنة البرنامج فقط — غير مرتبطة بمحاضرات المخدومين أو الحضور.
          </p>
          {programLectures.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">لا محاضرات مسجّلة بعد</p>
          ) : (
            programLectures.map((lecture, i) => (
              <div key={lecture.id ?? `new-${i}`} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex justify-between">
                  <span className="text-xs font-bold text-church-800">محاضرة {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setProgramLectures((arr) => arr.filter((_, j) => j !== i))}
                    className="text-xs font-bold text-red-600"
                  >
                    حذف
                  </button>
                </div>
                <input
                  className="input-field mb-3"
                  placeholder="اسم المحاضرة *"
                  value={lecture.name}
                  onChange={(e) =>
                    setProgramLectures((arr) => arr.map((l, j) => (j === i ? { ...l, name: e.target.value } : l)))
                  }
                />
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-bold text-slate-500">التاريخ</label>
                  <input
                    type="date"
                    className="input-field"
                    value={lecture.date ?? ''}
                    onChange={(e) =>
                      setProgramLectures((arr) => arr.map((l, j) => (j === i ? { ...l, date: e.target.value } : l)))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">ملاحظات</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    placeholder="ملاحظات اختيارية..."
                    value={lecture.notes ?? ''}
                    onChange={(e) =>
                      setProgramLectures((arr) => arr.map((l, j) => (j === i ? { ...l, notes: e.target.value } : l)))
                    }
                  />
                </div>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => setProgramLectures((arr) => [...arr, emptyProgramLecture()])}
            className="w-full rounded-xl border-2 border-dashed border-church-200 py-3 text-sm font-bold text-church-800"
          >
            + محاضرة
          </button>
        </div>
      )}

      {tab === 'retreats' && (
        <div className="space-y-3">
          {retreats.map((retreat, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-between">
                <span className="text-xs font-bold text-church-800">خلوة {i + 1}</span>
                {retreats.length > 1 && (
                  <button type="button" onClick={() => setRetreats((r) => r.filter((_, j) => j !== i))} className="text-xs font-bold text-red-600">
                    حذف
                  </button>
                )}
              </div>
              <input
                className="input-field mb-3"
                placeholder="اسم الخلوة"
                value={retreat.name}
                onChange={(e) => setRetreats((arr) => arr.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
              />
              <p className="mb-2 text-xs font-bold text-slate-500">النِقَط</p>
              {(retreat.points ?? []).map((point, pi) => (
                <div key={pi} className="mb-2 flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder={`نقطة ${pi + 1}`}
                    value={point.content}
                    onChange={(e) =>
                      setRetreats((arr) =>
                        arr.map((r, j) =>
                          j === i
                            ? { ...r, points: r.points.map((p, k) => (k === pi ? { ...p, content: e.target.value } : p)) }
                            : r,
                        ),
                      )
                    }
                  />
                  {(retreat.points?.length ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setRetreats((arr) =>
                          arr.map((r, j) => (j === i ? { ...r, points: r.points.filter((_, k) => k !== pi) } : r)),
                        )
                      }
                      className="text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setRetreats((arr) => arr.map((r, j) => (j === i ? { ...r, points: [...(r.points ?? []), emptyPoint()] } : r)))
                }
                className="text-xs font-bold text-church-800"
              >
                + نقطة
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setRetreats((r) => [...r, emptyRetreat()])} className="w-full rounded-xl border-2 border-dashed border-stone-300 py-3 text-sm font-bold text-church-800">
            + خلوة
          </button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 p-4 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary w-full py-3 text-sm md:max-w-xs">
          {saving ? 'جاري الحفظ...' : isNew ? 'إضافة البرنامج' : 'حفظ التعديلات'}
        </button>
      </div>
    </div>
  )
}
