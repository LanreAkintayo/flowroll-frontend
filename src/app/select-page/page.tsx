'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import UsernameDisplay from '@/components/shared/UsernameDisplay'
import type { UserRole } from '@/types'

// This page is only reached when the auth guard detects a wallet switch
// mid-session and clears the stored role. The user re-selects their role
// without needing to reconnect their wallet.
export default function SelectRolePage() {
  const router = useRouter()
  const { setRole } = useAuthStore()

  function handleSelect(role: UserRole) {
    setRole(role)
    router.push(`/${role}`)
  }

  return (
    <div className="page-bg flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-6 text-center">
        <UsernameDisplay variant="badge" className="mb-3" />
        <h1 className="text-xl font-semibold text-white">Who are you on this wallet?</h1>
        <p className="text-surface-400 text-sm mt-1">
          Wallet changed — please re-select your role to continue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {([
          { role: 'employer' as UserRole, label: 'Employer' },
          { role: 'employee' as UserRole, label: 'ee' },
        ]).map(({ role, label }) => (
          <button
            key={role}
            onClick={() => handleSelect(role)}
            className="p-5 rounded-2xl bg-surface-800 border border-surface-700 hover:border-violet-600/50 hover:shadow-violet text-white font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}