import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '../../types'
import { KanbanCard } from './KanbanCard'
import { Plus } from 'lucide-react'

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100',
  IN_PROGRESS: 'bg-blue-50',
  IN_REVIEW: 'bg-yellow-50',
  DONE: 'bg-green-50',
}

interface Props {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}

export function KanbanColumn({ status, tasks, onTaskClick, onAddTask }: Props) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div className={`flex flex-col w-72 shrink-0 rounded-xl p-3 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-slate-700">{statusLabels[status]}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-white rounded-full px-2 py-0.5">{tasks.length}</span>
          <button onClick={() => onAddTask(status)} className="text-slate-400 hover:text-slate-600">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[100px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
