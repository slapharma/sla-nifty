import { useAppStore } from '@/store/useAppStore'
import { Menu } from 'lucide-react'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={toggleSidebar}
        className="text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      {title && (
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      )}
    </header>
  )
}
