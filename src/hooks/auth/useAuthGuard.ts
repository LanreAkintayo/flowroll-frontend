'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { useIdentity } from '../identity/useIdentity'

interface UseAuthGuardOptions {
  requiredRole?: UserRole
  redirectTo?: string
}

export function useAuthGuard({
  requiredRole,
  redirectTo = '/',
}: UseAuthGuardOptions = {}) {
  const router = useRouter()
  const { isConnected, isLoading, address } = useIdentity()
  const { role, setLastAddress, clearSession } = useAuthStore()

  // useEffect(() => {
  //   // Don't redirect during the reconnection window — avoids flash redirects
  //   if (isLoading) return

  //   if (!isConnected) {
  //     router.replace(redirectTo)
  //     return
  //   }

  //   // Wallet switched mid-session → clear role, re-ask
  //   if (address) {
  //     const last = useAuthStore.getState().lastAddress
  //     if (last && last.toLowerCase() !== address.toLowerCase()) {
  //       clearSession()
  //       router.replace('/select-role')
  //       return
  //     }
  //     setLastAddress(address)
  //   }

  //   // Wrong role for this page
  //   if (requiredRole && role !== requiredRole) {
  //     router.replace(role ? `/${role}` : '/select-role')
  //   }
  // }, [isConnected, isLoading, address, role, requiredRole])

  return { isConnected, isLoading, role }
}