import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function SettingsPage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Settings" />
      <div className="p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Account</h2>
        {user && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-xl">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{user.name}</h3>
                <p className="text-slate-500 text-sm">{user.email}</p>
                <Badge className="mt-1 text-xs" variant="secondary">{user.role}</Badge>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
