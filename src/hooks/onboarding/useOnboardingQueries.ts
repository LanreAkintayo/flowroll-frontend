import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { useContractClient } from '@/hooks/useContractClient';
import { useAddressConversion } from '@/hooks/identity/useAddressConversion';
import { erc20Abi, formatEther, formatUnits } from 'viem';

export function useOnboardingQueries(evmAddress: `0x${string}` | undefined) {
  const { initiaAddress } = useInterwovenKit();
  const { publicClient, contracts } = useContractClient();


  const { data, refetch, isLoading } = useQuery({
    // You own this key! Invalidate it freely from useZapperActions
    queryKey: ['onboarding-queries', evmAddress],
    queryFn: async () => {
      // Parallel execution via Promise.all (No Multicall contract needed)
      const [gas, init, usdc, allowance] = await Promise.all([
        publicClient!.getBalance({ address: evmAddress! }),
        publicClient!.readContract({
          address: contracts.BRIDGED_INIT_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [evmAddress!],
        }),
        publicClient!.readContract({
          address: contracts.USDC_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [evmAddress!],
        }),
        publicClient!.readContract({
          address: contracts.BRIDGED_INIT_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [evmAddress!, contracts.FLOWROLL_ZAPPER_ADDRESS as `0x${string}`],
        }),
      ]);

      return {
        gas,
        init,
        usdc,
        allowance
      };
    },
    enabled: !!evmAddress && !!publicClient,
    refetchInterval: 5000,
  });

  return {
    evmAddress,
    balances: {
      gas: data?.gas || 0n,
      init: data?.init || 0n,
      usdc: data?.usdc || 0n,
    },
    currentAllowance: data?.allowance || 0,
    refetchBalances: refetch,
    isLoadingBalances: isLoading,
  };
}