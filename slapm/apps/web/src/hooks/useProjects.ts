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

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => (await api.get<Project>(`/projects/${projectId}`)).data,
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string; divisionId?: string }) =>
      (await api.post<Project>('/projects', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: { name?: string; description?: string; color?: string } }) =>
      (await api.patch<Project>(`/projects/${projectId}`, data)).data,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['project', project.id] })
    },
  })
}
