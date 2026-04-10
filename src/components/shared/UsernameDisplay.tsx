'use client'

import { useIdentity } from '@/hooks/identity/useIdentity'

interface Props {
  variant?: 'badge' | 'inline'
  showAddressTooltip?: boolean
  className?: string
}

export default function UsernameDisplay({ variant = 'badge', showAddressTooltip = true, className = '' }: Props) {
  const { username, address, displayName, isConnected, isLoading } = useIdentity()

  if (isLoading) {
    return <span className={`inline-block h-5 w-24 rounded bg-surface-700 animate-pulse ${className}`} />
  }

  if (!isConnected || !displayName) return null

  const tooltip = showAddressTooltip && address ? { title: address } : {}

  if (variant === 'inline') {
    return (
      <span className={`font-medium ${username ? 'text-teal-400' : 'text-surface-300'} ${className}`} {...tooltip}>
        {displayName}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${username ? 'bg-teal-900/40 border border-teal-700/40 text-teal-300' : 'bg-surface-800 border border-surface-700 text-surface-300'} ${className}`}
      {...tooltip}
    >
      {username ? (
        <>
          <span>{username.replace(/\.init$/, '')}</span>
          <span className="text-teal-500 opacity-70">.init</span>
        </>
      ) : (
        <span>{displayName}</span>
      )}
    </span>
  )
}