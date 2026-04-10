'use client'

import { useAccount, useChainId } from 'wagmi'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { truncate } from '@initia/utils'
import type { IdentityState } from '@/types'

// useIdentity merges two separate layers:
//   wagmi  → EVM address, chainId (used for all contract calls)
//   InterwovenKit → username (.init name, used for display only)
//
// Always use this hook instead of reaching into wagmi or InterwovenKit
// directly — it keeps the two-layer complexity in one place.
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

// useWalletActions is separate so components that only read identity state
// don't import action references unnecessarily.
export function useWalletActions() {
  const { openConnect, openWallet, openBridge } = useInterwovenKit()
  return { openConnect, openWallet, openBridge }
}