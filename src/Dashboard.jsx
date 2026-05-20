import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from './api'

const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8', '#f59e0b', '#3b82f6', '#8b5cf6']

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function StatCard({ label, value, sub, color = 'blue', onClick }) {
  const colors = {
    blue: 'from-church-800 to-church-900',
    emerald: 'from-emerald-700 to-emerald-800',
    amber: 'from-gold-500 to-gold-600',
    red: 'from-red-600 to-red-700',
    violet: 'from-church-700 to-church-800',
    cyan: 'from-gold-400 to-gold-600',
  }
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-l ${colors[color] ?? colors.blue} p-4 text-right text-white shadow-md ${onClick ? 'transition hover:brightness-110' : ''}`}
    >
      <p className="text-xs text-white/80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value ?? '—'}</p>
      {sub && <p className="mt-0.5 text-[10px] text-white/70">{sub}</p>}
    </Tag>
  )
}

function Section({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <h2 className="mb-4 text-sm font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

function AlertList({ items, emptyText, onMember, renderExtra }) {
  if (!items?.length) {
    return <p className="text-xs text-slate-400">{emptyText}</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id ?? item.member_id ?? item.name}>
          <button
            type="button"
            onClick={() => item.id && onMember?.(item.id)}
            className="flex w-full items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-right text-sm transition hover:bg-slate-100"
          >
            <span className="font-medium text-slate-800">{item.name}</span>
            {renderExtra?.(item)}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard({ isAdmin }) {
  const navigate = useNavigate()
  const [month, setMonth] = useState(currentMonth())
  const [batch, setBatch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { month }
      if (batch) params.batch = batch
      const { data: res } = await api.get('/dashboard', { params })
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [month, batch])

  useEffect(() => {
    load()
  }, [load])

  const overview = data?.overview
  const attendance = data?.attendance
  const members = data?.members
  const birthdays = data?.birthdays
  const trips = data?.trips
  const visitations = data?.visitations
  const servants = data?.servants ?? []

  const lastLecturePie = useMemo(() => {
    const l = attendance?.last_lecture
    if (!l) return []
    return [
      { name: 'حاضر', value: l.present },
      { name: 'غائب', value: l.absent },
    ]
  }, [attendance?.last_lecture])

  const goMember = (id) => navigate(`/members/${id}`)

  if (loading && !data) {
    return <div className="py-20 text-center text-slate-500">جاري تحميل لوحة التحكم...</div>
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-slate-500">إحصائيات ورسوم بيانية للاجتماع</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-bold text-slate-500">الشهر</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold text-slate-500">الدفعة</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="min-w-[120px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">الكل</option>
              {(data?.batches ?? []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="المخدومين" value={overview?.total_members} color="blue" onClick={() => navigate('/members')} />
        <StatCard label="محاضرات الشهر" value={overview?.lectures_this_month} color="violet" onClick={() => navigate('/lectures')} />
        <StatCard
          label="حضور آخر محاضرة"
          value={overview?.last_lecture_rate != null ? `${overview.last_lecture_rate}%` : '—'}
          color="emerald"
        />
        <StatCard label="متوسط الحضور" value={overview?.average_attendance_rate != null ? `${overview.average_attendance_rate}%` : '—'} color="cyan" />
        <StatCard label="غائب 3+ مرات" value={overview?.absent_three_plus_count} color="red" />
        <StatCard label="أعياد الميلاد" value={overview?.birthdays_this_month} color="amber" onClick={() => navigate('/birthdays')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Attendance trend */}
        <Section title="نسبة الحضور — آخر المحاضرات" className="lg:col-span-2">
          {attendance?.lecture_trend?.length ? (
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendance.lecture_trend} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'نسبة الحضور']} labelFormatter={(_, p) => p?.[0]?.payload?.date} />
                  <Bar dataKey="rate" name="نسبة الحضور" fill="#8b0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا توجد محاضرات مسجّلة بعد</p>
          )}
        </Section>

        {/* Last lecture pie */}
        <Section title="آخر محاضرة — حاضر / غائب">
          {lastLecturePie.length && attendance?.last_lecture ? (
            <>
              <p className="mb-2 text-xs text-slate-500">{attendance.last_lecture.title} · {attendance.last_lecture.date}</p>
              <div className="h-52" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={lastLecturePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {lastLecturePie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/attendance?lecture=${attendance.last_lecture.id}`)}
                className="mt-3 w-full rounded-xl bg-church-800 py-2 text-xs font-bold text-white hover:bg-church-900"
              >
                فتح سجل الحضور
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-400">لا توجد محاضرة</p>
          )}
        </Section>
      </div>

      {/* Alerts row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Section title="⚠️ غائبون 3+ مرات">
          <AlertList
            items={attendance?.absent_three_plus}
            emptyText="لا يوجد"
            onMember={goMember}
            renderExtra={(item) => (
              <span className="shrink-0 rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{item.absence_count} غياب</span>
            )}
          />
        </Section>
        <Section title="⚠️ اختفوا (غاب آخر محاضرتين)">
          <AlertList items={attendance?.disappeared} emptyText="لا يوجد" onMember={goMember} />
        </Section>
        <Section title="🎂 ميلادات قريبة (14 يوم)">
          <AlertList
            items={birthdays?.upcoming}
            emptyText="لا يوجد قريباً"
            onMember={goMember}
            renderExtra={(item) => <span className="text-xs text-slate-500">{item.birth_date}</span>}
          />
        </Section>
        <Section title="💰 متبقي على الرحلة">
          <AlertList
            items={trips?.debtors}
            emptyText="لا يوجد مديونون"
            onMember={(id) => goMember(id)}
            renderExtra={(item) => (
              <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                {Number(item.remaining_amount).toLocaleString('ar-EG')} ج.م
              </span>
            )}
          />
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="الأكثر غياباً">
          {attendance?.most_absent?.length ? (
            <div className="h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendance.most_absent} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="absence_count" name="مرات الغياب" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا بيانات</p>
          )}
        </Section>

        <Section title="توزيع الدفعات">
          {members?.by_batch?.length ? (
            <div className="h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={members.by_batch}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="العدد" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا بيانات</p>
          )}
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="توزيع الكنائس">
          {members?.by_church?.length ? (
            <div className="h-56" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={members.by_church}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="العدد" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا بيانات</p>
          )}
        </Section>

        <Section title="بيانات ناقصة / أعضاء جدد">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{members?.incomplete_data?.no_birth_date ?? 0}</p>
              <p className="text-xs text-amber-800">بدون تاريخ ميلاد</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{members?.incomplete_data?.no_address ?? 0}</p>
              <p className="text-xs text-amber-800">بدون عنوان</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-2xl font-bold text-slate-700">{members?.incomplete_data?.no_batch ?? 0}</p>
              <p className="text-xs text-slate-600">بدون دفعة</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{members?.new_last_30_days ?? 0}</p>
              <p className="text-xs text-emerald-800">جدد (30 يوم)</p>
            </div>
          </div>
          {attendance?.lectures_without_attendance?.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-bold text-red-600">محاضرات بدون تسجيل حضور</p>
              <ul className="space-y-1">
                {attendance.lectures_without_attendance.map((l) => (
                  <li key={l.id} className="text-xs text-slate-600">{l.title} — {l.date}</li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      </div>

      {/* Trips & Visitations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="الرحلة القادمة / الحالية">
          {trips?.upcoming ? (
            <div className="space-y-3">
              <div>
                <p className="font-bold text-slate-800">{trips.upcoming.name}</p>
                <p className="text-xs text-slate-500">{trips.upcoming.from_date} → {trips.upcoming.to_date}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${Math.min(100, (trips.upcoming.reserved_count / (trips.upcoming.capacity || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">
                محجوز: {trips.upcoming.reserved_count} / {trips.upcoming.capacity}
              </p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <p className="text-sm font-bold text-emerald-700">{Number(trips.upcoming.collected_amount).toLocaleString('ar-EG')}</p>
                  <p className="text-[10px] text-emerald-600">محصّل</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2">
                  <p className="text-sm font-bold text-amber-700">{Number(trips.upcoming.remaining_total).toLocaleString('ar-EG')}</p>
                  <p className="text-[10px] text-amber-600">متبقي</p>
                </div>
              </div>
              {trips.day_attendance && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-emerald-50 p-2 font-bold text-emerald-700">حضر {trips.day_attendance.present_count}</div>
                  <div className="rounded-lg bg-red-50 p-2 font-bold text-red-600">غاب {trips.day_attendance.absent_count}</div>
                  <div className="rounded-lg bg-slate-100 p-2 font-bold text-slate-600">معلق {trips.day_attendance.pending_count}</div>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => navigate(`/trips/${trips.upcoming.id}/reservations`)} className="flex-1 rounded-xl bg-church-800 py-2 text-xs font-bold text-white">الحجوزات</button>
                <button type="button" onClick={() => navigate(`/trips/${trips.upcoming.id}/day-attendance`)} className="flex-1 rounded-xl bg-gold-600 py-2 text-xs font-bold text-white">حضور اليوم</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا توجد رحلة قادمة</p>
          )}
        </Section>

        <Section title="الافتقاد">
          {visitations?.active_session ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-800">آخر جلسة: {visitations.active_session.day}</p>
              {visitations.active_session.servants?.length > 0 && (
                <p className="text-xs text-slate-500">الخدام: {visitations.active_session.servants.join('، ')}</p>
              )}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-emerald-50 p-2 font-bold text-emerald-700">تم {visitations.active_session.done_count}</div>
                <div className="rounded-lg bg-red-50 p-2 font-bold text-red-600">غير موجود {visitations.active_session.not_exist_count}</div>
                <div className="rounded-lg bg-slate-100 p-2 font-bold text-slate-600">معلق {visitations.active_session.pending_count}</div>
              </div>
              <button type="button" onClick={() => navigate(`/visitations/${visitations.active_session.id}`)} className="w-full rounded-xl bg-church-800 py-2 text-xs font-bold text-white">فتح الجلسة</button>
            </div>
          ) : (
            <p className="text-sm text-slate-400">لا توجد جلسات</p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-center">
            <div>
              <p className="text-lg font-bold text-church-800">{visitations?.sessions_this_month ?? 0}</p>
              <p className="text-[10px] text-slate-500">جلسات الشهر</p>
            </div>
            <div>
              <p className="text-lg font-bold text-church-800">{visitations?.visits_done_this_month ?? 0}</p>
              <p className="text-[10px] text-slate-500">زيارات تمت</p>
            </div>
          </div>
          {visitations?.not_visited_since?.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-bold text-slate-600">لم يُفتقدوا منذ 3 أشهر</p>
              <AlertList items={visitations.not_visited_since.slice(0, 8)} emptyText="" onMember={goMember} />
            </div>
          )}
        </Section>
      </div>

      {/* Birthdays list */}
      {birthdays?.list?.length > 0 && (
        <Section title={`أعياد ميلاد ${month}`}>
          <div className="flex flex-wrap gap-2">
            {birthdays.list.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goMember(b.id)}
                className="rounded-xl bg-gold-100 px-3 py-1.5 text-xs font-medium text-church-900 hover:bg-gold-200"
              >
                {b.name}
              </button>
            ))}
            {birthdays.count > birthdays.list.length && (
              <button type="button" onClick={() => navigate('/birthdays')} className="rounded-xl border border-gold-300 px-3 py-1.5 text-xs font-bold text-church-800 hover:bg-gold-50">
                +{birthdays.count - birthdays.list.length} المزيد
              </button>
            )}
          </div>
        </Section>
      )}

      {/* Servants admin */}
      {isAdmin && servants.length > 0 && (
        <Section title="حضور المحاضرات حسب الخادم (الشهر)">
          <div className="h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="lectures_count" name="محاضرات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avg_attendance_rate" name="متوسط الحضور %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}
    </div>
  )
}
