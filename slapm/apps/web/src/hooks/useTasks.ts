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

export function useArchivedTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId, 'archived'],
    queryFn: async () => (await api.get<Task[]>(`/tasks?projectId=${projectId}&status=DONE`)).data,
    enabled: !!projectId,
  })
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => (await api.get<Task>(`/tasks/${taskId}`)).data,
    enabled: !!taskId,
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      api.patch(`/tasks/${taskId}/status`, { status }),
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData<Task[]>(['tasks', projectId])
      qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, status } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] })
    },
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
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] })
    },
  })
}

type CreateTaskInput = Partial<Task> & {
  title: string
  assigneeId?: string
  dueDate?: string
  parentId?: string
  status?: TaskStatus
  priority?: Task['priority']
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateTaskInput) =>
      (await api.post<Task>('/tasks', { ...data, projectId })).data,
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData<Task[]>(['tasks', projectId])
      // Only optimistically add top-level tasks (not subtasks)
      if (!data.parentId) {
        const tempTask: Task = {
          id: `temp-${Date.now()}`,
          title: data.title,
          status: data.status ?? 'TODO',
          priority: data.priority ?? 'MEDIUM',
          position: 999999,
          projectId,
          tags: [],
          creator: { id: '', email: '', name: '...', role: 'MEMBER', createdAt: '' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        qc.setQueryData<Task[]>(['tasks', projectId], (old) => [...(old ?? []), tempTask])
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', projectId] }),
  })
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<Task> & { assigneeId?: string | null; dueDate?: string } }) =>
      (await api.patch<Task>(`/tasks/${taskId}`, data)).data,
    onMutate: async ({ taskId, data }) => {
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      const prev = qc.getQueryData<Task[]>(['tasks', projectId])
      qc.setQueryData<Task[]>(['tasks', projectId], (old) =>
        old?.map((t) => (t.id === taskId ? { ...t, ...data } : t)) ?? []
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev)
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['task', vars.taskId] })
    },
  })
}
