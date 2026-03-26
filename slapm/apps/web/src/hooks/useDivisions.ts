import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Division } from '@/types'

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: async () => (await api.get<Division[]>('/divisions')).data,
    enabled: !!localStorage.getItem('token'),
  })
}
