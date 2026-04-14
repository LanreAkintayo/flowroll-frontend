'use client'

import Navbar from '@/components/shared/Navbar'
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthGuard({ requiredRole: 'employer' })

  // console.log("Inside employer");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  )
}