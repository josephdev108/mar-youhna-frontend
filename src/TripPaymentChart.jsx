import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#1e4d6b', '#c9a227', '#059669', '#7c3aed', '#ea580c', '#0891b2', '#be185d']

export default function TripPaymentChart({ breakdown }) {
  const data = (breakdown ?? []).filter((d) => Number(d.total) > 0)

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">لا توجد مدفوعات مسجّلة بعد</p>
    )
  }

  const chartData = data.map((d) => ({
    name: d.label,
    value: Number(d.total),
  }))

  return (
    <div className="h-56 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString('ar-EG')} ج.م`, 'المبلغ']}
          />
          <Legend formatter={(value) => <span className="text-xs text-slate-700">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
