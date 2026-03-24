import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Milestone } from '../../types'
import { Badge } from '../ui/badge'
import { CheckCircle, Clock, AlertCircle, Circle } from 'lucide-react'

const statusConfig = {
  PENDING: { icon: Circle, color: 'text-slate-400', badge: 'bg-slate-100 text-slate-600' },
  IN_PROGRESS: { icon: Clock, color: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500', badge: 'bg-green-100 text-green-700' },
  OVERDUE: { icon: AlertCircle, color: 'text-red-500', badge: 'bg-red-100 text-red-700' },
}

export function MilestoneList({ projectId }: { projectId: string }) {
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => (await api.get<Milestone[]>(`/milestones?projectId=${projectId}`)).data,
    retry: false,
  })

  if (isLoading) {
    return <div className="p-6 text-slate-400 text-sm">Loading milestones…</div>
  }

  if (milestones.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-400 text-sm">
        No milestones yet for this project
      </div>
    )
  }

  return (
    <div className="p-6 space-y-3">
      <h2 className="font-semibold text-slate-800 mb-4">Milestones</h2>
      {milestones.map((m) => {
        const { icon: Icon, color, badge } = statusConfig[m.status]
        return (
          <div
            key={m.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className={color} />
              <div>
                <p className="font-medium text-sm text-slate-700">{m.title}</p>
                {m.description && <p className="text-xs text-slate-400 mt-0.5">{m.description}</p>}
                <p className="text-xs text-slate-400 mt-0.5">
                  Due {new Date(m.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={`text-xs border-0 ${badge}`}>{m.status}</Badge>
          </div>
        )
      })}
    </div>
  )
}
