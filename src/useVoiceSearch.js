import { useCallback, useEffect, useRef, useState } from 'react'

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const ERROR_MESSAGES = {
  'not-allowed': 'يرجى السماح باستخدام الميكروفون من إعدادات المتصفح',
  'service-not-allowed': 'البحث بالصوت غير متاح على هذا الاتصال (يتطلب HTTPS)',
  'no-speech': 'لم يتم التقاط صوت — حاول مرة أخرى',
  'audio-capture': 'تعذر الوصول للميكروفون',
  'network': 'خطأ في الشبكة أثناء التعرف على الصوت',
  aborted: 'تم إيقاف الاستماع',
}

export function useVoiceSearch({ onResult, onError, onStart, lang = 'ar-EG' } = {}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    setSupported(!!getSpeechRecognition())
  }, [])

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
    setListening(false)
  }, [])

  useEffect(() => () => stop(), [stop])

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      onError?.('المتصفح لا يدعم البحث بالصوت — جرّب Chrome أو Edge')
      return false
    }

    stop()

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setListening(true)
      onStart?.()
    }

    recognition.onend = () => setListening(false)

    recognition.onerror = (event) => {
      setListening(false)
      const message = ERROR_MESSAGES[event.error] || 'تعذر التعرف على الصوت'
      if (event.error !== 'aborted') {
        onError?.(message)
      }
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim()
      if (transcript) {
        onResult?.(transcript)
      } else {
        onError?.('لم يتم التقاط اسم — حاول مرة أخرى')
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      return true
    } catch {
      onError?.('تعذر بدء الاستماع')
      setListening(false)
      return false
    }
  }, [lang, onError, onResult, onStart, stop])

  const toggle = useCallback(() => {
    if (listening) {
      stop()
      return
    }
    start()
  }, [listening, start, stop])

  return { listening, supported, start, stop, toggle }
}
