import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from './api'
export default function TripReservations({ showToast, Modal, Icon }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [exceptionConfirmed, setExceptionConfirmed] = useState(false)
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/trips/${id}/reservations`)
      setData(res)
    } catch {
      setData(null)
      showToast('فشل تحميل الحجوزات', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    load()
  }, [load])

  const trip = data?.trip?.data ?? data?.trip
  const summary = data?.summary
  const members = data?.members ?? []

  const tripPrice = trip ? Number(trip.price) : 0
  const remainingCalc = Math.max(0, tripPrice - (Number(paidAmount) || 0))

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = search.trim()
      const matchesSearch = !q || m.name.includes(q) || (m.phone ?? '').includes(q) || (m.batch ?? '').includes(q)
      if (!matchesSearch) return false
      if (filter === 'eligible') return m.eligible
      if (filter === 'ineligible') return !m.eligible
      if (filter === 'reserved') return !!m.reservation
      return true
    })
  }, [members, search, filter])

  const openMember = (m) => {
    setSelected(m)
    setExceptionConfirmed(!!m.reservation?.is_exception)
    if (m.reservation) {
      setPaidAmount(String(m.reservation.paid_amount))
      setPaymentMethod(m.reservation.payment_method)
    } else {
      setPaidAmount('')
      setPaymentMethod('cash')
    }
  }

  const closeModal = () => {
    setSelected(null)
    setExceptionConfirmed(false)
  }

  const handleSave = async () => {
    if (!selected || !trip) return
    setSaving(true)
    try {
      await api.post(`/trips/${id}/reservations`, {
        member_id: selected.id,
        is_exception: !selected.eligible && exceptionConfirmed,
        paid_amount: Number(paidAmount) || 0,
        payment_method: paymentMethod,
      })
      showToast('تم حفظ الحجز ✓')
      closeModal()
      await load()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'فشل الحفظ'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!selected?.reservation) return
    try {
      await api.delete(`/trips/${id}/reservations/${selected.reservation.id}`)
      showToast('تم إلغاء الحجز')
      closeModal()
      await load()
    } catch {
      showToast('فشل الإلغاء', 'error')
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get(`/trips/${id}/reservations/export`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `trip-${id}-reservations.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast('فشل التصدير', 'error')
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">جاري التحميل...</div>
  }

  if (!trip) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">الرحلة غير موجودة</p>
        <button onClick={() => navigate('/trips')} className="mt-4 font-bold text-teal-600">رجوع</button>
      </div>
    )
  }

  const showPaymentForm = selected && (selected.eligible || exceptionConfirmed || selected.reservation)
  const showIneligibleAlert = selected && !selected.eligible && !exceptionConfirmed && !selected.reservation

  return (
    <div className="space-y-4 pb-10">
      <button onClick={() => navigate('/trips')} className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-800">
        {Icon.arrowLeft('w-4 h-4')}
        رجوع للرحلات
      </button>

      <div className="rounded-2xl bg-gradient-to-l from-teal-600 to-emerald-700 p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">{trip.name}</h1>
        <p className="mt-1 text-sm text-teal-100">
          {trip.from_date} → {trip.to_date} · السعر: {tripPrice.toLocaleString('ar-EG')} ج.م
          {trip.attendance_month
            ? ` · حضور ${trip.required_attendance_count} في ${trip.attendance_month}`
            : ` · حضور مطلوب: ${trip.required_attendance_count}`}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-teal-700">{summary.free_seats}</p>
            <p className="text-xs text-slate-500">مقاعد متاحة</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-800">{summary.reserved_count}/{summary.capacity}</p>
            <p className="text-xs text-slate-500">محجوز</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-emerald-600">{Number(summary.collected_amount).toLocaleString('ar-EG')}</p>
            <p className="text-xs text-slate-500">المحصّل (ج.م)</p>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-600">{Number(summary.remaining_total).toLocaleString('ar-EG')}</p>
            <p className="text-xs text-slate-500">متبقي على الحجوزات</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          {Icon.search('absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400')}
          <input
            className="w-full rounded-xl border border-slate-200 py-2.5 pr-10 pl-3 text-sm"
            placeholder="بحث بالاسم أو الموبايل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'eligible', label: 'مؤهل' },
            { key: 'ineligible', label: 'غير مؤهل' },
            { key: 'reserved', label: 'محجوز' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${filter === key ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={handleExport} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
            تصدير Excel
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> مؤهل للحضور
          </span>
          <span className="mr-4 inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> غير مؤهل
          </span>
        </div>
        <div className="max-h-[60vh] divide-y divide-slate-50 overflow-y-auto">
          {filtered.map((m) => {
            const reserved = !!m.reservation
            const border = m.eligible ? 'border-r-4 border-r-emerald-500' : 'border-r-4 border-r-red-500'
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => openMember(m)}
                className={`flex w-full items-center justify-between px-4 py-3 text-right transition-colors hover:bg-slate-50 ${border} ${reserved ? 'bg-teal-50/50' : ''}`}
              >
                <div>
                  <p className="font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500">
                    {m.phone}
                    {m.batch ? ` · ${m.batch}` : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    حضور: {m.present_count}/{m.required_count}
                  </p>
                </div>
                <div className="text-left">
                  {reserved ? (
                    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">محجوز</span>
                  ) : (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${m.eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}
                    >
                      {m.eligible ? 'مؤهل' : 'غير مؤهل'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <Modal title={selected.name} onClose={closeModal}>
          {showIneligibleAlert && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-800">غير مؤهل للرحلة</p>
              <p className="mt-1 text-xs text-red-700">
                حضوره {selected.present_count} من {selected.required_count} مطلوب
                {trip.attendance_month ? ` (شهر ${trip.attendance_month})` : ''}.
              </p>
              <button
                type="button"
                onClick={() => setExceptionConfirmed(true)}
                className="mt-3 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
              >
                استثناء — متابعة الحجز
              </button>
            </div>
          )}

          {showPaymentForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="space-y-3"
            >
              {!selected.eligible && (exceptionConfirmed || selected.reservation?.is_exception) && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">حجز باستثناء — غير مؤهل بالحضور</p>
              )}
              <div>
                <label className="mb-1 block text-xs text-slate-500">المبلغ المدفوع (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">طريقة الدفع</label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">كاش</option>
                  <option value="instapay">إنستاباي</option>
                </select>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">المتبقي (سعر الرحلة − المدفوع)</p>
                <p className="text-lg font-bold text-slate-800">{remainingCalc.toLocaleString('ar-EG')} ج.م</p>
                <p className="text-xs text-slate-400">سعر الرحلة: {tripPrice.toLocaleString('ar-EG')} ج.م</p>
              </div>
              <div className="flex gap-2 pt-1">
                {selected.reservation && (
                  <button type="button" onClick={handleCancel} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600">
                    إلغاء الحجز
                  </button>
                )}
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">
                  إغلاق
                </button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white disabled:opacity-60">
                  {saving ? '...' : 'حفظ الحجز'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  )
}
