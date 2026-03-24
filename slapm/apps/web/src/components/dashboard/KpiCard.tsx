interface Props {
  title: string
  value: string | number
  subtitle?: string
  color?: string
  icon?: React.ReactNode
}

export function KpiCard({ title, value, subtitle, color = '#3b82f6', icon }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-slate-300">{icon}</div>}
      </div>
    </div>
  )
}
