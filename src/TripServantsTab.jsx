import { useCallback, useEffect, useMemo, useState } from 'react'
import api from './api'
import TripPaymentCollectModal from './TripPaymentCollectModal'
import usePaymentMethods from './usePaymentMethods'

export default function TripServantsTab({ tripId, tripPrice, showToast, Modal, Icon, onFinanceUpdate }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [collectTarget, setCollectTarget] = useState(null)
  const { methods: paymentMethods } = usePaymentMethods()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/trips/${tripId}/servant-participants`)
      setData(res)
      onFinanceUpdate?.(res)
    } catch {
      setData(null)
      showToast('فشل تحميل الخدام', 'error')
    } finally {
      setLoading(false)
    }
  }, [tripId, showToast, onFinanceUpdate])

  useEffect(() => {
    load()
  }, [load])

  const summary = data?.summary
  const servants = data?.servants ?? []
  const remainingCalc = Math.max(0, tripPrice - (Number(paidAmount) || 0))

  const filtered = useMemo(() => {
    return servants.filter((s) => {
      const q = search.trim()
      const matchesSearch =
        !q ||
        s.name.includes(q) ||
        (s.phone ?? '').includes(q) ||
        (s.email ?? '').includes(q)
      if (!matchesSearch) return false
      if (filter === 'going') return !!s.participant
      if (filter === 'owes') return !!s.participant && Number(s.participant.remaining_amount) > 0
      if (filter === 'not_going') return !s.participant
      return true
    })
  }, [servants, search, filter])

  const openServant = (s) => {
    setSelected(s)
    if (s.participant) {
      setPaidAmount(String(s.participant.paid_amount))
      setPaymentMethod(s.participant.payment_method)
    } else {
      setPaidAmount('')
      setPaymentMethod(paymentMethods[0]?.slug ?? 'cash')
    }
  }

  const applyFinance = (res) => {
    onFinanceUpdate?.(res)
    if (res.summary) {
      setData((prev) => (prev ? { ...prev, summary: res.summary ?? res.servants_summary } : prev))
    }
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const { data: res } = await api.post(`/trips/${tripId}/servant-participants`, {
        servant_id: selected.id,
        paid_amount: Number(paidAmount) || 0,
        payment_method: paymentMethod,
      })
      showToast('تم التسجيل ✓')
      setSelected(null)
      await load()
      applyFinance(res)
    } catch (err) {
      showToast(err.response?.data?.message ?? 'فشل الحفظ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!selected?.participant) return
    try {
      await api.delete(`/trips/${tripId}/servant-participants/${selected.participant.id}`)
      showToast('تم الإلغاء')
      setSelected(null)
      await load()
    } catch {
      showToast('فشل الإلغاء', 'error')
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-slate-500">جاري التحميل...</p>
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-violet-700">{summary.going_count}</p>
            <p className="text-xs text-slate-500">خدام رايحين</p>
          </div>
          <button
            type="button"
            onClick={() => setFilter('owes')}
            className={`rounded-xl p-3 text-center shadow-sm ring-2 ${
              filter === 'owes' ? 'bg-amber-100 ring-amber-400' : 'bg-white ring-transparent hover:bg-amber-50'
            }`}
          >
            <p className="text-2xl font-bold text-amber-600">{Number(summary.remaining_total).toLocaleString('ar-EG')}</p>
            <p className="text-xs text-slate-500">متبقي ({summary.owes_count ?? 0})</p>
          </button>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{Number(summary.collected_amount).toLocaleString('ar-EG')}</p>
            <p className="text-xs text-slate-500">محصّل من الخدام</p>
          </div>
          <div className="rounded-xl bg-violet-50 p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-violet-800">{tripPrice.toLocaleString('ar-EG')}</p>
            <p className="text-xs text-violet-600">سعر الرحلة / خادم</p>
          </div>
        </div>
      )}

      <div className="relative">
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
          { key: 'going', label: 'رايحين' },
          { key: 'not_going', label: 'غير مسجّل' },
          { key: 'owes', label: `متبقي (${summary?.owes_count ?? 0})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              filter === key ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === 'owes' && filtered.length > 0 && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900">
          {filtered.length} خادم عليهم مبالغ متبقية
        </p>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="max-h-[55vh] divide-y divide-slate-50 overflow-y-auto">
          {filtered.map((s) => {
            const going = !!s.participant
            const owes = going && Number(s.participant.remaining_amount) > 0
            return (
              <div key={s.id} className={`flex items-center gap-2 px-4 py-3 ${going ? 'bg-violet-50/40' : ''}`}>
                <button
                  type="button"
                  onClick={() => openServant(s)}
                  className="flex min-w-0 flex-1 items-center justify-between text-right"
                >
                  <div>
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.phone ?? s.email}</p>
                    {owes && (
                      <p className="text-xs font-bold text-amber-700">
                        متبقي {Number(s.participant.remaining_amount).toLocaleString('ar-EG')} ج.م
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      going
                        ? owes
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-violet-100 text-violet-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {going ? (owes ? 'متبقي' : 'رايح ✓') : '—'}
                  </span>
                </button>
                {owes && (
                  <button
                    type="button"
                    onClick={() => setCollectTarget(s)}
                    className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white"
                  >
                    تحصيل
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="space-y-3"
          >
            <p className="text-sm text-slate-600">
              {selected.participant ? 'تعديل مشاركة الخادم في الرحلة' : 'تسجيل الخادم رايح في الرحلة'}
            </p>
            <div>
              <label className="mb-1 block text-xs text-slate-500">المبلغ المدفوع (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">وسيلة الدفع</label>
              <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {paymentMethods.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">المتبقي</p>
              <p className="font-bold">{remainingCalc.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div className="flex gap-2">
              {selected.participant && (
                <button type="button" onClick={handleRemove} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600">
                  إلغاء المشاركة
                </button>
              )}
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-sm">
                {saving ? '...' : selected.participant ? 'حفظ' : 'تسجيل رايح'}
              </button>
            </div>
            {selected.participant && Number(selected.participant.remaining_amount) > 0 && (
              <button
                type="button"
                onClick={() => setCollectTarget(selected)}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white"
              >
                تحصيل المتبقي
              </button>
            )}
          </form>
        </Modal>
      )}

      {collectTarget?.participant && (
        <TripPaymentCollectModal
          tripId={tripId}
          title={collectTarget.name}
          entityId={collectTarget.participant.id}
          collectPath={`/trips/${tripId}/servant-participants/${collectTarget.participant.id}/collect`}
          remainingAmount={collectTarget.participant.remaining_amount}
          paidAmount={collectTarget.participant.paid_amount}
          tripPrice={tripPrice}
          Modal={Modal}
          showToast={showToast}
          onClose={() => setCollectTarget(null)}
          onSuccess={(res) => {
            applyFinance(res)
            load()
          }}
        />
      )}
    </div>
  )
}
