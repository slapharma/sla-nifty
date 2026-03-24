import { useMemo } from 'react'
import { Task } from '../../types'

interface GanttRow {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  color: string
}

const statusColors: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#22c55e',
}

interface Props {
  tasks: Task[]
  startDate?: Date
  endDate?: Date
}

const DAY_PX = 22

export function GanttChart({ tasks, startDate, endDate }: Props) {
  const now = new Date()
  const chartStart = startDate ?? new Date(now.getFullYear(), now.getMonth(), 1)
  const chartEnd = endDate ?? new Date(now.getFullYear(), now.getMonth() + 3, 0)
  const totalDays = Math.ceil((chartEnd.getTime() - chartStart.getTime()) / 86_400_000)

  const rows = useMemo<GanttRow[]>(
    () =>
      tasks
        .filter((t) => t.dueDate)
        .map((t) => ({
          id: t.id,
          title: t.title,
          start: new Date(t.createdAt),
          end: new Date(t.dueDate!),
          status: t.status,
          color: statusColors[t.status] ?? '#94a3b8',
        })),
    [tasks]
  )

  const dayOffset = (d: Date) =>
    Math.max(0, Math.ceil((d.getTime() - chartStart.getTime()) / 86_400_000))
  const dayWidth = (start: Date, end: Date) =>
    Math.max(2, Math.ceil((end.getTime() - start.getTime()) / 86_400_000))

  // Build month header segments
  const months: { label: string; days: number }[] = []
  let cursor = new Date(chartStart)
  while (cursor < chartEnd) {
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    const remaining = Math.ceil((chartEnd.getTime() - cursor.getTime()) / 86_400_000)
    const daysInMonth = Math.ceil((monthEnd.getTime() - cursor.getTime()) / 86_400_000) + 1
    months.push({
      label: cursor.toLocaleString('default', { month: 'short', year: 'numeric' }),
      days: Math.min(daysInMonth, remaining),
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  if (rows.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm">
        No tasks with due dates to display
      </div>
    )
  }

  return (
    <div className="p-6 overflow-x-auto">
      <div style={{ minWidth: totalDays * DAY_PX + 200 }}>
        {/* Month headers */}
        <div className="flex border-b border-gray-200 mb-1">
          <div className="w-48 shrink-0" />
          <div className="flex">
            {months.map((m, i) => (
              <div
                key={i}
                style={{ width: m.days * DAY_PX }}
                className="text-xs text-slate-500 font-medium px-1 py-1 border-r border-gray-100 whitespace-nowrap"
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Today line */}
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400 opacity-50 z-10"
            style={{ left: 192 + dayOffset(now) * DAY_PX }}
          />

          {/* Task rows */}
          {rows.map((row) => (
            <div key={row.id} className="flex items-center h-10 border-b border-gray-50 hover:bg-gray-50">
              <div className="w-48 shrink-0 text-sm text-slate-600 truncate pr-4 pl-1">{row.title}</div>
              <div className="relative flex-1 h-6">
                <div
                  style={{
                    left: dayOffset(row.start) * DAY_PX,
                    width: Math.max(dayWidth(row.start, row.end) * DAY_PX, 40),
                    backgroundColor: row.color,
                  }}
                  className="absolute top-0 h-full rounded-full opacity-80 flex items-center px-2"
                >
                  <span className="text-white text-xs truncate">{row.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {status.replace('_', ' ')}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-px h-3 bg-red-400" />
            Today
          </div>
        </div>
      </div>
    </div>
  )
}
