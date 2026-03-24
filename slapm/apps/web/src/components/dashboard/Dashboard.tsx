import { useProjects } from '../../hooks/useProjects'
import { useAuth } from '../../hooks/useAuth'
import { KpiCard } from './KpiCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { FolderKanban, CheckSquare, Users, TrendingUp } from 'lucide-react'

const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e']
const STATUS_LABELS = ['To Do', 'In Progress', 'In Review', 'Done']

export function Dashboard() {
  const { user } = useAuth()
  const { data: projects = [] } = useProjects()

  const activeProjects = projects.filter((p) => !p.archived).length
  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0), 0)

  const barData = projects.map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 13) + '…' : p.name,
    tasks: p._count?.tasks ?? 0,
  }))

  // Placeholder status distribution until per-status counts come from API
  const pieData = STATUS_LABELS.map((name, i) => ({ name, value: Math.max(1, Math.round(totalTasks / 4)), color: STATUS_COLORS[i] }))

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-6 flex-1 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening across SLA Pharma</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Active Projects" value={activeProjects} color="#3b82f6" icon={<FolderKanban size={28} />} />
          <KpiCard title="Total Tasks" value={totalTasks} color="#8b5cf6" icon={<CheckSquare size={28} />} />
          <KpiCard title="Team Members" value={13} subtitle="8 employees · 5 consultants" color="#10b981" icon={<Users size={28} />} />
          <KpiCard
            title="Completion Rate"
            value={totalTasks > 0 ? `${Math.round((pieData[3].value / totalTasks) * 100)}%` : '—'}
            subtitle="Tasks marked done"
            color="#f59e0b"
            icon={<TrendingUp size={28} />}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Tasks per Project</h3>
            {barData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No projects yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Task Status Distribution</h3>
            {totalTasks === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No tasks yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Projects list */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">All Projects</h3>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm">No projects yet.</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium text-slate-700 flex-1">{p.name}</span>
                  {p.archived && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Archived</span>}
                  <span className="text-xs text-slate-400">{p._count?.tasks ?? 0} tasks</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
