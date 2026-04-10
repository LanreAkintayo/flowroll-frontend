'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { useIdentity, useWalletActions } from '@/hooks/useIdentity'
import { useAuthStore } from '@/store/authStore'
import UsernameDisplay from '@/components/shared/UsernameDisplay'
import type { UserRole } from '@/types'
import { useIdentity, useWalletActions } from '@/hooks/identity/useIdentity'

export default function HomePage() {
  const router = useRouter()
  const { isConnected, isLoading } = useIdentity()
  const { openConnect } = useWalletActions()
  const { role, setRole } = useAuthStore()

  // Already connected with a role → skip straight to their dashboard
  // useEffect(() => {
  //   if (isConnected && role) {
  //     router.replace(`/${role}`)
  //   }
  // }, [isConnected, role, router])

  function handleRoleSelect(selected: UserRole) {
    setRole(selected)
    if (!isConnected) {
      // Store the role so we can route after wallet connect lands
      openConnect()
      return
    }
    router.push(`/${selected}`)
  }

  return (
    <div className="page-bg flex flex-col items-center justify-center min-h-screen px-4">

      {/* Brand */}
      <div className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <FlowrollLogo />
          <span className="text-2xl font-bold tracking-tight text-white">Flowroll</span>
        </div>
        <p className="text-surface-400 text-base max-w-sm leading-relaxed">
          Your payroll funds earn{' '}
          <span className="text-teal-400 font-medium">yield</span>{' '}
          between deposit and payday. Payroll that pays for itself.
        </p>
      </div>

      {/* Username if connected */}
      {isConnected && (
        <div className="mb-6 animate-fade-in">
          <UsernameDisplay variant="badge" />
        </div>
      )}

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg animate-slide-up">
        <RoleCard
          title="I'm an Employer"
          description="Deposit once, organize groups, let yield cover payroll costs."
          icon={<BuildingIcon />}
          onSelect={() => handleRoleSelect('employer')}
          disabled={isLoading}
        />
        <RoleCard
          title="I'm an Employee"
          description="Claim salary, route it cross-chain, or leave it earning."
          icon={<PersonIcon />}
          onSelect={() => handleRoleSelect('employee')}
          disabled={isLoading}
        />
      </div>

      {isConnected && !role && (
        <p className="mt-5 text-surface-500 text-sm animate-fade-in">
          Choose your role to enter the app
        </p>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleCard({
  title,
  description,
  icon,
  onSelect,
  disabled,
}: {
  title: string
  description: string
  icon: React.ReactNode
  onSelect: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="
        group text-left p-6 rounded-2xl
        bg-surface-800 border border-surface-700
        hover:border-violet-600/50 hover:bg-surface-700/60
        hover:shadow-violet
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
        disabled:opacity-50 disabled:cursor-wait
      "
    >
      <div className="w-10 h-10 rounded-xl bg-violet-900/50 border border-violet-700/30 flex items-center justify-center mb-4 group-hover:bg-violet-800/50 transition-colors">
        <span className="text-violet-300">{icon}</span>
      </div>
      <h2 className="text-white font-semibold mb-1">{title}</h2>
      <p className="text-surface-400 text-sm leading-relaxed">{description}</p>
    </button>
  )
}

function FlowrollLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="13" stroke="#7c3aed" strokeWidth="2" />
      <path d="M9 14 C9 10 12 8 14 8 C16 8 19 10 19 14" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M9 14 C9 18 12 20 14 20 C16 20 19 18 19 14" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="14" r="2" fill="#14b8a6" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="12" rx="1" />
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}