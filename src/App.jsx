import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from './api'
import TripReservations from './TripReservations'
import TripDayAttendance from './TripDayAttendance'
import VisitationSessions from './VisitationSessions'
import VisitationSessionDetail from './VisitationSessionDetail'
import Dashboard from './Dashboard'
import BrandLogo from './BrandLogo'
import { useBranding } from './BrandingContext'
import Settings from './Settings'
import Programs from './Programs'
import ProgramDetail from './ProgramDetail'
import ProgramView from './ProgramView'

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icon = {
  users: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  book: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  clipboard: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  logout: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  plus: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  search: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  check: (cls) => (
    <svg className={cls} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  calendar: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  x: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  shield: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  pencil: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  trash: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  download: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  arrowLeft: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  eye: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  trip: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  home: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  chart: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  program: (cls) => (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white p-5 shadow-2xl ${wide ? 'sm:max-w-lg' : 'sm:max-w-md'}`}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {Icon.x('w-4 h-4')}
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-church-700',
  }

  return (
    <div className={`fixed top-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium text-white shadow-xl ${styles[type] ?? styles.info}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        {Icon.x('w-4 h-4')}
      </button>
    </div>
  )
}

// ─── Navigation config ────────────────────────────────────────────────────────
const NAV = [
  { key: 'dashboard',  label: 'لوحة التحكم', icon: 'chart',     path: '/dashboard', adminOnly: false },
  { key: 'members',    label: 'المخدومين',  icon: 'users',     path: '/members', adminOnly: false },
  { key: 'birthdays',  label: 'أعياد الميلاد', icon: 'calendar', path: '/birthdays', adminOnly: false },
  { key: 'servants',   label: 'الخدام',     icon: 'users',     path: '/servants', adminOnly: true },
  { key: 'programs',   label: 'البرامج',   icon: 'program',   path: '/programs', adminOnly: false },
  { key: 'lectures',   label: 'المحاضرات', icon: 'book',      path: '/lectures', adminOnly: false },
  { key: 'attendance', label: 'الحضور',    icon: 'clipboard', path: '/attendance', adminOnly: false },
  { key: 'trips',      label: 'الرحلات',   icon: 'trip',      path: '/trips', adminOnly: false },
  { key: 'visitations', label: 'الافتقاد', icon: 'home',      path: '/visitations', adminOnly: false },
  { key: 'settings',    label: 'الإعدادات', icon: 'settings', path: '/settings', adminOnly: true },
]

function currentMonthPeriod() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n) => String(n).padStart(2, '0')
  const lastDay = new Date(y, m + 1, 0).getDate()
  return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(lastDay)}` }
}

function formatBirthdayDay(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })
}

function turningAge(birthDate) {
  if (!birthDate) return null
  const b = new Date(birthDate)
  return new Date().getFullYear() - b.getFullYear()
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]     = useState(localStorage.getItem('token'))
  const [user, setUser]       = useState(null)
  const [members, setMembers] = useState([])
  const [lectures, setLectures] = useState([])
  const [trips, setTrips]       = useState([])
  const [servants, setServants] = useState([])
  const [toast, setToast]       = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isAdmin = user?.type === 'administrator'
  const { branding } = useBranding()
  const navItems = NAV.filter((item) => !item.adminOnly || isAdmin)
  const navigate   = useNavigate()
  const location   = useLocation()

  useEffect(() => {
    document.documentElement.dir  = 'rtl'
    document.documentElement.lang = 'ar'
  }, [])

  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  const loadMembers  = useCallback(async (params = {}) => {
    const query = new URLSearchParams({ per_page: 100, ...params }).toString()
    setMembers((await api.get(`/members?${query}`)).data.data)
  }, [])
  const loadLectures = useCallback(async () => setLectures((await api.get('/lectures?per_page=100')).data.data), [])
  const loadTrips    = useCallback(async () => setTrips((await api.get('/trips?per_page=100')).data.data), [])
  const loadServants = useCallback(async () => setServants((await api.get('/servants?per_page=100')).data.data ?? []), [])
  const loadProfile  = useCallback(async () => {
    const profile = (await api.get('/user')).data
    const u = profile.data ?? profile
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }, [])

  useEffect(() => {
    if (!token) return
    loadProfile().then(() => {
      Promise.all([loadMembers(), loadLectures(), loadTrips()])
    })
  }, [token])

  useEffect(() => {
    if (isAdmin) loadServants()
  }, [isAdmin, loadServants])

  const goToAttendance = useCallback((lectureId) => {
    navigate(`/attendance?lecture=${lectureId}`)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (!token) return <Login onLoggedIn={setToken} />

  const avgAttendance = members.length
    ? Math.round(members.reduce((s, m) => s + (m.present_count ?? 0), 0) / members.length)
    : '—'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar-shell hidden md:flex h-full w-60 shrink-0 flex-col">
        {/* Brand */}
        <div className="border-b border-gold-500/20 p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <BrandLogo className="h-16 w-16 drop-shadow-md" />
            <div>
              <h1 className="text-xs font-bold leading-snug text-white">{branding.app_name}</h1>
              {branding.app_subtitle && (
                <p className="mt-0.5 text-[10px] text-gold-200">{branding.app_subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2.5 border-b border-gold-500/20 p-4">
          <SidebarStat icon="users"     label="إجمالي المخدومين"  value={members.length} />
          <SidebarStat icon="book"      label="إجمالي المحاضرات" value={lectures.length} />
          <SidebarStat icon="clipboard" label="متوسط الحضور"      value={avgAttendance} />
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  ? 'nav-active'
                  : 'nav-inactive'
              }`}
            >
              {Icon[item.icon]('w-5 h-5 shrink-0')}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gold-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            {Icon.logout('w-5 h-5 shrink-0')}
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {/* ── Mobile header ── */}
        <header className="sidebar-shell sticky top-0 z-20 shadow-lg md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Brand */}
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandLogo className="h-9 w-9 shrink-0 rounded-lg bg-white/90 p-0.5" />
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold leading-tight text-white">{branding.app_name}</h1>
                <p className="text-[10px] font-medium text-gold-200">
                  {navItems.find((n) => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.label ?? 'لوحة التحكم'}
                </p>
              </div>
            </div>
            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/30"
              aria-label="القائمة"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* ── Mobile drawer ── */}
        <div className={`md:hidden fixed inset-0 z-50 ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Panel slides in from right (RTL start) */}
          <div className={`sidebar-shell absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col shadow-2xl transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-gold-500/20 p-5">
              <div className="flex items-center gap-3">
                <BrandLogo className="h-11 w-11 rounded-lg bg-white/90 p-0.5" />
                <div>
                  <p className="text-sm font-bold leading-tight text-white">{branding.app_name}</p>
                  {branding.app_subtitle && (
                    <p className="text-[10px] text-gold-200">{branding.app_subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {Icon.x('w-5 h-5')}
              </button>
            </div>

            {/* Stats */}
            <div className="space-y-2.5 border-b border-white/10 p-4">
              <SidebarStat icon="users"     label="إجمالي المخدومين"  value={members.length} />
              <SidebarStat icon="book"      label="إجمالي المحاضرات" value={lectures.length} />
              <SidebarStat icon="clipboard" label="متوسط الحضور"      value={avgAttendance} />
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {navItems.map((item) => {
                const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      active
                        ? 'nav-active'
                        : 'nav-inactive'
                    }`}
                  >
                    {Icon[item.icon]('w-5 h-5 shrink-0')}
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gold-100 transition-colors hover:bg-white/10 hover:text-white"
              >
                {Icon.logout('w-5 h-5 shrink-0')}
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className={`mx-auto ${location.pathname === '/dashboard' || location.pathname.startsWith('/programs') ? 'max-w-6xl' : 'max-w-4xl'}`}>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard isAdmin={isAdmin} />} />
              <Route path="/members"    element={<Members    members={members}   reload={loadMembers}  showToast={showToast} />} />
              <Route path="/members/:id" element={<MemberProfile showToast={showToast} />} />
              <Route path="/birthdays"  element={<Birthdays showToast={showToast} />} />
              <Route path="/programs" element={<Programs showToast={showToast} Icon={Icon} />} />
              <Route path="/programs/new" element={<ProgramDetail showToast={showToast} Icon={Icon} />} />
              <Route path="/programs/:id/edit" element={<ProgramDetail showToast={showToast} Icon={Icon} />} />
              <Route path="/programs/:id" element={<ProgramView showToast={showToast} Icon={Icon} />} />
              <Route path="/lectures"   element={<Lectures   user={user} lectures={lectures} reload={loadLectures} showToast={showToast} onGoToAttendance={goToAttendance} />} />
              <Route path="/attendance" element={<Attendance members={members} reloadMembers={loadMembers} lectures={lectures} showToast={showToast} />} />
              <Route path="/trips"      element={<Trips trips={trips} reload={loadTrips} showToast={showToast} />} />
              <Route path="/trips/:id/reservations" element={<TripReservations showToast={showToast} Modal={Modal} Icon={Icon} />} />
              <Route path="/trips/:id/day-attendance" element={<TripDayAttendance showToast={showToast} Modal={Modal} Icon={Icon} />} />
              <Route path="/visitations" element={<VisitationSessions showToast={showToast} Modal={Modal} Icon={Icon} />} />
              <Route path="/visitations/:id" element={<VisitationSessionDetail showToast={showToast} Modal={Modal} Icon={Icon} />} />
              <Route path="/servants"   element={<Servants servants={servants} reload={loadServants} showToast={showToast} />} />
              <Route path="/settings"   element={<Settings showToast={showToast} />} />
              <Route path="*"           element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Sidebar Stat ─────────────────────────────────────────────────────────────
function SidebarStat({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 min-w-0">
        {Icon[icon]('w-3.5 h-3.5 shrink-0 text-gold-400')}
        <span className="truncate text-xs text-gold-100">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  const palette = {
    blue:    'bg-church-50 text-church-800',
    indigo:  'bg-church-50 text-church-800',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  return (
    <div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${palette[color]}`}>
        {Icon[icon]('w-4 h-4 sm:w-5 sm:h-5')}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] leading-tight text-slate-400 sm:text-xs">{label}</p>
        <p className="text-xl font-bold leading-tight text-slate-800 sm:text-2xl">{value}</p>
      </div>
    </div>
  )
}

// ─── Members ──────────────────────────────────────────────────────────────────
const MEMBERS_PAGE_SIZE = 15

function Members({ members, reload, showToast }) {
  const navigate = useNavigate()
  const emptyForm = { name: '', phone: '', address: '', church: '', confession_father: '', birth_date: '', batch: '' }
  const [form, setForm]             = useState(emptyForm)
  const setField                    = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [editingMember, setEditingMember]   = useState(null)
  const [deletingMemberId, setDeletingMemberId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [batchFilter, setBatchFilter]       = useState('')
  const [absenceFilter, setAbsenceFilter]   = useState('')
  const [birthDateFrom, setBirthDateFrom]   = useState('')
  const [birthDateTo, setBirthDateTo]       = useState('')
  const [page, setPage]             = useState(1)

  // Excel import state
  const [importFile, setImportFile] = useState(null)
  const [headers, setHeaders]       = useState([])
  const [mapping, setMapping]       = useState({ name: '', phone: '', batch: '', church: '', address: '', confession_father: '', birth_date: '' })
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchSearch   = !search || m.name.includes(search) || (m.phone ?? '').includes(search)
      const matchBatch    = !batchFilter || (m.batch ?? '').includes(batchFilter)
      const matchAbsence  = !absenceFilter || (m.absence_count ?? 0) >= Number(absenceFilter)
      const bd            = m.birth_date ?? ''
      const matchBdFrom   = !birthDateFrom || bd >= birthDateFrom
      const matchBdTo     = !birthDateTo   || bd <= birthDateTo
      return matchSearch && matchBatch && matchAbsence && matchBdFrom && matchBdTo
    })
  }, [members, search, batchFilter, absenceFilter, birthDateFrom, birthDateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / MEMBERS_PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * MEMBERS_PAGE_SIZE, safePage * MEMBERS_PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, batchFilter, absenceFilter, birthDateFrom, birthDateTo])

  const hasFilters = !!(batchFilter || absenceFilter || birthDateFrom || birthDateTo)

  const exportCSV = () => {
    const cols = ['الاسم', 'الموبايل', 'الدفعة', 'الكنيسة', 'أب الاعتراف', 'العنوان', 'تاريخ الميلاد', 'حضر', 'غاب']
    const rows = filtered.map((m) => [
      m.name,
      m.phone ?? '',
      m.batch ?? '',
      m.church ?? '',
      m.confession_father ?? '',
      m.address ?? '',
      m.birth_date ?? '',
      m.present_count ?? 0,
      m.absence_count ?? 0,
    ])
    const csv = [cols, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const bom  = '﻿' // UTF-8 BOM so Excel reads Arabic correctly
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `members-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openAdd  = () => { setForm(emptyForm); setEditingMember(null); setShowModal(true) }
  const openEdit = (m) => {
    setForm({
      name:              m.name ?? '',
      phone:             m.phone ?? '',
      address:           m.address ?? '',
      church:            m.church ?? '',
      confession_father: m.confession_father ?? '',
      birth_date:        m.birth_date ?? '',
      batch:             m.batch ?? '',
    })
    setEditingMember(m)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, payload)
        showToast('تم تعديل بيانات المخدوم ✓')
      } else {
        await api.post('/members', payload)
        showToast('تم إضافة المخدوم بنجاح ✓')
      }
      setShowModal(false)
      setEditingMember(null)
      await reload()
    } catch {
      showToast('حدث خطأ، تأكد من البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMemberId) return
    try {
      await api.delete(`/members/${deletingMemberId}`)
      setDeletingMemberId(null)
      await reload()
      showToast('تم حذف المخدوم')
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  const downloadTemplate = () => {
    const rows = [
      // Headers — name & phone required, rest optional
      ['الاسم', 'الموبايل', 'الدفعة', 'الكنيسة', 'العنوان', 'أب الاعتراف', 'تاريخ الميلاد'],
      // Row with all fields filled
      ['يوسف سمير', '01012345678', '2024', 'كنيسة مارجرجس', 'مصر الجديدة', 'القس بولس', '2000-05-14'],
      // Row with only required fields — shows optionals can be empty
      ['مريم إبراهيم', '01198765432', '', '', '', '', ''],
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'members-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const previewImport = async () => {
    if (!importFile) return
    const fd = new FormData()
    fd.append('file', importFile)
    const { data } = await api.post('/import/members/preview', fd)
    setHeaders(data.headers ?? [])
  }

  const submitImport = async () => {
    if (!importFile) return
    const fd = new FormData()
    fd.append('file', importFile)
    fd.append('mapping[name]', mapping.name)
    fd.append('mapping[phone]', mapping.phone)
    const optionals = ['batch', 'church', 'address', 'confession_father', 'birth_date']
    optionals.forEach((k) => { if (mapping[k]) fd.append(`mapping[${k}]`, mapping[k]) })
    const { data } = await api.post('/import/members', fd)
    showToast(`تم الاستيراد: ${data.imported} — تم التخطي: ${data.skipped}`)
    await reload()
  }

  return (
    <div className="space-y-4 pb-10">
      {/* Add Member Modal */}
      {/* Delete confirmation modal */}
      {deletingMemberId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeletingMemberId(null)}>
          <p className="mb-5 text-sm text-slate-600">هل أنت متأكد من حذف هذا المخدوم؟ سيتم حذف جميع سجلات الحضور المرتبطة به. لا يمكن التراجع.</p>
          <div className="flex gap-2">
            <button onClick={() => setDeletingMemberId(null)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">إلغاء</button>
            <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700">حذف</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal
          title={editingMember ? 'تعديل بيانات المخدوم' : 'إضافة مخدوم جديد'}
          onClose={() => { setShowModal(false); setEditingMember(null) }}
        >
          <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pl-1">
            {/* Required */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="اسم المخدوم"
                  value={form.name}
                  onChange={setField('name')}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  رقم الموبايل <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="01xxxxxxxxx"
                  value={form.phone}
                  onChange={setField('phone')}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">الدفعة</label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="مثال: 2024"
                  value={form.batch}
                  onChange={setField('batch')}
                />
              </div>
            </div>
            {/* Divider */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 pt-1">بيانات إضافية (اختياري)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-500">العنوان</label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="العنوان بالتفصيل"
                  value={form.address}
                  onChange={setField('address')}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">الكنيسة</label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="اسم الكنيسة"
                  value={form.church}
                  onChange={setField('church')}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">أب الاعتراف</label>
                <input
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  placeholder="اسم الأب"
                  value={form.confession_father}
                  onChange={setField('confession_father')}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">تاريخ الميلاد</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                  value={form.birth_date}
                  onChange={setField('birth_date')}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingMember(null) }}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-church-800 py-3 text-sm font-bold text-white transition-colors hover:bg-church-900 disabled:opacity-60"
              >
                {loading ? '...' : editingMember ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {Icon.search('w-4 h-4 text-slate-400')}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-4 text-sm shadow-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              placeholder="بحث بالاسم أو الموبايل..."
            />
          </div>
          <button
            onClick={openAdd}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-church-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-church-900"
          >
            {Icon.plus('w-4 h-4')}
            <span>جديد</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${
              hasFilters
                ? 'border-gold-400 bg-church-50 text-church-800'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>فلاتر</span>
            {hasFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-church-800 text-[10px] font-bold text-white">
                {[batchFilter, absenceFilter, birthDateFrom, birthDateTo].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowImport((v) => !v)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>استيراد Excel</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">فلترة النتائج</span>
            {hasFilters && (
              <button
                onClick={() => { setBatchFilter(''); setAbsenceFilter(''); setBirthDateFrom(''); setBirthDateTo('') }}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                مسح الكل
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">الدفعة</label>
              <input
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                placeholder="اسم أو رقم الدفعة"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">غياب أكبر من أو يساوي</label>
              <input
                type="number"
                min="0"
                value={absenceFilter}
                onChange={(e) => setAbsenceFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                placeholder="عدد الغيابات"
              />
            </div>
          </div>

          {/* Birthdate range */}
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium text-slate-500">نطاق تاريخ الميلاد</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">من تاريخ</label>
                <input
                  type="date"
                  value={birthDateFrom}
                  onChange={(e) => setBirthDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">إلى تاريخ</label>
                <input
                  type="date"
                  value={birthDateTo}
                  onChange={(e) => setBirthDateTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Panel */}
      {showImport && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">استيراد من ملف Excel</p>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              {Icon.download('w-3.5 h-3.5')}
              تحميل نموذج Excel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setHeaders([]) }}
                className="flex-1 rounded-xl border border-slate-200 p-2.5 text-sm text-slate-600 file:ml-2 file:rounded-lg file:border-0 file:bg-church-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-church-800"
              />
              <button
                onClick={previewImport}
                disabled={!importFile}
                className="shrink-0 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                قراءة الأعمدة
              </button>
            </div>
            {headers.length > 0 && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">عمود الاسم <span className="text-red-500">*</span></label>
                  <select value={mapping.name} onChange={(e) => setMapping((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm">
                    <option value="">اختار العمود</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">عمود الموبايل <span className="text-slate-400 text-xs">(اختياري)</span></label>
                  <select value={mapping.phone} onChange={(e) => setMapping((p) => ({ ...p, phone: e.target.value }))} className="w-full rounded-xl border border-slate-200 p-2.5 text-sm">
                    <option value="">اختار العمود</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                {[
                  { key: 'batch',             label: 'الدفعة' },
                  { key: 'church',            label: 'الكنيسة' },
                  { key: 'address',           label: 'العنوان' },
                  { key: 'confession_father', label: 'أب الاعتراف' },
                  { key: 'birth_date',        label: 'تاريخ الميلاد' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      عمود {label} <span className="text-slate-400 text-xs">(اختياري)</span>
                    </label>
                    <select
                      value={mapping[key]}
                      onChange={(e) => setMapping((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
                    >
                      <option value="">— لا يوجد —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <button
                    onClick={submitImport}
                    disabled={!mapping.name || !mapping.phone}
                    className="w-full rounded-xl bg-emerald-600 p-2.5 text-sm font-bold text-white disabled:opacity-40"
                  >
                    استيراد الآن
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h2 className="font-bold text-slate-700">
            قائمة المخدومين
            <span className="mr-2 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-church-800">
              {filtered.length}
            </span>
          </h2>
          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <span className="text-xs text-slate-400">صفحة {safePage} من {totalPages}</span>
            )}
            {filtered.length > 0 && (
              <button
                onClick={exportCSV}
                title="تصدير النتائج المعروضة"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                {Icon.download('w-3.5 h-3.5')}
                <span>تصدير CSV</span>
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-2 text-5xl">👥</div>
            <p className="text-sm">{search || hasFilters ? 'لا توجد نتائج مطابقة' : 'لا يوجد مخدومين'}</p>
          </div>
        ) : (
          <>
            {/* ── Mobile: card list ── */}
            <div className="sm:hidden divide-y divide-slate-100">
              {paginated.map((m) => {
                const total     = (m.present_count ?? 0) + (m.absence_count ?? 0)
                const rate      = total > 0 ? Math.round(((m.present_count ?? 0) / total) * 100) : 0
                const rateColor = rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'
                return (
                  <div key={m.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-sm font-bold text-church-800">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <button type="button" onClick={() => navigate(`/members/${m.id}`)} className="truncate text-right font-medium text-slate-800 hover:text-church-800">{m.name}</button>
                        <p className="font-mono text-xs text-slate-400">{m.phone ?? '—'}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => navigate(`/members/${m.id}`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-church-50 active:text-church-800">
                          {Icon.eye('w-4 h-4')}
                        </button>
                        <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-amber-50 active:text-amber-600">
                          {Icon.pencil('w-4 h-4')}
                        </button>
                        <button onClick={() => setDeletingMemberId(m.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 active:bg-red-50 active:text-red-600">
                          {Icon.trash('w-4 h-4')}
                        </button>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">حضر: {m.present_count ?? 0}</span>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">غاب: {m.absence_count ?? 0}</span>
                      <div className="flex flex-1 items-center gap-1.5">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full rounded-full ${rateColor}`} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{rate}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop: table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-right font-medium">المخدوم</th>
                    <th className="px-5 py-3 text-right font-medium">الموبايل</th>
                    <th className="px-5 py-3 text-center font-medium">حضر</th>
                    <th className="px-5 py-3 text-center font-medium">غاب</th>
                    <th className="px-5 py-3 text-center font-medium">نسبة الحضور</th>
                    <th className="px-3 py-3 text-center font-medium">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.map((m) => {
                    const total     = (m.present_count ?? 0) + (m.absence_count ?? 0)
                    const rate      = total > 0 ? Math.round(((m.present_count ?? 0) / total) * 100) : 0
                    const rateColor = rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'
                    return (
                      <tr key={m.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-sm font-bold text-church-800">
                              {m.name.charAt(0)}
                            </div>
                            <button type="button" onClick={() => navigate(`/members/${m.id}`)} className="font-medium text-slate-800 hover:text-church-800">{m.name}</button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-sm text-slate-500">{m.phone ?? '—'}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">{m.present_count ?? 0}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">{m.absence_count ?? 0}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                              <div className={`h-full rounded-full ${rateColor}`} style={{ width: `${rate}%` }} />
                            </div>
                            <span className="w-8 text-right text-xs font-medium text-slate-600">{rate}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => navigate(`/members/${m.id}`)} title="الملف الشخصي" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-church-50 hover:text-church-800">{Icon.eye('w-3.5 h-3.5')}</button>
                            <button onClick={() => openEdit(m)} title="تعديل" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600">{Icon.pencil('w-3.5 h-3.5')}</button>
                            <button onClick={() => setDeletingMemberId(m.id)} title="حذف" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">{Icon.trash('w-3.5 h-3.5')}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                {/* Mobile: simple */}
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:hidden">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors active:bg-slate-100 disabled:opacity-40">السابق</button>
                  <span className="text-sm text-slate-500">{safePage} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors active:bg-slate-100 disabled:opacity-40">التالي</button>
                </div>
                {/* Desktop: full */}
                <div className="hidden sm:flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">السابق</button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = []
                      const delta = 2
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) pages.push(i)
                        else if (pages[pages.length - 1] !== '…') pages.push('…')
                      }
                      return pages.map((p, idx) =>
                        p === '…' ? <span key={`e${idx}`} className="px-1 text-sm text-slate-400">…</span>
                          : <button key={p} onClick={() => setPage(p)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${safePage === p ? 'bg-church-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                      )
                    })()}
                  </div>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">التالي</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Member Profile ───────────────────────────────────────────────────────────
function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const query = month ? `?month=${month}` : ''
      const { data } = await api.get(`/members/${id}/profile${query}`)
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [id, month])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  if (loading) {
    return <div className="py-20 text-center text-slate-500">جاري التحميل...</div>
  }

  if (!profile?.member) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">المخدوم غير موجود</p>
        <button onClick={() => navigate('/members')} className="mt-4 font-bold text-church-800">رجوع للقائمة</button>
      </div>
    )
  }

  const member = profile.member.data ?? profile.member
  const summary = profile.summary
  const records = profile.attendance_records?.data ?? profile.attendance_records ?? []
  const visitations = profile.visitations ?? []

  const detailRows = [
    { label: 'الموبايل', value: member.phone },
    { label: 'العنوان', value: member.address },
    { label: 'الكنيسة', value: member.church },
    { label: 'أب الاعتراف', value: member.confession_father },
    { label: 'تاريخ الميلاد', value: member.birth_date },
    { label: 'الدفعة', value: member.batch },
  ].filter((r) => r.value)

  return (
    <div className="space-y-4 pb-10">
      <button
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-sm font-bold text-church-800 hover:text-church-900"
      >
        {Icon.arrowLeft('w-4 h-4')}
        رجوع للمخدومين
      </button>

      <div className="rounded-2xl bg-gradient-to-l from-church-800 to-church-900 p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
            {member.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{member.name}</h1>
            <p className="mt-1 font-mono text-sm text-gold-100">{member.phone}</p>
            {member.batch && <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs">دفعة {member.batch}</span>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-800">البيانات الشخصية</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {detailRows.map((row) => (
            <div key={row.label} className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-400">{row.label}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{row.value}</p>
            </div>
          ))}
        </div>
        {member.relatives?.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="mb-3 text-sm font-bold text-slate-700">الأقارب</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {member.relatives.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-800">{r.name}</span>
                  <span className="text-slate-500">{r.relation} · {r.phone ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-bold text-slate-800">سجل الحضور</h2>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs text-slate-500">فلتر بالشهر</label>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            {month && (
              <button onClick={() => setMonth('')} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">عرض الكل</button>
            )}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-church-50 p-3 text-center">
            <p className="text-2xl font-bold text-church-800">{summary.total_lectures}</p>
            <p className="text-xs text-church-800">{month ? 'محاضرات الشهر' : 'إجمالي المحاضرات'}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{summary.present_count}</p>
            <p className="text-xs text-emerald-700">حضر</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{summary.absent_count}</p>
            <p className="text-xs text-red-600">غاب</p>
          </div>
        </div>

        {summary.total_lectures > 0 && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>نسبة الحضور</span>
              <span>{summary.attendance_rate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${summary.attendance_rate}%` }} />
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">{month ? 'مفيش محاضرات في الشهر ده' : 'مفيش سجل حضور لسه'}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="font-medium text-slate-800">{r.lecture_title}</p>
                  <p className="text-xs text-slate-500">{r.lecture_date}{r.servant_name ? ` · ${r.servant_name}` : ''}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {r.status === 'present' ? 'حاضر ✓' : 'غائب'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!month && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
          إجمالي الحضور الكلي: {member.present_count ?? 0} حضر · {member.absence_count ?? 0} غاب
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-800">سجل الافتقاد</h2>
        {visitations.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">لا يوجد افتقاد مسجّل</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visitations.map((v) => (
              <div key={v.id} className="flex items-start justify-between gap-2 py-3.5">
                <div>
                  <p className="font-medium text-slate-800">{v.session_day}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {(v.servants ?? []).map((s) => s.name).join(' · ') || '—'}
                  </p>
                  {v.notes && <p className="mt-1 text-xs text-slate-600">{v.notes}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    v.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {v.status === 'done' ? 'تمت الزيارة' : 'غير موجود'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Lectures ─────────────────────────────────────────────────────────────────
function Lectures({ user, lectures, reload, showToast, onGoToAttendance }) {
  const [showAddModal, setShowAddModal]   = useState(false)
  const [editingLecture, setEditingLecture] = useState(null) // {id, title, date}
  const [deletingId, setDeletingId]       = useState(null)
  const [title, setTitle]                 = useState('')
  const [date, setDate]                   = useState('')
  const [servantId, setServantId]         = useState('')
  const [servants, setServants]           = useState([])
  const [loading, setLoading]             = useState(false)

  useEffect(() => {
    if (user?.type === 'servant') {
      setServantId(String(user.id))
      return
    }
    api.get('/servants?per_page=100').then((res) => {
      const list = res.data.data ?? res.data ?? []
      setServants(list)
      if (list.length) setServantId(String(list[0].id))
    }).catch(() => {})
  }, [user])

  const openAdd = () => { setTitle(''); setDate(''); setShowAddModal(true) }
  const openEdit = (l) => { setTitle(l.title); setDate(l.date); setEditingLecture(l) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingLecture) {
        await api.put(`/lectures/${editingLecture.id}`, { title, date, servant_id: Number(servantId) })
        setEditingLecture(null)
        showToast('تم تعديل المحاضرة ✓')
      } else {
        await api.post('/lectures', { title, date, servant_id: Number(servantId) })
        setShowAddModal(false)
        showToast('تم إنشاء المحاضرة بنجاح ✓')
      }
      await reload()
    } catch {
      showToast('حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/lectures/${id}`)
      setDeletingId(null)
      await reload()
      showToast('تم حذف المحاضرة')
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  const isModalOpen = showAddModal || !!editingLecture

  return (
    <div className="space-y-4 pb-10">
      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          title={editingLecture ? 'تعديل المحاضرة' : 'محاضرة جديدة'}
          onClose={() => { setShowAddModal(false); setEditingLecture(null) }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">عنوان المحاضرة <span className="text-red-500">*</span></label>
              <input
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                placeholder="عنوان المحاضرة"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">التاريخ <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            {servants.length > 0 && user?.type !== 'servant' && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">الخادم</label>
                <select
                  value={servantId}
                  onChange={(e) => setServantId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
                >
                  {servants.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingLecture(null) }}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-church-800 py-3 text-sm font-bold text-white transition-colors hover:bg-church-900 disabled:opacity-60"
              >
                {loading ? '...' : editingLecture ? 'حفظ التعديل' : 'إنشاء'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeletingId(null)}>
          <p className="mb-5 text-sm text-slate-600">هل أنت متأكد من حذف هذه المحاضرة؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeletingId(null)}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              onClick={() => handleDelete(deletingId)}
              className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              حذف
            </button>
          </div>
        </Modal>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-church-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-church-900"
        >
          {Icon.plus('w-4 h-4')}
          <span>محاضرة جديدة</span>
        </button>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-700">
            قائمة المحاضرات
            <span className="mr-2 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-church-800">
              {lectures.length}
            </span>
          </h2>
        </div>

        {lectures.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-2 text-5xl">📚</div>
            <p className="text-sm">لا توجد محاضرات</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {lectures.map((l) => (
              <div key={l.id} className="flex items-center gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50">
                {/* Clickable main area → attendance */}
                <button
                  onClick={() => onGoToAttendance(l.id)}
                  className="flex flex-1 items-center gap-3 text-right"
                  title="انتقل لتسجيل الحضور"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-church-800">
                    {Icon.book('w-5 h-5')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{l.title}</p>
                    <p className="text-xs text-slate-400">{l.date}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-church-50 px-2.5 py-1 text-xs font-medium text-church-800 hover:bg-gold-100 transition-colors">
                    {Icon.clipboard('w-3.5 h-3.5')}
                    <span>الحضور</span>
                  </span>
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(l)}
                  title="تعديل"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                >
                  {Icon.pencil('w-4 h-4')}
                </button>

                {/* Delete */}
                <button
                  onClick={() => setDeletingId(l.id)}
                  title="حذف"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  {Icon.trash('w-4 h-4')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function Attendance({ members, reloadMembers, lectures, showToast }) {
  const [searchParams] = useSearchParams()
  const [selectedLectureId, setSelectedLectureId] = useState(() => searchParams.get('lecture') ?? '')
  const [selected, setSelected]         = useState(new Set())
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(false)
  const quickEmptyForm = { name: '', phone: '', address: '', church: '', confession_father: '', birth_date: '', batch: '' }
  const [quickForm, setQuickForm]         = useState(quickEmptyForm)
  const [showQuickDetails, setShowQuickDetails] = useState(false)
  const [quickLoading, setQuickLoading] = useState(false)
  const setQuickField = (k) => (e) => setQuickForm((p) => ({ ...p, [k]: e.target.value }))

  // Load existing attendance whenever the selected lecture changes
  useEffect(() => {
    if (!selectedLectureId) { setSelected(new Set()); return }
    setLoadingAttendance(true)
    api.get('/attendance', { params: { lecture_id: selectedLectureId } })
      .then(({ data }) => {
        const presentIds = data.data
          .filter((r) => r.status === 'present')
          .map((r) => r.member_id)
        setSelected(new Set(presentIds))
      })
      .catch(() => setSelected(new Set()))
      .finally(() => setLoadingAttendance(false))
  }, [selectedLectureId])

  const filtered = useMemo(
    () => members.filter((m) => m.name.includes(search) || (m.phone ?? '').includes(search)),
    [members, search],
  )

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleSave = async () => {
    if (!selectedLectureId) { showToast('اختار محاضرة أولاً', 'error'); return }
    setLoading(true)
    try {
      await api.post('/attendance/bulk', {
        lecture_id: Number(selectedLectureId),
        present_member_ids: [...selected],
      })
      showToast('تم حفظ الحضور بنجاح ✓')
    } catch {
      showToast('حدث خطأ أثناء الحفظ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addQuickMember = async (e) => {
    e.preventDefault()
    setQuickLoading(true)
    try {
      const payload = Object.fromEntries(Object.entries(quickForm).filter(([, v]) => v !== ''))
      await api.post('/members', payload)
      setQuickForm(quickEmptyForm)
      setShowQuickDetails(false)
      await reloadMembers()
      showToast('تم إضافة المخدوم ✓')
    } catch {
      showToast('حدث خطأ، تأكد من الاسم والموبايل', 'error')
    } finally {
      setQuickLoading(false)
    }
  }

  const downloadAttendance = async (type) => {
    if (!selectedLectureId) { showToast('اختار محاضرة قبل التصدير', 'error'); return }
    try {
      const res = await api.get(`/export/lectures/${selectedLectureId}/${type}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href = url
      a.download = `${type}-${selectedLectureId}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast('فشل التصدير', 'error')
    }
  }

  const selectedLecture = lectures.find((l) => String(l.id) === String(selectedLectureId))
  const isPast = selectedLecture
    ? selectedLecture.date < new Date().toISOString().slice(0, 10)
    : false

  const presentCount = selected.size
  const absentCount  = Math.max(members.length - presentCount, 0)
  const total        = members.length
  const rate         = total > 0 ? Math.round((presentCount / total) * 100) : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Quick Add (top) ── */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-700">⚡ إضافة مخدوم جديد بسرعة</p>
          <button
            type="button"
            onClick={() => setShowQuickDetails((v) => !v)}
            className="text-xs font-bold text-church-800 hover:text-church-900"
          >
            {showQuickDetails ? 'إخفاء البيانات الإضافية' : '+ بيانات إضافية (عنوان، دفعة، …)'}
          </button>
        </div>
        <form onSubmit={addQuickMember} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={quickForm.name}
              onChange={setQuickField('name')}
              required
              className="flex-1 rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              placeholder="الاسم *"
            />
            <input
              value={quickForm.phone}
              onChange={setQuickField('phone')}
              required
              className="flex-1 rounded-xl border border-slate-200 p-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              placeholder="الموبايل *"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={quickLoading}
              className="shrink-0 rounded-xl bg-church-800 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-church-900 disabled:opacity-60"
            >
              {quickLoading ? '...' : 'إضافة'}
            </button>
          </div>

          {showQuickDetails && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">بيانات إضافية (اختياري)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={quickForm.batch}
                  onChange={setQuickField('batch')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
                  placeholder="الدفعة"
                />
                <input
                  type="date"
                  value={quickForm.birth_date}
                  onChange={setQuickField('birth_date')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
                />
                <input
                  value={quickForm.address}
                  onChange={setQuickField('address')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm sm:col-span-2"
                  placeholder="العنوان"
                />
                <input
                  value={quickForm.church}
                  onChange={setQuickField('church')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
                  placeholder="الكنيسة"
                />
                <input
                  value={quickForm.confession_father}
                  onChange={setQuickField('confession_father')}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-sm"
                  placeholder="أب الاعتراف"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── Step 1: Lecture ── */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-church-800 text-xs font-bold text-white">١</span>
          <h3 className="font-bold text-slate-700">اختار المحاضرة</h3>
        </div>
        <select
          value={selectedLectureId}
          onChange={(e) => setSelectedLectureId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
        >
          <option value="">— اختار المحاضرة —</option>
          {lectures.map((l) => (
            <option key={l.id} value={l.id}>{l.title} ({l.date})</option>
          ))}
        </select>
      </div>

      {/* ── Analysis + Save + Export ── */}
      <div className="overflow-hidden rounded-2xl shadow-sm">
        {/* Gradient header */}
        <div className="flex items-center justify-between bg-gradient-to-l from-church-800 to-church-900 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
              {Icon.clipboard('w-4 h-4 text-white')}
            </div>
            <h3 className="font-bold text-white">تحليل الحضور</h3>
          </div>
          {total > 0 && (
            <span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${
              rate >= 75
                ? 'bg-emerald-400/20 text-emerald-200 ring-emerald-300/30'
                : rate >= 50
                  ? 'bg-amber-400/20 text-amber-200 ring-amber-300/30'
                  : 'bg-red-400/20 text-red-200 ring-red-300/30'
            }`}>
              {rate}%
            </span>
          )}
        </div>

        <div className="space-y-4 bg-white p-5">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { count: presentCount, label: 'حضر',      sub: total > 0 ? `${rate}%` : '—',         from: 'from-emerald-50', border: 'border-emerald-200/70', num: 'text-emerald-700', subc: 'text-emerald-500', dot: 'bg-emerald-500' },
              { count: absentCount,  label: 'غاب',      sub: total > 0 ? `${100 - rate}%` : '—',   from: 'from-red-50',     border: 'border-red-200/70',     num: 'text-red-600',    subc: 'text-red-400',   dot: 'bg-red-500' },
              { count: total,        label: 'الإجمالي', sub: 'مخدوم',                               from: 'from-church-50',    border: 'border-gold-200/70',    num: 'text-church-800',   subc: 'text-gold-600',  dot: 'bg-church-700' },
            ].map(({ count, label, sub, from, border, num, subc, dot }) => (
              <div key={label} className={`flex flex-col items-center rounded-xl border bg-gradient-to-b ${from} to-white ${border} py-4`}>
                <span className={`mb-2.5 inline-block h-2 w-2 rounded-full ${dot}`} />
                <span className={`text-3xl font-black leading-none ${num}`}>{count}</span>
                <span className="mt-1.5 text-[11px] font-medium text-slate-400">{label}</span>
                <span className={`text-[11px] font-bold ${subc}`}>{sub}</span>
              </div>
            ))}
          </div>

          {/* Segmented progress bar */}
          {total > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    حضر {presentCount}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                    غاب {absentCount}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">{rate}%</span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`transition-all duration-700 ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={loading || !selectedLectureId || isPast}
            className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition-all ${
              isPast
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-church-800 text-white shadow-md shadow-church-200 hover:bg-church-900 hover:shadow-lg hover:shadow-church-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>جاري الحفظ...</span>
              </>
            ) : isPast ? (
              <>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>محاضرة سابقة — للعرض فقط</span>
              </>
            ) : (
              <>
                {Icon.check('w-4 h-4')}
                <span>حفظ الحضور</span>
              </>
            )}
          </button>

          {/* Export buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => downloadAttendance('present')}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              {Icon.download('w-4 h-4')}
              <span>تحميل الحاضرين</span>
            </button>
            <button
              onClick={() => downloadAttendance('absent')}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              {Icon.download('w-4 h-4')}
              <span>تنزيل الغائبين</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Step 2: Mark ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-church-800 text-xs font-bold text-white">٢</span>
            <h3 className="font-bold text-slate-700">تسجيل الحضور</h3>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {Icon.search('w-4 h-4 text-slate-400')}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pr-9 pl-4 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              placeholder="بحث بالاسم أو الموبايل..."
            />
          </div>
        </div>

        {isPast && (
          <div className="flex items-center gap-2 bg-amber-50 px-5 py-3 text-sm text-amber-700 border-b border-amber-100">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>محاضرة سابقة — عرض فقط، لا يمكن تعديل الحضور</span>
          </div>
        )}

        <div className="max-h-[55vh] divide-y divide-slate-50 overflow-y-auto sm:max-h-96">
          {loadingAttendance ? (
            <div className="py-10 text-center text-sm text-slate-400">جاري تحميل الحضور...</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">لا توجد نتائج</div>
          ) : (
            filtered.map((m) => {
              const on = selected.has(m.id)
              return (
                <button
                  key={m.id}
                  onClick={() => !isPast && toggle(m.id)}
                  disabled={isPast}
                  className={`flex w-full items-center justify-between px-5 py-3.5 text-right transition-colors ${
                    isPast ? 'cursor-default opacity-80' : on ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${on ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {on ? Icon.check('w-4 h-4') : m.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-medium ${on ? 'text-emerald-800' : 'text-slate-800'}`}>{m.name}</p>
                      <p className="text-xs text-slate-400">{m.phone}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${on ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {on ? 'حاضر ✓' : 'غائب'}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

    </div>
  )
}

// ─── Birthdays ────────────────────────────────────────────────────────────────
function Birthdays({ showToast }) {
  const navigate = useNavigate()
  const defaults = useMemo(() => currentMonthPeriod(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [appliedFrom, setAppliedFrom] = useState(defaults.from)
  const [appliedTo, setAppliedTo] = useState(defaults.to)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [list, setList] = useState([])
  const [count, setCount] = useState(0)

  const load = useCallback(async (fromDate, toDate) => {
    setLoading(true)
    try {
      const { data } = await api.get('/members/birthdays', { params: { from: fromDate, to: toDate } })
      const rows = data.data ?? []
      setList(rows)
      setCount(data.count ?? rows.length)
    } catch {
      setList([])
      setCount(0)
      showToast('فشل تحميل أعياد الميلاد', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load(appliedFrom, appliedTo)
  }, [load, appliedFrom, appliedTo])

  const applyFilter = () => {
    if (from > to) {
      showToast('تاريخ البداية يجب أن يكون قبل النهاية', 'error')
      return
    }
    setAppliedFrom(from)
    setAppliedTo(to)
  }

  const resetToCurrentMonth = () => {
    const p = currentMonthPeriod()
    setFrom(p.from)
    setTo(p.to)
    setAppliedFrom(p.from)
    setAppliedTo(p.to)
  }

  const isCurrentMonth = appliedFrom === defaults.from && appliedTo === defaults.to

  const filtered = useMemo(() => {
    const q = search.trim()
    if (!q) return list
    return list.filter(
      (m) => m.name.includes(q) || (m.phone ?? '').includes(q) || (m.batch ?? '').includes(q),
    )
  }, [list, search])

  const monthLabel = useMemo(() => {
    const d = new Date(appliedFrom)
    return d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
  }, [appliedFrom])

  return (
    <div className="space-y-4 pb-10">
      <div className="card-hero">
        <div className="flex items-center gap-3">
          {Icon.calendar('w-8 h-8 text-gold-300')}
          <div>
            <h1 className="text-xl font-bold">أعياد الميلاد</h1>
            <p className="mt-0.5 text-sm text-gold-100">
              {isCurrentMonth ? `أعياد شهر ${monthLabel}` : `من ${appliedFrom} إلى ${appliedTo}`}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-700">فلتر الفترة</h2>
        <p className="mb-3 text-xs text-slate-400">يُقارن يوم وشهر الميلاد فقط (يتجاهل سنة الميلاد)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">من</label>
            <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">إلى</label>
            <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={applyFilter} className="rounded-xl bg-church-800 px-4 py-2 text-sm font-bold text-white hover:bg-church-900">
            تطبيق
          </button>
          <button type="button" onClick={resetToCurrentMonth} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200">
            الشهر الحالي
          </button>
        </div>
      </div>

      <div className="relative">
        {Icon.search('absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none')}
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm shadow-sm"
          placeholder="بحث بالاسم أو الموبايل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-700">قائمة أعياد الميلاد</h2>
          <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-church-800">{count}</span>
        </div>
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-2 text-4xl">🎂</div>
            <p className="text-sm">لا يوجد مخدومين بميلاد في هذه الفترة</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((m) => {
              const age = turningAge(m.birth_date)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => navigate(`/members/${m.id}`)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-right transition-colors hover:bg-church-50"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-gold-100 to-church-50 text-church-800 ring-1 ring-gold-200">
                    <span className="text-lg font-bold leading-none">{new Date(m.birth_date).getDate()}</span>
                    <span className="text-[10px] font-medium leading-tight">
                      {new Date(m.birth_date).toLocaleDateString('ar-EG', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.phone}{m.batch ? ` · ${m.batch}` : ''}</p>
                    <p className="mt-0.5 text-xs text-church-700">{formatBirthdayDay(m.birth_date)}{age != null ? ` · يبلغ ${age} سنة` : ''}</p>
                  </div>
                  {Icon.arrowLeft('w-4 h-4 shrink-0 text-slate-300 rotate-180')}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Trips ────────────────────────────────────────────────────────────────────
function Trips({ trips, reload, showToast }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const emptyForm = { name: '', from_date: '', to_date: '', price: '', required_attendance_count: '', attendance_month: '', capacity: '50' }
  const [form, setForm] = useState(emptyForm)

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }
  const openEdit = (t) => {
    setForm({
      name: t.name,
      from_date: t.from_date,
      to_date: t.to_date,
      price: String(t.price),
      required_attendance_count: String(t.required_attendance_count),
      attendance_month: t.attendance_month ?? '',
      capacity: String(t.capacity ?? 50),
    })
    setEditingTrip(t)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name: form.name,
      from_date: form.from_date,
      to_date: form.to_date,
      price: Number(form.price),
      required_attendance_count: Number(form.required_attendance_count),
      attendance_month: form.attendance_month || null,
      capacity: Number(form.capacity),
    }
    try {
      if (editingTrip) {
        await api.put(`/trips/${editingTrip.id}`, payload)
        setEditingTrip(null)
        showToast('تم تعديل الرحلة ✓')
      } else {
        await api.post('/trips', payload)
        setShowAddModal(false)
        showToast('تم إنشاء الرحلة ✓')
      }
      await reload()
    } catch {
      showToast('حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trips/${id}`)
      setDeletingId(null)
      await reload()
      showToast('تم حذف الرحلة')
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  const isModalOpen = showAddModal || !!editingTrip

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-church-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-church-900"
        >
          {Icon.plus('w-4 h-4')}
          <span>رحلة جديدة</span>
        </button>
      </div>

      {isModalOpen && (
        <Modal
          title={editingTrip ? 'تعديل الرحلة' : 'رحلة جديدة'}
          onClose={() => { setShowAddModal(false); setEditingTrip(null) }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">اسم الرحلة *</label>
              <input className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">من تاريخ *</label>
                <input type="date" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.from_date} onChange={(e) => setField('from_date', e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">إلى تاريخ *</label>
                <input type="date" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.to_date} onChange={(e) => setField('to_date', e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">السعر (جنيه) *</label>
                <input type="number" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.price} onChange={(e) => setField('price', e.target.value)} required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">عدد الحضور المطلوب *</label>
                <input type="number" min="0" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.required_attendance_count} onChange={(e) => setField('required_attendance_count', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">شهر الحضور (اختياري)</label>
              <input type="month" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.attendance_month} onChange={(e) => setField('attendance_month', e.target.value)} />
              <p className="mt-1 text-xs text-slate-400">لو محدد، شرط الحضور يتحسب في الشهر ده بس</p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">عدد المقاعد *</label>
              <input type="number" min="1" className="w-full rounded-xl border border-slate-200 p-3 text-sm" value={form.capacity} onChange={(e) => setField('capacity', e.target.value)} required />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setShowAddModal(false); setEditingTrip(null) }} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">إلغاء</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-church-800 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? '...' : 'حفظ'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeletingId(null)}>
          <p className="mb-5 text-sm text-slate-600">هل أنت متأكد من حذف هذه الرحلة؟</p>
          <div className="flex gap-2">
            <button onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border py-3 text-sm font-bold">إلغاء</button>
            <button onClick={() => handleDelete(deletingId)} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white">حذف</button>
          </div>
        </Modal>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-700">
            الرحلات
            <span className="mr-2 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">{trips.length}</span>
          </h2>
        </div>
        {trips.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mb-2 text-5xl">🚌</div>
            <p className="text-sm">لا توجد رحلات</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {trips.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-church-800">
                    {Icon.trip('w-5 h-5')}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.from_date} → {t.to_date}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      السعر: {Number(t.price).toLocaleString('ar-EG')} ج.م · مقاعد: {t.capacity ?? 50} · حضور مطلوب: {t.required_attendance_count}
                      {t.attendance_month ? ` · شهر: ${t.attendance_month}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/trips/${t.id}/day-attendance`)} className="rounded-lg bg-gold-600 px-3 py-2 text-xs font-bold text-white hover:bg-gold-500">حضور اليوم</button>
                  <button onClick={() => navigate(`/trips/${t.id}/reservations`)} className="rounded-lg bg-church-800 px-3 py-2 text-xs font-bold text-white hover:bg-church-900">الحجوزات</button>
                  <button onClick={() => openEdit(t)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200">{Icon.pencil('w-4 h-4 inline')}</button>
                  <button onClick={() => setDeletingId(t.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">{Icon.trash('w-4 h-4 inline')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Servants (admin CRUD) ────────────────────────────────────────────────────
function Servants({ servants, reload, showToast }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const emptyForm = { name: '', phone: '', email: '', password: '' }
  const [form, setForm] = useState(emptyForm)

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }))

  const filtered = useMemo(
    () => servants.filter((s) => s.name.includes(search) || s.email.includes(search) || (s.phone ?? '').includes(search)),
    [servants, search],
  )

  const openAdd = () => { setForm(emptyForm); setShowAddModal(true) }
  const openEdit = (s) => {
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email, password: '' })
    setEditing(s)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { name: form.name, phone: form.phone, email: form.email }
    if (form.password) payload.password = form.password
    try {
      if (editing) {
        await api.put(`/servants/${editing.id}`, payload)
        setEditing(null)
        showToast('تم تعديل الخادم ✓')
      } else {
        await api.post('/servants', { ...payload, password: form.password })
        setShowAddModal(false)
        showToast('تم إضافة الخادم ✓')
      }
      await reload()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'حدث خطأ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/servants/${id}`)
      setDeletingId(null)
      await reload()
      showToast('تم حذف الخادم')
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  const isModalOpen = showAddModal || !!editing

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{Icon.search('w-4 h-4 text-slate-400')}</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-9 pl-4 text-sm shadow-sm" placeholder="بحث بالاسم أو الإيميل..." />
        </div>
        <button onClick={openAdd} className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
          {Icon.plus('w-4 h-4')}
          <span>خادم جديد</span>
        </button>
      </div>

      {isModalOpen && (
        <Modal title={editing ? 'تعديل خادم' : 'خادم جديد'} onClose={() => { setShowAddModal(false); setEditing(null) }}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">الاسم *</label>
              <input className="w-full rounded-xl border p-3 text-sm" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">الموبايل *</label>
              <input className="w-full rounded-xl border p-3 text-sm" value={form.phone} onChange={(e) => setField('phone', e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">البريد الإلكتروني *</label>
              <input type="email" className="w-full rounded-xl border p-3 text-sm" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{editing ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}</label>
              <input type="password" className="w-full rounded-xl border p-3 text-sm" value={form.password} onChange={(e) => setField('password', e.target.value)} required={!editing} minLength={6} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setShowAddModal(false); setEditing(null) }} className="flex-1 rounded-xl border py-3 text-sm font-bold">إلغاء</button>
              <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? '...' : 'حفظ'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deletingId && (
        <Modal title="تأكيد الحذف" onClose={() => setDeletingId(null)}>
          <p className="mb-5 text-sm text-slate-600">هل أنت متأكد من حذف هذا الخادم؟</p>
          <div className="flex gap-2">
            <button onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border py-3 text-sm font-bold">إلغاء</button>
            <button onClick={() => handleDelete(deletingId)} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white">حذف</button>
          </div>
        </Modal>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold text-slate-700">الخدام <span className="mr-2 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs text-violet-700">{filtered.length}</span></h2>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400"><p className="text-sm">لا يوجد خدام</p></div>
        ) : (
          <div className="divide-y">
            {filtered.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">{s.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email} · {s.phone}</p>
                    <p className="text-xs text-slate-400">محاضرات: {s.lectures_count ?? 0}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{Icon.pencil('w-4 h-4')}</button>
                  <button onClick={() => setDeletingId(s.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{Icon.trash('w-4 h-4')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLoggedIn }) {
  const { branding } = useBranding()
  const [email, setEmail]     = useState('admin@church.test')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/login', { email, password })
      const u = res.data.user?.data ?? res.data.user
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(u))
      onLoggedIn(res.data.token)
    } catch {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-church-950 to-church-900 px-4"
      style={{ fontFamily: 'Tajawal, sans-serif' }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto mb-4 h-28 w-28 rounded-full bg-white p-1 shadow-2xl ring-4 ring-gold-400/40" />
          <h1 className="text-xl font-bold leading-relaxed text-white">{branding.app_name}</h1>
          <p className="mt-1 text-sm text-gold-200">
            {branding.app_subtitle ? `${branding.app_subtitle} — ` : ''}سجّل دخولك للمتابعة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm transition focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm transition focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-church-800 p-3.5 font-bold text-white transition-colors hover:bg-church-900 disabled:opacity-60"
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs text-gold-100">
          <p className="mb-2 font-bold text-white">حسابات تجريبية</p>
          <p><span className="text-gold-200">مسؤول:</span> admin@church.test / password</p>
          <p className="mt-1"><span className="text-gold-200">خادم:</span> mina@church.test / password</p>
        </div>
      </div>
    </div>
  )
}
