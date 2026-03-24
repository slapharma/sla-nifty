import { Link, useParams, useLocation } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
  Loader2,
} from 'lucide-react'

export function Sidebar() {
  const { projectId } = useParams()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { data: projects = [], isLoading } = useProjects()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)

  if (!sidebarOpen) return null

  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-none">SLA</div>
          <div className="text-slate-500 text-xs mt-0.5">Project Management</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
            location.pathname === '/'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          )}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        {/* Projects section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Projects
            </span>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <Plus size={14} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-slate-500 text-sm">
              <Loader2 size={14} className="animate-spin" />
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-2 text-slate-600 text-xs">No projects yet</div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors group',
                  projectId === project.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 truncate">{project.name}</span>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-50" />
              </Link>
            ))
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings size={16} />
          Settings
        </Link>
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xs bg-slate-700 text-slate-200">
                {user.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user.name}</div>
              <div className="text-slate-500 text-xs truncate">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
