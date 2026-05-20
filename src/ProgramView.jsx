import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from './api'
import {
  emptyConference,
  emptyProgramLecture,
  emptyRetreat,
  emptySubtopic,
  emptyTopic,
  programFromApi,
  saveAnnualProgram,
} from './programForm'

function Section({ title, count, onAdd, addLabel, children }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-church-900">{title}</h2>
          {count != null && <span className="text-xs font-medium text-slate-400">{count}</span>}
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-church-50 px-2.5 py-1 text-xs font-bold text-church-800 hover:bg-church-100"
          >
            {addLabel ?? '+ إضافة'}
          </button>
        )}
      </div>
      <div className="px-4 py-2">{children}</div>
    </section>
  )
}

function ItemActions({ onEdit, onDelete, Icon, disabled }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onEdit}
        title="تعديل"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40"
      >
        {Icon?.pencil?.('w-3.5 h-3.5')}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onDelete}
        title="حذف"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
      >
        {Icon?.trash?.('w-3.5 h-3.5')}
      </button>
    </div>
  )
}

function Thumb({ src, alt }) {
  if (!src) return null
  return (
    <img src={src} alt={alt ?? ''} className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-stone-200" />
  )
}

function EditModal({ modal, onClose, onSave, saving }) {
  const [draft, setDraft] = useState(modal.draft)

  useEffect(() => {
    setDraft(modal.draft)
  }, [modal])

  const titleByKind = {
    header: modal.mode === 'add' ? 'بيانات البرنامج' : 'تعديل بيانات السنة',
    topic: modal.mode === 'add' ? 'إضافة موضوع' : 'تعديل موضوع',
    conference: modal.mode === 'add' ? 'إضافة مؤتمر' : 'تعديل مؤتمر',
    lecture: modal.mode === 'add' ? 'إضافة محاضرة' : 'تعديل محاضرة',
    retreat: modal.mode === 'add' ? 'إضافة خلوة' : 'تعديل خلوة',
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(draft)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="font-bold text-church-900">{titleByKind[modal.kind]}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-stone-100">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-3">
          {modal.kind === 'header' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">السنة *</label>
                <input
                  type="number"
                  className="input-field"
                  value={draft.year}
                  onChange={(e) => setDraft((d) => ({ ...d, year: e.target.value }))}
                  min={2000}
                  max={2100}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">شعار السنة</label>
                <input
                  className="input-field"
                  value={draft.slogan}
                  onChange={(e) => setDraft((d) => ({ ...d, slogan: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">الآية</label>
                <textarea className="input-field min-h-[80px]" value={draft.verse} onChange={(e) => setDraft((d) => ({ ...d, verse: e.target.value }))} />
              </div>
            </>
          )}

          {modal.kind === 'topic' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">اسم الموضوع *</label>
                <input
                  className="input-field"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(draft.image_url || draft.imageFile) && !draft.remove_image && (
                  <img
                    src={draft.imageFile ? URL.createObjectURL(draft.imageFile) : draft.image_url}
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
                    if (file) setDraft((d) => ({ ...d, imageFile: file, remove_image: false }))
                  }}
                />
                {draft.image_url && !draft.imageFile && (
                  <button type="button" className="text-xs text-red-600" onClick={() => setDraft((d) => ({ ...d, remove_image: true }))}>
                    إزالة الصورة
                  </button>
                )}
              </div>
            </>
          )}

          {modal.kind === 'conference' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">عنوان المؤتمر *</label>
                <input
                  className="input-field"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(draft.image_url || draft.imageFile) && !draft.remove_image && (
                  <img
                    src={draft.imageFile ? URL.createObjectURL(draft.imageFile) : draft.image_url}
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
                    if (file) setDraft((d) => ({ ...d, imageFile: file, remove_image: false }))
                  }}
                />
                {draft.image_url && !draft.imageFile && (
                  <button type="button" className="text-xs text-red-600" onClick={() => setDraft((d) => ({ ...d, remove_image: true }))}>
                    إزالة الصورة
                  </button>
                )}
              </div>
              <p className="text-xs font-bold text-slate-500">مواضيع فرعية</p>
              {(draft.subtopics ?? []).map((sub, si) => (
                <div key={si} className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="موضوع فرعي"
                    value={sub.title}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        subtopics: d.subtopics.map((s, k) => (k === si ? { ...s, title: e.target.value } : s)),
                      }))
                    }
                  />
                  {(draft.subtopics?.length ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, subtopics: d.subtopics.filter((_, k) => k !== si) }))}
                      className="text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, subtopics: [...(d.subtopics ?? []), emptySubtopic()] }))}
                className="text-xs font-bold text-church-800"
              >
                + موضوع فرعي
              </button>
            </>
          )}

          {modal.kind === 'lecture' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">اسم المحاضرة *</label>
                <input
                  className="input-field"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">التاريخ</label>
                <input
                  type="date"
                  className="input-field"
                  value={draft.date ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">ملاحظات</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={draft.notes ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                />
              </div>
            </>
          )}

          {modal.kind === 'retreat' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-500">اسم الخلوة *</label>
                <input
                  className="input-field"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  required
                />
              </div>
              <p className="text-xs font-bold text-slate-500">النِقَط</p>
              {(draft.points ?? []).map((point, pi) => (
                <div key={pi} className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder={`نقطة ${pi + 1}`}
                    value={point.content}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        points: d.points.map((p, k) => (k === pi ? { ...p, content: e.target.value } : p)),
                      }))
                    }
                  />
                  {(draft.points?.length ?? 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, points: d.points.filter((_, k) => k !== pi) }))}
                      className="text-red-500 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDraft((d) => ({ ...d, points: [...(d.points ?? []), { content: '' }] }))}
                className="text-xs font-bold text-church-800"
              >
                + نقطة
              </button>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-bold text-slate-600">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProgramView({ showToast, Icon }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(null)
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/annual-programs/${id}`)
      setForm(programFromApi(data.data))
    } catch {
      showToast('فشل تحميل البرنامج', 'error')
      navigate('/programs')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, showToast])

  useEffect(() => {
    load()
  }, [load])

  const persist = async (nextForm) => {
    setSaving(true)
    try {
      const saved = await saveAnnualProgram(api, id, nextForm)
      setForm(programFromApi(saved))
      showToast('تم الحفظ ✓')
      setModal(null)
      setConfirmDelete(null)
    } catch (err) {
      const msg =
        err.validation
          ? err.message
          : err.response?.data?.message ??
            (err.response?.data?.errors ? Object.values(err.response.data.errors).flat()[0] : 'فشل الحفظ')
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleModalSave = (draft) => {
    if (!form || !modal) return
    let next = { ...form }

    if (modal.kind === 'header') {
      next = { ...next, year: draft.year, slogan: draft.slogan, verse: draft.verse }
    } else if (modal.kind === 'topic') {
      const list = [...next.topics]
      if (modal.mode === 'add') list.push(draft)
      else list[modal.index] = { ...list[modal.index], ...draft }
      next.topics = list
    } else if (modal.kind === 'conference') {
      const list = [...next.conferences]
      const item = { ...draft, subtopics: (draft.subtopics ?? []).filter((s) => s.title?.trim()) }
      if (modal.mode === 'add') list.push(item)
      else list[modal.index] = { ...list[modal.index], ...item }
      next.conferences = list
    } else if (modal.kind === 'lecture') {
      const list = [...next.program_lectures]
      if (modal.mode === 'add') list.push(draft)
      else list[modal.index] = { ...list[modal.index], ...draft }
      next.program_lectures = list
    } else if (modal.kind === 'retreat') {
      const list = [...next.retreats]
      const item = { ...draft, points: (draft.points ?? []).filter((p) => p.content?.trim()) }
      if (modal.mode === 'add') list.push(item)
      else list[modal.index] = { ...list[modal.index], ...item }
      next.retreats = list
    }

    persist(next)
  }

  const handleConfirmDelete = () => {
    if (!form || !confirmDelete) return
    const { kind, index } = confirmDelete
    const next = { ...form }
    if (kind === 'topic') next.topics = form.topics.filter((_, i) => i !== index)
    else if (kind === 'conference') next.conferences = form.conferences.filter((_, i) => i !== index)
    else if (kind === 'lecture') next.program_lectures = form.program_lectures.filter((_, i) => i !== index)
    else if (kind === 'retreat') next.retreats = form.retreats.filter((_, i) => i !== index)
    persist(next)
  }

  if (loading || !form) {
    return <p className="py-20 text-center text-sm text-slate-500">جاري التحميل...</p>
  }

  const programLectures = [...form.program_lectures].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date.localeCompare(b.date)
  })

  const lectureIndex = (lecture) => form.program_lectures.findIndex((l) => l === lecture || l.id === lecture.id)

  const formatLectureDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const openAdd = (kind) => {
    const drafts = {
      topic: emptyTopic(),
      conference: emptyConference(),
      lecture: emptyProgramLecture(),
      retreat: emptyRetreat(),
    }
    setModal({ kind, mode: 'add', draft: drafts[kind] })
  }

  const openEdit = (kind, index, draft) => {
    setModal({ kind, mode: 'edit', index, draft: structuredClone(draft) })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-10">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/programs')}
          className="flex items-center gap-1 text-sm font-bold text-church-800"
        >
          {Icon?.arrowLeft?.('w-4 h-4')}
          البرامج
        </button>
        <button
          type="button"
          onClick={() => navigate(`/programs/${id}/edit`)}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-stone-50"
        >
          محرر كامل
        </button>
      </div>

      <header className="border-r-4 border-church-800 pr-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-bold text-church-900">{form.year}</p>
            {form.slogan && <p className="mt-1 text-base font-semibold text-slate-800">{form.slogan}</p>}
            {form.verse && <p className="mt-3 text-sm leading-relaxed text-slate-600">{form.verse}</p>}
            <p className="mt-2 text-xs text-slate-400">
              {form.topics.length} موضوع · {form.conferences.length} مؤتمر · {form.retreats.length} خلوة
              {form.program_lectures.length > 0 && ` · ${form.program_lectures.length} محاضرة`}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            setModal({
              kind: 'header',
              mode: 'edit',
              draft: { year: form.year, slogan: form.slogan, verse: form.verse },
            })
          }
          className="mt-2 text-xs font-bold text-church-800 hover:underline disabled:opacity-40"
        >
          تعديل بيانات السنة
        </button>
      </header>

      <Section
        title="مواضيع السنة"
        count={form.topics.length}
        onAdd={saving ? undefined : () => openAdd('topic')}
      >
        {form.topics.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">لا مواضيع — اضغط إضافة</p>
        ) : (
          <ul className="divide-y divide-stone-50">
            {form.topics.map((topic, i) => (
              <li key={topic.id ?? i} className="flex items-center gap-3 py-2.5">
                <Thumb src={topic.image_url && !topic.remove_image ? topic.image_url : null} alt={topic.name} />
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{topic.name}</span>
                <ItemActions
                  Icon={Icon}
                  disabled={saving}
                  onEdit={() => openEdit('topic', i, topic)}
                  onDelete={() => setConfirmDelete({ kind: 'topic', index: i, label: topic.name })}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="المؤتمرات" count={form.conferences.length} onAdd={saving ? undefined : () => openAdd('conference')}>
        {form.conferences.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">لا مؤتمرات</p>
        ) : (
          <ul className="divide-y divide-stone-50">
            {form.conferences.map((conf, i) => (
              <li key={conf.id ?? i} className="py-3">
                <div className="flex items-start gap-3">
                  <Thumb src={conf.image_url && !conf.remove_image ? conf.image_url : null} alt={conf.title} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-church-900">{conf.title}</h3>
                    {(conf.subtopics?.length ?? 0) > 0 && (
                      <ul className="mt-2 space-y-1 pr-2">
                        {conf.subtopics.map((sub, si) => (
                          <li key={sub.id ?? si} className="text-sm text-slate-600 before:ml-1.5 before:content-['–']">
                            {sub.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <ItemActions
                    Icon={Icon}
                    disabled={saving}
                    onEdit={() => openEdit('conference', i, conf)}
                    onDelete={() => setConfirmDelete({ kind: 'conference', index: i, label: conf.title })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="محاضرات السنة" count={form.program_lectures.length} onAdd={saving ? undefined : () => openAdd('lecture')}>
        <p className="border-b border-stone-50 pb-3 pt-1 text-xs text-amber-800">
          مرجع أرشيفي — غير مرتبط بمحاضرات المخدومين أو الحضور.
        </p>
        {programLectures.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">لا محاضرات</p>
        ) : (
          <ul className="divide-y divide-stone-50">
            {programLectures.map((lecture) => {
              const i = lectureIndex(lecture)
              return (
                <li key={lecture.id ?? i} className="py-3">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-bold text-church-900">{lecture.name}</h3>
                        {lecture.date && (
                          <time className="text-xs font-medium text-slate-500">{formatLectureDate(lecture.date)}</time>
                        )}
                      </div>
                      {lecture.notes?.trim() && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{lecture.notes}</p>
                      )}
                    </div>
                    <ItemActions
                      Icon={Icon}
                      disabled={saving}
                      onEdit={() => openEdit('lecture', i, lecture)}
                      onDelete={() => setConfirmDelete({ kind: 'lecture', index: i, label: lecture.name })}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      <Section title="الخلوات" count={form.retreats.length} onAdd={saving ? undefined : () => openAdd('retreat')}>
        {form.retreats.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">لا خلوات</p>
        ) : (
          <ul className="divide-y divide-stone-50">
            {form.retreats.map((retreat, i) => (
              <li key={retreat.id ?? i} className="py-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-church-900">{retreat.name}</h3>
                    {(retreat.points?.length ?? 0) > 0 ? (
                      <ul className="mt-2 space-y-1 pr-1">
                        {retreat.points.map((point, pi) => (
                          <li key={point.id ?? pi} className="text-sm leading-relaxed text-slate-600">
                            <span className="text-slate-400">· </span>
                            {point.content}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">لا نقاط</p>
                    )}
                  </div>
                  <ItemActions
                    Icon={Icon}
                    disabled={saving}
                    onEdit={() => openEdit('retreat', i, retreat)}
                    onDelete={() => setConfirmDelete({ kind: 'retreat', index: i, label: retreat.name })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {modal && <EditModal modal={modal} onClose={() => setModal(null)} onSave={handleModalSave} saving={saving} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p className="font-bold text-slate-800">حذف «{confirmDelete.label}»؟</p>
            <p className="mt-2 text-sm text-slate-500">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border py-2 text-sm font-bold text-slate-600"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
