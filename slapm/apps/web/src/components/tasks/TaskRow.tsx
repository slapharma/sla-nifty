import { Task } from '../../types'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
}

interface Props {
  task: Task
  onClick: (task: Task) => void
}

export function TaskRow({ task, onClick }: Props) {
  return (
    <tr
      onClick={() => onClick(task)}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <span className="text-sm text-slate-700">{task.title}</span>
      </td>
      <td className="py-3 px-4">
        <Badge className={`text-xs border-0 ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge variant="outline" className="text-xs">
          {task.priority}
        </Badge>
      </td>
      <td className="py-3 px-4">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatarUrl} />
              <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
      </td>
    </tr>
  )
}
