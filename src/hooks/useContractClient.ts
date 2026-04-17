import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { FLOWROLL_CHAIN } from "@/lib/interwoven";
import { getContractsForChain } from "@/lib/contracts/addresses";

export function useContractClient() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: FLOWROLL_CHAIN.id });
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return {
    address: address,
    publicClient,
    writeContractAsync,
    queryClient,
    contracts,
  };
}