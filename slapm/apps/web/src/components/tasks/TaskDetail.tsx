import { Task } from '../../types'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { X, CalendarDays, User } from 'lucide-react'

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

interface Props {
  task: Task
  onClose: () => void
}

export function TaskDetail({ task, onClose }: Props) {
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-slate-800 text-sm truncate">{task.title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex gap-2 flex-wrap">
          <Badge className={`text-xs border-0 ${statusColors[task.status]}`}>
            {task.status.replace('_', ' ')}
          </Badge>
          <Badge className={`text-xs border-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
        </div>

        {task.description && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assignee</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatarUrl} />
                  <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-700">{task.assignee.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-400">
                <User size={14} />
                <span className="text-sm">Unassigned</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
            {task.dueDate ? (
              <div className="flex items-center gap-1 text-slate-700">
                <CalendarDays size={14} />
                <span className="text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400">No due date</span>
            )}
          </div>
        </div>

        {task.tags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created by</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.creator.avatarUrl} />
              <AvatarFallback className="text-xs">{task.creator.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-700">{task.creator.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
