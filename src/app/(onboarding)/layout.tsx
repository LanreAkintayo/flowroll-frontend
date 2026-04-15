'use client'

import Navbar from '@/components/shared/Navbar'
import { useAuthGuard } from '@/hooks/auth/useAuthGuard';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  )
}