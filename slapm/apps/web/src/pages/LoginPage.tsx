import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const navigate = useNavigate()

  const handleAdminLogin = () => {
    localStorage.setItem('token', 'demo-admin')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">SLA</h1>
          <p className="text-slate-400 text-sm">SLA Pharma Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Sign in</h2>
          <p className="text-slate-400 text-sm mb-6">
            Continue as Admin to access the project management dashboard
          </p>

          <Button
            onClick={handleAdminLogin}
            className="w-full h-11 font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue as Admin
          </Button>

          <div className="mt-4 text-center text-xs text-slate-500">
            Google SSO will be enabled for the full team launch
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} SLA Pharma Group
        </p>
      </div>
    </div>
  )
}
