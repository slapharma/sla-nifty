import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { demoStore } from '@/lib/demoStore'
import type { Project } from '@/types'

const isDemoMode = () => localStorage.getItem('token') === 'demo-admin'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (isDemoMode()) return demoStore.getProjects()
      return (await api.get<Project[]>('/projects')).data
    },
    enabled: !!localStorage.getItem('token'),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      if (isDemoMode()) return demoStore.createProject(data)
      return (await api.post<Project>('/projects', data)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
