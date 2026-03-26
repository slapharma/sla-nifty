import { useState, useRef } from 'react'
import { TaskStatus, TaskPriority } from '../../types'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useCreateTask } from '../../hooks/useTasks'
import { useProject } from '../../hooks/useProjects'
import { X, Plus, Trash2 } from 'lucide-react'

interface Props {
  projectId: string
  defaultStatus?: TaskStatus
  onClose: () => void
}

export function TaskForm({ projectId, defaultStatus = 'TODO', onClose }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const subtaskRef = useRef<HTMLInputElement>(null)

  const createTask = useCreateTask(projectId)
  const { data: project } = useProject(projectId)
  const members = project?.members ?? []

  const addSubtask = () => {
    const val = subtaskInput.trim()
    if (!val) return
    setSubtasks((prev) => [...prev, val])
    setSubtaskInput('')
    subtaskRef.current?.focus()
  }

  const removeSubtask = (i: number) =>
    setSubtasks((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createTask.mutate(
      {
        title: title.trim(),
        status: defaultStatus,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
      },
      {
        onSuccess: (parent) => {
          // Create subtasks sequentially after parent is saved
          const pending = [...subtasks]
          const createNext = (idx: number) => {
            if (idx >= pending.length) { onClose(); return }
            createTask.mutate(
              { title: pending[idx], status: 'TODO', priority: 'MEDIUM', parentId: parent.id },
              { onSuccess: () => createNext(idx + 1) }
            )
          }
          createNext(0)
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="mt-1"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAssigneeId('')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                    !assigneeId ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-slate-500 hover:border-gray-300'
                  }`}
                >
                  Unassigned
                </button>
                {members.map(({ user }) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setAssigneeId(user.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                      assigneeId === user.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-slate-600 hover:border-gray-300'
                    }`}
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-[9px]">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtasks</label>
            <div className="mt-2 space-y-1">
              {subtasks.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-md">
                  <span className="flex-1 text-sm text-slate-700">{s}</span>
                  <button type="button" onClick={() => removeSubtask(i)} className="text-slate-300 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-1">
                <input
                  ref={subtaskRef}
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addSubtask() }
                  }}
                  placeholder="Add subtask (Enter to add)..."
                  className="flex-1 text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-400 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={addSubtask}
                  className="text-slate-400 hover:text-blue-500 p-1"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={createTask.isPending} className="flex-1">
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
