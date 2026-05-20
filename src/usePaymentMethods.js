import { useCallback, useEffect, useState } from 'react'
import api from './api'

export default function usePaymentMethods() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/payment-methods')
      setMethods(data.data ?? [])
    } catch {
      setMethods([
        { slug: 'cash', label: 'كاش' },
        { slug: 'instapay', label: 'إنستاباي' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addMethod = async (label) => {
    const { data } = await api.post('/payment-methods', { label: label.trim() })
    await load()
    return data.data
  }

  const labelFor = (slug) => methods.find((m) => m.slug === slug)?.label ?? slug

  return { methods, loading, load, addMethod, labelFor }
}
