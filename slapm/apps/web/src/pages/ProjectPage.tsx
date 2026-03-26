import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskList } from '../components/tasks/TaskList'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { TaskForm } from '../components/tasks/TaskForm'
import { GanttChart } from '../components/gantt/GanttChart'
import { MilestoneList } from '../components/milestones/MilestoneList'
import { useTasks } from '../hooks/useTasks'
import { useProject, useUpdateProject } from '../hooks/useProjects'
import { TaskStatus } from '../types'
import { LayoutGrid, List, GanttChart as GanttIcon, Flag, Plus, Pencil, Check, X } from 'lucide-react'
import { Button } from '../components/ui/button'

type ViewMode = 'kanban' | 'list' | 'gantt' | 'milestones'

const views: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'kanban', label: 'Kanban', icon: <LayoutGrid size={15} /> },
  { id: 'list', label: 'List', icon: <List size={15} /> },
  { id: 'gantt', label: 'Gantt', icon: <GanttIcon size={15} /> },
  { id: 'milestones', label: 'Milestones', icon: <Flag size={15} /> },
]

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const { data: tasks = [] } = useTasks(projectId ?? '')
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null
  const { data: project } = useProject(projectId ?? '')
  const updateProject = useUpdateProject()

  useEffect(() => {
    if (project) setNameValue(project.name)
  }, [project?.name])

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  const saveName = () => {
    setEditingName(false)
    if (nameValue.trim() && nameValue.trim() !== project?.name && projectId) {
      updateProject.mutate({ projectId, data: { name: nameValue.trim() } })
    }
  }

  if (!projectId) return null

  return (
    <div className="flex flex-col h-full">
      {/* Project name header */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-white">
        {project?.color && (
          <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: project.color }} />
        )}
        {editingName ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              ref={nameInputRef}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName()
                if (e.key === 'Escape') { setNameValue(project?.name ?? ''); setEditingName(false) }
              }}
              className="text-base font-semibold text-slate-800 border border-blue-400 rounded px-2 py-0.5 focus:outline-none"
            />
            <button onClick={saveName} className="text-green-500 hover:text-green-700 p-1">
              <Check size={14} />
            </button>
            <button onClick={() => { setNameValue(project?.name ?? ''); setEditingName(false) }} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <h1 className="text-base font-semibold text-slate-800">
              {project?.name ?? '…'}
            </h1>
            <button
              onClick={() => setEditingName(true)}
              className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Rename project"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
      </div>

      {/* View switcher toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                viewMode === v.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-gray-100'
              }`}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
        {(viewMode === 'kanban' || viewMode === 'list') && (
          <Button size="sm" onClick={() => setAddTaskStatus('TODO')}>
            <Plus size={15} className="mr-1" /> Add Task
          </Button>
        )}
      </div>

      {/* Main view */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'kanban' && (
          <KanbanBoard
            projectId={projectId}
            onTaskClick={(t) => setSelectedTaskId(t.id)}
            onAddTask={(status) => setAddTaskStatus(status)}
          />
        )}
        {viewMode === 'list' && (
          <div className="overflow-y-auto h-full">
            <TaskList tasks={tasks} onTaskClick={(t) => setSelectedTaskId(t.id)} />
          </div>
        )}
        {viewMode === 'gantt' && (
          <div className="overflow-auto h-full">
            <GanttChart tasks={tasks} />
          </div>
        )}
        {viewMode === 'milestones' && (
          <div className="overflow-y-auto h-full">
            <MilestoneList projectId={projectId} />
          </div>
        )}

        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => setSelectedTaskId(null)} />
        )}
      </div>

      {addTaskStatus && (
        <TaskForm
          projectId={projectId}
          defaultStatus={addTaskStatus}
          onClose={() => setAddTaskStatus(null)}
        />
      )}
    </div>
  )
}
