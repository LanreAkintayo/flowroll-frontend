'use client'

import Navbar from '@/components/shared/Navbar'
import { useAuthGuard } from '@/hooks/auth/useAuthGuard'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthGuard({ requiredRole: 'employee' })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      {children}
    </div>
  )
}