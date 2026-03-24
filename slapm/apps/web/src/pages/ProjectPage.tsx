import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { TaskList } from '../components/tasks/TaskList'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { TaskForm } from '../components/tasks/TaskForm'
import { useTasks } from '../hooks/useTasks'
import { Task, TaskStatus } from '../types'
import { LayoutGrid, List, Plus } from 'lucide-react'
import { Button } from '../components/ui/button'

type ViewMode = 'kanban' | 'list'

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
              viewMode === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid size={16} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
              viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-gray-100'
            }`}
          >
            <List size={16} /> List
          </button>
        </div>
        <Button size="sm" onClick={() => setAddTaskStatus('TODO')}>
          <Plus size={16} className="mr-1" /> Add Task
        </Button>
      </div>

      {/* Main view */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            projectId={projectId}
            onTaskClick={setSelectedTask}
            onAddTask={(status) => setAddTaskStatus(status)}
          />
        ) : (
          <div className="overflow-y-auto h-full">
            <TaskList tasks={tasks} onTaskClick={setSelectedTask} />
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
