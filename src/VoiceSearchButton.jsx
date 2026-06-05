import { useVoiceSearch } from './useVoiceSearch'

export default function VoiceSearchButton({ onResult, onError, onStart, className = '' }) {
  const { listening, supported, toggle } = useVoiceSearch({ onResult, onError, onStart })

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={toggle}
      title={listening ? 'جاري الاستماع... اضغط للإيقاف' : 'بحث بالصوت — اضغط وقل الاسم'}
      aria-label={listening ? 'إيقاف الاستماع' : 'بحث بالصوت'}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
        listening
          ? 'border-red-300 bg-red-50 text-red-600 animate-pulse'
          : 'border-slate-200 bg-white text-slate-500 hover:border-church-300 hover:bg-church-50 hover:text-church-800'
      } ${className}`}
    >
      {listening ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      )}
    </button>
  )
}
