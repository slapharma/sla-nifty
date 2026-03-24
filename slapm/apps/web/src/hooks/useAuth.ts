import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useAppStore } from '@/store/useAppStore'
import type { User } from '@/types'

const DEMO_ADMIN: User = {
  id: 'demo-admin',
  email: 'admin@slapharmagroup.com',
  name: 'Admin',
  role: 'ADMIN',
  createdAt: new Date().toISOString(),
}

export function useAuth() {
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const isDemoMode = localStorage.getItem('token') === 'demo-admin'

  // Seed the store immediately for demo mode so sidebar renders correctly
  useEffect(() => {
    if (isDemoMode) setCurrentUser(DEMO_ADMIN)
  }, [isDemoMode, setCurrentUser])

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      if (isDemoMode) return DEMO_ADMIN
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
