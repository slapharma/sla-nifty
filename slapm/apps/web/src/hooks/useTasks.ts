import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Task, TaskStatus } from '../types'

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => (await api.get<Task[]>(`/tasks?projectId=${projectId}`)).data,
    enabled: !!projectId,
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}

export function useUpdateTaskPosition(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, position, status }: { taskId: string; position: number; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/position`, { position, status }),
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
    mutationFn: async (data: Partial<Task> & { title: string }) =>
      (await api.post<Task>('/tasks', { ...data, projectId })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<Task> & { assigneeId?: string | null } }) =>
      (await api.patch<Task>(`/tasks/${taskId}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}
