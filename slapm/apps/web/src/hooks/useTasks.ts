import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { demoStore } from '../lib/demoStore'
import { Task, TaskStatus } from '../types'

const isDemoMode = () => localStorage.getItem('token') === 'demo-admin'

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (isDemoMode()) return demoStore.getTasks(projectId)
      return (await api.get<Task[]>(`/tasks?projectId=${projectId}`)).data
    },
    enabled: !!projectId,
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      if (isDemoMode()) return demoStore.updateTask(taskId, { status })
      return api.patch(`/tasks/${taskId}/status`, { status })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}

export function useUpdateTaskPosition(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, position, status }: { taskId: string; position: number; status: TaskStatus }) => {
      if (isDemoMode()) return demoStore.updateTask(taskId, { position, status })
      return api.patch(`/tasks/${taskId}/position`, { position, status })
    },
    onMutate: async ({ taskId, position, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData<Task[]>(['tasks', projectId])
      qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, position, status } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Task> & { title: string }) => {
      if (isDemoMode()) return demoStore.createTask({ ...data, projectId })
      return (await api.post<Task>('/tasks', { ...data, projectId })).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}
