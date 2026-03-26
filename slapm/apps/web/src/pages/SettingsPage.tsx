import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { useUsers, useCreateUser, useUpdateUserRole, useDeleteUser } from '@/hooks/useUsers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, X } from 'lucide-react'

type Tab = 'account' | 'team'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  MEMBER: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-slate-100 text-slate-600',
}

function TeamTab() {
  const { data: users = [], isLoading } = useUsers()
  const createUser = useCreateUser()
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()
  const { user: me } = useAuth()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', role: 'MEMBER', password: '' })
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.name || !form.password) { setError('All fields are required'); return }
    createUser.mutate(form, {
      onSuccess: () => { setShowAdd(false); setForm({ email: '', name: '', role: 'MEMBER', password: '' }) },
      onError: (err: any) => setError(err?.response?.data?.error ?? 'Failed to create user'),
    })
  }

  if (isLoading) return <div className="text-slate-500 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>
        {me?.role === 'ADMIN' && (
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" /> Add Member
          </Button>
        )}
      </div>

      {/* Add user form */}
      {showAdd && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 text-sm">New Team Member</h3>
            <button onClick={() => { setShowAdd(false); setError('') }} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium">Name *</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@company.com" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Temporary Password *</label>
              <Input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            {error && <p className="col-span-2 text-xs text-red-500">{error}</p>}
            <div className="col-span-2 flex gap-2">
              <Button type="submit" size="sm" disabled={createUser.isPending}>
                {createUser.isPending ? 'Adding…' : 'Add Member'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => { setShowAdd(false); setError('') }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-4 p-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={u.avatarUrl} />
              <AvatarFallback className="text-sm">{u.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 text-sm">{u.name}</div>
              <div className="text-slate-500 text-xs truncate">{u.email}</div>
            </div>
            {me?.role === 'ADMIN' ? (
              <select
                value={u.role}
                onChange={(e) => updateRole.mutate({ userId: u.id, role: e.target.value })}
                disabled={u.id === me?.id}
                className={`text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none ${roleColors[u.role] ?? ''}`}
              >
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>
            ) : (
              <Badge className={`text-xs border-0 ${roleColors[u.role] ?? ''}`}>{u.role}</Badge>
            )}
            {me?.role === 'ADMIN' && u.id !== me?.id && (
              <button
                onClick={() => { if (confirm(`Remove ${u.name}?`)) deleteUser.mutate(u.id) }}
                className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                title="Remove user"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('account')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'account', label: 'Account' },
    { id: 'team', label: 'Team' },
  ]

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="Settings" />
      <div className="p-6 max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'account' && user && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-xl">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{user.name}</h3>
                <p className="text-slate-500 text-sm">{user.email}</p>
                <Badge className={`mt-1 text-xs border-0 ${roleColors[user.role] ?? 'bg-slate-100'}`}>{user.role}</Badge>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 font-medium">
                Sign out
              </button>
            </div>
          </div>
        )}

        {tab === 'team' && <TeamTab />}
      </div>
    </div>
  )
}
