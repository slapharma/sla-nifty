import { useParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { useProjects } from '@/hooks/useProjects'

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: projects = [] } = useProjects()
  const project = projects.find(p => p.id === projectId)

  return (
    <div className="flex flex-col h-full">
      <Header title={project?.name ?? 'Project'} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-300 mb-2">
            <span className="text-4xl">🏗️</span>
          </div>
          <p className="text-slate-500 font-medium">Kanban &amp; List views</p>
          <p className="text-slate-400 text-sm mt-1">Coming in next task...</p>
        </div>
      </div>
    </div>
  )
}
