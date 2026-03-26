import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Division } from '@/types'

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: async () => (await api.get<Division[]>('/divisions')).data,
    enabled: !!localStorage.getItem('token'),
  })
}

export function useCreateDivision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; color: string }) =>
      (await api.post<Division>('/divisions', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['divisions'] }),
  })
}
