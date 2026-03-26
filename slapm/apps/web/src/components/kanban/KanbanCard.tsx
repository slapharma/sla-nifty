import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../../types'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { CalendarDays, MessageSquare, CheckSquare } from 'lucide-react'

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

interface Props {
  task: Task
  onClick: (task: Task) => void
}

export function KanbanCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-700 line-clamp-2">{task.title}</p>
        <Badge className={`text-xs shrink-0 border-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      {task.subtasks && task.subtasks.length > 0 && (() => {
        const done = task.subtasks.filter(s => s.status === 'DONE').length
        const total = task.subtasks.length
        const pct = Math.round((done / total) * 100)
        return (
          <div className="mt-2 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <CheckSquare size={11} /> {done}/{total}
              </span>
              <span className="text-xs text-slate-400">{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })()}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-slate-400">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <CalendarDays size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare size={12} /> {task._count?.comments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatarUrl} />
            <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
