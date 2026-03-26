import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Project } from '@/types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
    enabled: !!localStorage.getItem('token'),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) =>
      (await api.post<Project>('/projects', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
