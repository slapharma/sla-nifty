import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import type { User } from '@/types'

export function useAuth() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<User>('/auth/me')
      setCurrentUser(res.data)
      return res.data
    },
    enabled: !!localStorage.getItem('token'),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 min
  })

  const logout = () => {
    localStorage.removeItem('token')
    useAppStore.getState().setCurrentUser(null)
    window.location.href = '/login'
  }

  return { user, isLoading, error, logout }
}
