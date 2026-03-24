import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: string
}

interface Project {
  id: string
  name: string
  color: string
  archived: boolean
}

interface AppState {
  currentUser: User | null
  currentProject: Project | null
  sidebarOpen: boolean
  setCurrentUser: (user: User | null) => void
  setCurrentProject: (project: Project | null) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentProject: null,
  sidebarOpen: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentProject: (project) => set({ currentProject: project }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
