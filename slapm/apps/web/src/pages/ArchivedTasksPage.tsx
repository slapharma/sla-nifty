import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useArchivedTasks, useTask } from '../hooks/useTasks'
import { TaskDetail } from '../components/tasks/TaskDetail'
import { TaskRow } from '../components/tasks/TaskRow'
import { Header } from '../components/layout/Header'
import { Archive, Search } from 'lucide-react'
import { Task } from '../types'

export function ArchivedTasksPage() {
  const { data: projects = [] } = useProjects()
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('all')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Derive unique divisions from projects
  const divisionMap = new Map<string, { id: string; name: string; color: string }>()
  projects.forEach((p) => {
    if (p.division) divisionMap.set(p.division.id, p.division)
  })
  const divisions = [...divisionMap.values()].sort((a, b) => a.name.localeCompare(b.name))

  // Filter projects by selected division
  const filteredProjects = selectedDivisionId === 'all'
    ? projects
    : projects.filter((p) => (p.divisionId ?? p.division?.id) === selectedDivisionId)

  // Reset project when division changes
  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId)
    setSelectedProjectId('')
    setSelectedTaskId(null)
  }

  const { data: archivedTasks = [], isLoading } = useArchivedTasks(selectedProjectId)
  const { data: fetchedTask } = useTask(selectedTaskId)
  const selectedTask = archivedTasks.find((t) => t.id === selectedTaskId) ?? fetchedTask ?? null

  const filtered = archivedTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Archived Tasks" />

      <div className="p-6 max-w-4xl flex-1">
        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Division</label>
            <select
              value={selectedDivisionId}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white min-w-[160px]"
            >
              <option value="all">All Divisions</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setSelectedTaskId(null) }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white min-w-[200px]"
            >
              <option value="">— Select a project —</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProjectId && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search archived tasks..."
                  className="border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-56"
                />
              </div>
            </div>
          )}
        </div>

        {/* Task list */}
        {!selectedProjectId ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Archive size={40} className="opacity-30" />
            <p className="text-sm">Select a project to view archived tasks</p>
          </div>
        ) : isLoading ? (
          <div className="text-slate-400 text-sm py-8 text-center">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Archive size={40} className="opacity-30" />
            <p className="text-sm">{search ? 'No matching archived tasks' : 'No archived tasks in this project'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <ArchivedTaskRow key={task.id} task={task} onClick={(t) => setSelectedTaskId(t.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onSubtaskClick={(id) => setSelectedTaskId(id)}
        />
      )}
    </div>
  )
}

function ArchivedTaskRow({ task, onClick }: { task: Task; onClick: (t: Task) => void }) {
  const completedDate = task.completedAt
    ? new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const priorityColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  }

  return (
    <tr
      onClick={() => onClick(task)}
      className="border-b border-gray-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <td className="py-3 px-4">
        <span className="text-sm text-slate-700 line-through opacity-60">{task.title}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority] ?? ''}`}>
          {task.priority}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-500">
        {task.assignee?.name ?? '—'}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500">
        {completedDate}
      </td>
    </tr>
  )
}
