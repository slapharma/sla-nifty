import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Division } from '@/types'

// Built-in divisions seeded in the production DB.
// Used as fallback when the /api/divisions endpoint is unavailable.
const BUILTIN_DIVISIONS: Division[] = [
  { id: '58e98095-da9a-4293-9d92-86c3fe9af949', name: 'Anatop',    color: '#3B82F6', createdAt: '', updatedAt: '' },
  { id: '020397c5-82b9-4483-87d7-b10354168dcc', name: 'Alfa',      color: '#10B981', createdAt: '', updatedAt: '' },
  { id: '27630401-5052-408c-bef9-ae29fb310fe5', name: 'Ortem',     color: '#F59E0B', createdAt: '', updatedAt: '' },
  { id: '26247dfe-7652-4c1c-8da6-2c1344192cc5', name: 'SLAHealth', color: '#EF4444', createdAt: '', updatedAt: '' },
  { id: '398a1098-f6a6-4b7d-9c89-eb7bbdbcdbd9', name: 'SLAPharma', color: '#8B5CF6', createdAt: '', updatedAt: '' },
]

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      try {
        const data = (await api.get<Division[]>('/divisions')).data
        return data.length > 0 ? data : BUILTIN_DIVISIONS
      } catch {
        return BUILTIN_DIVISIONS
      }
    },
    placeholderData: BUILTIN_DIVISIONS,
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
