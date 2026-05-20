import { useState } from 'react'
import TripPaymentChart from './TripPaymentChart'
import usePaymentMethods from './usePaymentMethods'

export default function TripFinancePanel({ breakdown, showToast, onBreakdownChange }) {
  const { methods, addMethod } = usePaymentMethods()
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAddMethod = async (e) => {
    e.preventDefault()
    if (!newLabel.trim()) return
    setAdding(true)
    try {
      await addMethod(newLabel)
      setNewLabel('')
      showToast('تمت إضافة وسيلة الدفع ✓')
      onBreakdownChange?.()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'فشل الإضافة', 'error')
    } finally {
      setAdding(false)
    }
  }

  const totalPaid = (breakdown ?? []).reduce((s, r) => s + Number(r.total), 0)

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-church-900">توزيع المدفوعات حسب وسيلة الدفع</h2>
        {totalPaid > 0 && (
          <span className="text-xs font-bold text-emerald-700">
            إجمالي {totalPaid.toLocaleString('ar-EG')} ج.م
          </span>
        )}
      </div>

      <TripPaymentChart breakdown={breakdown} />

      <div className="mt-4 border-t border-stone-100 pt-4">
        <p className="mb-2 text-xs font-bold text-slate-500">إضافة وسيلة دفع جديدة</p>
        <form onSubmit={handleAddMethod} className="flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="مثال: فودافون كاش"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <button
            type="submit"
            disabled={adding || !newLabel.trim()}
            className="shrink-0 rounded-xl bg-church-800 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          >
            {adding ? '...' : '+ إضافة'}
          </button>
        </form>
        {methods.length > 0 && (
          <p className="mt-2 text-[10px] text-slate-400">
            المتاح: {methods.map((m) => m.label).join(' · ')}
          </p>
        )}
      </div>
    </section>
  )
}
