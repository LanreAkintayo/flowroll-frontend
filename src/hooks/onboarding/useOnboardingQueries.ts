"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi } from "viem";

import { useContractClient } from "@/hooks/useContractClient";

interface OnboardingData {
  gas: bigint;
  allowance: bigint;
}

export function useOnboardingQueries(evmAddress: `0x${string}` | undefined) {
  const { publicClient, contracts } = useContractClient();

  const query = useQuery({
    queryKey: ["onboarding-queries", evmAddress],
    queryFn: async (): Promise<OnboardingData> => {
      if (!publicClient || !evmAddress) throw new Error("Client not initialized");

      // Aggregate gas balance and protocol permissions
      const [gas, allowance] = await Promise.all([
        publicClient.getBalance({ address: evmAddress }),
        publicClient.readContract({
          address: contracts.BRIDGED_INIT_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [evmAddress, contracts.FLOWROLL_ZAPPER_ADDRESS as `0x${string}`],
        }),
      ]);

      return { gas, allowance };
    },
    enabled: !!evmAddress && !!publicClient,
    refetchInterval: 5000,
  });

  return {
    evmAddress,
    balances: {
      gas: query.data?.gas ?? 0n,
    },
    currentAllowance: query.data?.allowance ?? 0n,
    refetchBalances: query.refetch,
    isLoadingBalances: query.isLoading,
  };
}