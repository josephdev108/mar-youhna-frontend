import { useEffect, useState } from 'react'
import api from './api'
import usePaymentMethods from './usePaymentMethods'

export default function TripPaymentCollectModal({
  tripId,
  title,
  entityId,
  collectPath,
  remainingAmount,
  paidAmount,
  tripPrice,
  onClose,
  onSuccess,
  showToast,
  Modal,
}) {
  const { methods } = usePaymentMethods()
  const remaining = Number(remainingAmount) || 0
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [saving, setSaving] = useState(false)

  const path =
    collectPath ??
    (entityId ? `/trips/${tripId}/reservations/${entityId}/collect` : null)

  useEffect(() => {
    setAmount(remaining > 0 ? String(remaining) : '')
    setPaymentMethod(methods[0]?.slug ?? 'cash')
  }, [remaining, entityId, methods])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      showToast('أدخل مبلغ التحصيل', 'error')
      return
    }
    if (amt > remaining) {
      showToast(`المبلغ لا يمكن أن يتجاوز المتبقي (${remaining.toLocaleString('ar-EG')} ج.م)`, 'error')
      return
    }
    if (!path) return

    setSaving(true)
    try {
      const { data } = await api.post(path, {
        amount: amt,
        payment_method: paymentMethod,
      })
      showToast(data.message ?? 'تم التحصيل ✓')
      onSuccess(data)
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'فشل التحصيل', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={`تحصيل — ${title}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">
          <p className="font-bold text-amber-900">المتبقي: {remaining.toLocaleString('ar-EG')} ج.م</p>
          <p className="mt-1 text-xs text-amber-800">
            مدفوع سابقاً: {Number(paidAmount).toLocaleString('ar-EG')} ج.م
            {tripPrice != null && ` · سعر الرحلة: ${Number(tripPrice).toLocaleString('ar-EG')} ج.م`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAmount(String(remaining))}
          className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
        >
          تحصيل كامل المتبقي
        </button>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">مبلغ التحصيل (ج.م) *</label>
          <input
            type="number"
            min="0.01"
            max={remaining}
            step="0.01"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">وسيلة الدفع *</label>
          <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
            {methods.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-3 text-sm font-bold text-slate-600">
            إلغاء
          </button>
          <button type="submit" disabled={saving || remaining <= 0} className="btn-primary flex-1 py-3 text-sm disabled:opacity-50">
            {saving ? 'جاري التحصيل...' : 'تأكيد التحصيل'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
