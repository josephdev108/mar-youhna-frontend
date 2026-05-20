import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from './api'
import TripFinancePanel from './TripFinancePanel'
import TripPaymentCollectModal from './TripPaymentCollectModal'

export default function TripDayAttendance({ showToast, Modal, Icon }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [collectTarget, setCollectTarget] = useState(null)
  const [paymentBreakdown, setPaymentBreakdown] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/trips/${id}/day-attendance`, {
        params: searchDebounced ? { search: searchDebounced } : {},
      })
      setData(res)
      setPaymentBreakdown(res.payment_breakdown ?? [])
    } catch {
      setData(null)
      showToast('فشل تحميل حضور الرحلة', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, searchDebounced, showToast])

  useEffect(() => {
    load()
  }, [load])

  const trip = data?.trip?.data ?? data?.trip
  const summary = data?.summary
  const attendees = data?.attendees ?? []

  const filtered = useMemo(() => {
    if (statusFilter === 'present') return attendees.filter((a) => a.day_status === 'present')
    if (statusFilter === 'absent') return attendees.filter((a) => a.day_status === 'absent')
    if (statusFilter === 'pending') return attendees.filter((a) => !a.day_status)
    if (statusFilter === 'owes') return attendees.filter((a) => Number(a.remaining_amount) > 0)
    return attendees
  }, [attendees, statusFilter])

  const saveStatus = async (memberId, dayStatus) => {
    setSaving(true)
    try {
      const { data: res } = await api.post(`/trips/${id}/day-attendance`, {
        member_id: memberId,
        day_status: dayStatus,
      })
      showToast('تم التسجيل ✓')
      setSelected(null)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          summary: res.summary,
          attendees: prev.attendees.map((a) =>
            a.member_id === memberId ? { ...a, day_status: dayStatus } : a,
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

  if (!trip) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">الرحلة غير موجودة</p>
        <button type="button" onClick={() => navigate('/trips')} className="mt-4 font-bold text-church-800">
          رجوع
        </button>
      </div>
    )
  }

  if (summary?.reserved_count === 0) {
    return (
      <div className="space-y-4 pb-10">
        <button
          type="button"
          onClick={() => navigate(`/trips/${id}/reservations`)}
          className="flex items-center gap-2 text-sm font-bold text-church-800"
        >
          {Icon.arrowLeft('w-4 h-4')}
          رجوع للحجوزات
        </button>
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-slate-500">لا يوجد محجوزين لهذه الرحلة</p>
          <button
            type="button"
            onClick={() => navigate(`/trips/${id}/reservations`)}
            className="mt-4 rounded-xl bg-church-800 px-4 py-2 text-sm font-bold text-white"
          >
            فتح الحجوزات
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => navigate('/trips')} className="text-sm font-bold text-church-800">
          الرحلات
        </button>
        <span className="text-slate-300">/</span>
        <button type="button" onClick={() => navigate(`/trips/${id}/reservations`)} className="text-sm font-bold text-church-800">
          الحجوزات
        </button>
      </div>

      <div className="rounded-2xl bg-gradient-to-l from-church-800 to-church-900 p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">حضور يوم الرحلة</h1>
        <p className="mt-1 text-sm text-teal-100">
          {trip.name} · {trip.from_date}
        </p>
        <p className="mt-0.5 text-xs text-teal-200">المحجوزين فقط — سجّل من حضر ومن غاب</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-700">{summary.reserved_count}</p>
            <p className="text-xs text-slate-500">محجوز</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{summary.present_count}</p>
            <p className="text-xs text-slate-500">حضر</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-500">{summary.absent_count}</p>
            <p className="text-xs text-slate-500">غاب</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-400">{summary.pending_count}</p>
            <p className="text-xs text-slate-500">لم يُسجّل</p>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('owes')}
            className={`rounded-xl p-3 text-center shadow-sm col-span-2 transition ring-2 sm:col-span-1 ${
              statusFilter === 'owes' ? 'bg-amber-100 ring-amber-400' : 'bg-amber-50 ring-transparent hover:bg-amber-100'
            }`}
          >
            <p className="text-lg font-bold text-amber-700">{Number(summary.remaining_total).toLocaleString('ar-EG')}</p>
            <p className="text-xs text-amber-600">متبقي ({summary.owes_count ?? 0})</p>
            <p className="mt-0.5 text-[10px] font-bold text-amber-800">عرض المدينين</p>
          </button>
        </div>
      )}

      <TripFinancePanel
        breakdown={paymentBreakdown}
        showToast={showToast}
        onBreakdownChange={load}
      />

      <div className="relative">
        {Icon.search('absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none')}
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm shadow-sm"
          placeholder="بحث بالاسم أو الموبايل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'الكل', count: summary?.reserved_count ?? 0 },
          { key: 'present', label: 'حضر', count: summary?.present_count ?? 0 },
          { key: 'absent', label: 'غاب', count: summary?.absent_count ?? 0 },
          { key: 'pending', label: 'لم يُسجّل', count: summary?.pending_count ?? 0 },
          { key: 'owes', label: 'متبقي', count: summary?.owes_count ?? 0 },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              statusFilter === key ? 'bg-church-800 text-white' : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {statusFilter === 'owes' && filtered.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900">
          {filtered.length} محجوز عليهم مبالغ متبقية — استخدم زر التحصيل
        </p>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="max-h-[60vh] divide-y divide-slate-50 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">لا يوجد نتائج في هذا الفلتر</p>
          ) : (
            filtered.map((a) => {
              const st = a.day_status
              const border =
                st === 'present' ? 'border-r-4 border-r-emerald-500' : st === 'absent' ? 'border-r-4 border-r-red-500' : ''
              const owes = Number(a.remaining_amount) > 0
              return (
                <div
                  key={a.member_id}
                  className={`flex w-full items-center gap-2 px-4 py-3.5 text-right ${border}`}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(a)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-right hover:bg-slate-50/80"
                  >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-800">{a.name}</p>
                      {owes && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          متبقي {Number(a.remaining_amount).toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {a.phone}
                      {a.batch ? ` · ${a.batch}` : ''}
                      {Number(a.paid_amount) > 0 ? ` · دفع ${Number(a.paid_amount).toLocaleString('ar-EG')}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      st === 'present'
                        ? 'bg-emerald-100 text-emerald-700'
                        : st === 'absent'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {st === 'present' ? 'حضر ✓' : st === 'absent' ? 'غاب' : '—'}
                  </span>
                  </button>
                  {owes && (
                    <button
                      type="button"
                      onClick={() => setCollectTarget(a)}
                      className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600"
                    >
                      تحصيل
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          {Number(selected.remaining_amount) > 0 && (
            <div className="mb-4 space-y-2">
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">
                <p className="font-bold text-amber-800">مبلغ متبقي: {Number(selected.remaining_amount).toLocaleString('ar-EG')} ج.م</p>
                <p className="text-xs text-amber-700">
                  دفع {Number(selected.paid_amount).toLocaleString('ar-EG')} من أصل سعر الرحلة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectTarget(selected)}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600"
              >
                تحصيل المتبقي
              </button>
            </div>
          )}
          <p className="mb-3 text-sm text-slate-600">حضور يوم الرحلة:</p>
          <div className="space-y-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => saveStatus(selected.member_id, 'present')}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              حضر ✓
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => saveStatus(selected.member_id, 'absent')}
              className="w-full rounded-xl bg-red-100 py-3.5 text-sm font-bold text-red-700 hover:bg-red-200 disabled:opacity-60"
            >
              غاب
            </button>
          </div>
        </Modal>
      )}

      {collectTarget && (
        <TripPaymentCollectModal
          tripId={id}
          title={collectTarget.name}
          reservationId={collectTarget.reservation_id}
          remainingAmount={collectTarget.remaining_amount}
          paidAmount={collectTarget.paid_amount}
          tripPrice={trip?.price}
          Modal={Modal}
          showToast={showToast}
          onClose={() => setCollectTarget(null)}
          onSuccess={(res) => {
            const patch = res.reservation
            if (res.payment_breakdown) setPaymentBreakdown(res.payment_breakdown)
            setData((prev) => {
              if (!prev) return prev
              return {
                ...prev,
                summary: res.day_attendance_summary ?? prev.summary,
                attendees: prev.attendees.map((a) =>
                  a.member_id === patch.member_id
                    ? {
                        ...a,
                        paid_amount: patch.paid_amount,
                        remaining_amount: patch.remaining_amount,
                        payment_method: patch.payment_method,
                      }
                    : a,
                ),
              }
            })
            setSelected((prev) =>
              prev?.member_id === patch.member_id
                ? {
                    ...prev,
                    paid_amount: patch.paid_amount,
                    remaining_amount: patch.remaining_amount,
                    payment_method: patch.payment_method,
                  }
                : prev,
            )
          }}
        />
      )}
    </div>
  )
}
