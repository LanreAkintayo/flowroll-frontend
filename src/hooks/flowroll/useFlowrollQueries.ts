import { useQuery } from "@tanstack/react-query";
import { useContractClient } from "@/hooks/useContractClient";
import { FLOWROLL_CREDIT_ABI } from "@/lib/contracts/abis";
// Adjust this import path based on where your ABI and addresses are stored

export function useAdvanceInfo() {
  const { publicClient, address, contracts } = useContractClient();

  return useQuery({
    queryKey: ["advance-info", address],
    queryFn: async () => {
      const data = await publicClient!.readContract({
        address: contracts.FLOWROLL_CREDIT_ADDRESS, 
        abi: FLOWROLL_CREDIT_ABI,
        functionName: "getAdvanceInfo",
        args: [address!],
      });

      // Viem returns multiple outputs as an array of bigints
      const [pendingSalary, currentDebt, maxAvailableToDraw, currentFeeBps] = data as [bigint, bigint, bigint, bigint];

      return {
        pendingSalary,
        currentDebt,
        maxAvailableToDraw,
        currentFeeBps,
      };
    },
    enabled: !!address && !!publicClient,
  });
}