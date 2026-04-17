'use client'

import { useAccount, useChainId } from 'wagmi'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { truncate } from '@initia/utils'
import type { IdentityState } from '@/types'

// Synchronized identity state across wagmi and interwoven layers
export function useIdentity(): IdentityState {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const chainId = useChainId()
  const { username } = useInterwovenKit()

  const isLoading = isConnecting || isReconnecting

  const displayName = username
    ? username
    : address
    ? truncate(address)
    : null

  return {
    address,
    username: username ?? null,
    displayName,
    isConnected,
    isLoading,
    chainId,
  }
}

// Global protocol wallet actions
export function useWalletActions() {
  const { openConnect, openWallet, openBridge } = useInterwovenKit()
  return { openConnect, openWallet, openBridge }
}