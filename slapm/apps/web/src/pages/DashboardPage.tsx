import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { FolderKanban, CheckSquare, Users } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: projects = [] } = useProjects()

  const stats = [
    { label: 'Active Projects', value: projects.filter(p => !p.archived).length, icon: FolderKanban, color: 'text-blue-500' },
    { label: 'Total Tasks', value: projects.reduce((sum, p) => sum + (p._count?.tasks ?? 0), 0), icon: CheckSquare, color: 'text-purple-500' },
    { label: 'Team Members', value: 13, icon: Users, color: 'text-green-500' },
  ]

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Dashboard" />
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Good day{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h2>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening across SLA Pharma</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <stat.icon className={`${stat.color} shrink-0`} size={24} />
                <div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Projects</h3>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm">No projects yet. Create your first project to get started.</p>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.color }} />
                  <span className="text-sm font-medium text-slate-700 flex-1">{p.name}</span>
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
