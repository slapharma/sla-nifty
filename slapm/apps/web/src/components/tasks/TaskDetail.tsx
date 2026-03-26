import { useState, useRef, useEffect } from 'react'
import { Task, TaskPriority } from '../../types'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { X, CalendarDays, User, Plus, Check } from 'lucide-react'
import { useUpdateTask, useCreateTask } from '../../hooks/useTasks'
import { useProject } from '../../hooks/useProjects'

const priorityConfig: Record<TaskPriority, { label: string; classes: string }> = {
  LOW:    { label: 'Low',    classes: 'bg-green-100 text-green-700' },
  MEDIUM: { label: 'Medium', classes: 'bg-blue-100 text-blue-700' },
  HIGH:   { label: 'High',   classes: 'bg-orange-100 text-orange-700' },
  URGENT: { label: 'Urgent', classes: 'bg-red-100 text-red-700' },
}

interface Props {
  task: Task
  onClose: () => void
}

export function TaskDetail({ task, onClose }: Props) {
  const updateTask = useUpdateTask(task.projectId)
  const createTask = useCreateTask(task.projectId)
  const { data: project } = useProject(task.projectId)

  const [title, setTitle] = useState(task.title)
  const [editingTitle, setEditingTitle] = useState(false)
  const [description, setDescription] = useState(task.description ?? '')
  const [newSubtask, setNewSubtask] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const subtaskRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTitle(task.title); setDescription(task.description ?? '') }, [task.id])
  useEffect(() => { if (editingTitle) titleRef.current?.focus() }, [editingTitle])
  useEffect(() => { if (addingSubtask) subtaskRef.current?.focus() }, [addingSubtask])

  const patch = (data: Parameters<typeof updateTask.mutate>[0]['data']) =>
    updateTask.mutate({ taskId: task.id, data })

  const saveTitle = () => {
    setEditingTitle(false)
    if (title.trim() && title.trim() !== task.title) patch({ title: title.trim() })
  }

  const saveDescription = () => {
    const val = description.trim()
    if (val !== (task.description ?? '').trim()) patch({ description: val || undefined })
  }

  const addSubtask = () => {
    if (!newSubtask.trim()) return
    createTask.mutate(
      { title: newSubtask.trim(), status: 'TODO', priority: 'MEDIUM', parentId: task.id },
      { onSuccess: () => { setNewSubtask(''); setAddingSubtask(false) } }
    )
  }

  const members = project?.members ?? []
  const dueValue = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-xl border-l border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 gap-3">
        {editingTitle ? (
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(task.title); setEditingTitle(false) } }}
            className="flex-1 font-semibold text-slate-800 text-sm bg-slate-50 border border-blue-400 rounded px-2 py-1 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="flex-1 text-left font-semibold text-slate-800 text-sm hover:bg-slate-50 rounded px-2 py-1 -mx-2 transition-colors"
            title="Click to rename"
          >
            {title}
          </button>
        )}
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0 mt-0.5">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Priority */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Priority</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(priorityConfig) as TaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => patch({ priority: p })}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                  task.priority === p
                    ? `${priorityConfig[p].classes} ring-2 ring-offset-1 ring-current`
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {priorityConfig[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Assignee</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => patch({ assigneeId: null })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                !task.assignee
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-slate-500 hover:border-gray-300'
              }`}
            >
              <User size={12} />
              Unassigned
            </button>
            {members.map(({ user }) => (
              <button
                key={user.id}
                onClick={() => patch({ assigneeId: user.id })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                  task.assignee?.id === user.id
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-slate-600 hover:border-gray-300'
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

        {/* Due Date */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</p>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-400 shrink-0" />
            <input
              type="date"
              defaultValue={dueValue}
              onBlur={(e) => patch({ dueDate: e.target.value || undefined })}
              className="text-sm text-slate-700 border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:border-blue-400"
            />
            {task.dueDate && (
              <button
                onClick={() => patch({ dueDate: undefined })}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            placeholder="Add a description..."
            rows={3}
            className="w-full text-sm text-slate-700 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-400 placeholder:text-slate-400"
          />
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subtasks {task.subtasks && task.subtasks.length > 0 && `(${task.subtasks.length})`}
            </p>
            <button
              onClick={() => setAddingSubtask(true)}
              className="text-slate-400 hover:text-blue-500 transition-colors"
              title="Add subtask"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {(task.subtasks ?? []).map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 group">
                <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                  sub.status === 'DONE' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}>
                  {sub.status === 'DONE' && <Check size={9} className="text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm flex-1 ${sub.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {sub.title}
                </span>
              </div>
            ))}

            {addingSubtask && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  ref={subtaskRef}
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addSubtask()
                    if (e.key === 'Escape') { setNewSubtask(''); setAddingSubtask(false) }
                  }}
                  placeholder="Subtask title..."
                  className="flex-1 text-sm border border-blue-400 rounded-md px-2 py-1 focus:outline-none"
                />
                <button onClick={addSubtask} className="text-blue-500 hover:text-blue-700">
                  <Check size={16} />
                </button>
                <button onClick={() => { setNewSubtask(''); setAddingSubtask(false) }} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            )}

            {!addingSubtask && (task.subtasks ?? []).length === 0 && (
              <button
                onClick={() => setAddingSubtask(true)}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 px-2 py-1"
              >
                <Plus size={12} /> Add subtask
              </button>
            )}
          </div>
        </div>

        {/* Created by */}
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
