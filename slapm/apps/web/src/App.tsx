import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AuthCallback } from '@/components/auth/AuthCallback'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ArchivedTasksPage } from '@/pages/ArchivedTasksPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="projects/:projectId" element={<ProjectPage />} />
            <Route path="archive" element={<ArchivedTasksPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
