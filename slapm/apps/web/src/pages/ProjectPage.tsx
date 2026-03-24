import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskList } from '../components/tasks/TaskList'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { TaskForm } from '../components/tasks/TaskForm'
import { GanttChart } from '../components/gantt/GanttChart'
import { MilestoneList } from '../components/milestones/MilestoneList'
import { useTasks } from '../hooks/useTasks'
import { Task, TaskStatus } from '../types'
import { LayoutGrid, List, GanttChart as GanttIcon, Flag, Plus } from 'lucide-react'
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null)
  const { data: tasks = [] } = useTasks(projectId ?? '')

  if (!projectId) return null

  return (
    <div className="flex flex-col h-full">
      {/* View switcher toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
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
            onTaskClick={setSelectedTask}
            onAddTask={(status) => setAddTaskStatus(status)}
          />
        )}
        {viewMode === 'list' && (
          <div className="overflow-y-auto h-full">
            <TaskList tasks={tasks} onTaskClick={setSelectedTask} />
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

        {/* Task detail slide-in */}
        {selectedTask && (
          <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </div>

      {/* New task modal */}
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
