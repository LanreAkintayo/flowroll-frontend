import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWatchContractEvent,
} from "wagmi";
import { FLOWROLL_CHAIN } from "@/lib/interwoven";
import { PAYROLL_MANAGER_ABI, YIELD_ROUTER_ABI } from "@/lib/contracts/abis";
import { getContractsForChain } from "@/lib/contracts/addresses";
import { useContractClient } from "../useContractClient";
import { flowLog } from "@/lib/utils";
import {
  ACTION_TYPES,
  FormattedAgentLog,
  LiveYieldData,
  PayrollCycle,
  PayrollGroup,
  PoolData,
  PoolDetails,
  PoolEntry,
} from "@/types";
import { formatUnits, parseAbiItem } from "viem";
import { useGroupDetails } from "../payroll/usePayrollQueries";
import { parseAbi } from "viem";
import { POOL_ABI } from "@/lib/contracts/abis/pool";
import { resumePluginState } from "next/dist/build/build-context";

export function useAgentStatus() {
  return useQuery({
    queryKey: ["agent-heartbeat"],
    queryFn: async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AGENT_URL}/status`);
        if (!res.ok) return false;
        const data = await res.json();
        return data.status === "ok";
      } catch (e) {
        return false;
      }
    },
    refetchInterval: 3000,
    retry: false,
    initialData: false,
  });
}

export function usePayrollCycle(address: `0x${string}` | undefined, cycleId: bigint | undefined) {

  const { publicClient } = useContractClient();
  // const { data: group } = useGroupDetails(address, groupId);

  // const cycleId = group ? (group.activeCycleId as bigint) : undefined;

  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["payroll-cycle", address, cycleId?.toString()],
    queryFn: async (): Promise<PayrollCycle> => {
      const result = await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "getCycle",
        args: [address!, cycleId!],
      });

      flowLog("usePayrollCycle", result);

      return result as unknown as PayrollCycle;
    },
    enabled: !!address && cycleId !== undefined,
  });
}


// export function usePayrollCycle(
//   address: `0x${string}` | undefined, 
//   groupId: bigint | undefined,
//   explicitCycleId?: bigint // <-- NEW: 3rd optional parameter
// ) {

//   const { publicClient } = useContractClient();
  
//   // React rules dictate hooks must always be called, but if groupId is undefined, this query will just stay disabled.
//   const { data: group } = useGroupDetails(address, groupId);

//   // THE LOGIC: Prioritize explicitCycleId. If it's undefined, fall back to the group's activeCycleId.
//   // We use !== undefined because 0n is a valid cycleId but is considered "falsy" in JavaScript.
//   const cycleId = explicitCycleId !== undefined 
//     ? explicitCycleId 
//     : (group?.activeCycleId as bigint | undefined);

//   const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

//   return useQuery({
//     queryKey: ["payroll-cycle", address, cycleId?.toString()],
//     queryFn: async (): Promise<PayrollCycle> => {
//       const result = await publicClient!.readContract({
//         address: contracts.YIELD_ROUTER_ADDRESS,
//         abi: YIELD_ROUTER_ABI,
//         functionName: "getCycle",
//         args: [address!, cycleId!],
//       });

//       flowLog("usePayrollCycle", result);

//       return result as unknown as PayrollCycle;
//     },
//     // The query will only run once we have a valid cycleId resolved from either source
//     enabled: !!address && cycleId !== undefined,
//   });
// }



export function useLiveYield(address: `0x${string}` | undefined, cycleId: bigint | undefined) {
  const { publicClient } = useContractClient();
  // const { data: group } = useGroupDetails(address, groupId);

  // const cycleId = group ? (group.activeCycleId as bigint) : undefined;
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["live-yield", address, cycleId?.toString()],
    queryFn: async (): Promise<LiveYieldData> => {
      const result = await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "getLiveYield",
        args: [address!, cycleId!],
      }) as [bigint, bigint, boolean];

      // Mapping the array tuple into a clean object for your UI
      return {
        totalValue: result[0],
        netYield: result[1],
        isLoss: result[2],
      };
    },
    // Only run this query if we have the address, the publicClient, and a valid cycleId
    enabled: !!address && !!publicClient && cycleId !== undefined,
  });
}


// export function usePools() {
//   const { publicClient, contracts } = useContractClient();

//   return useQuery({
//     queryKey: ["all-pools"],
//     queryFn: async (): Promise<PoolEntry[]> => {
//       // Step 1: Get total number of pools
//       const count = (await publicClient!.readContract({
//         address: contracts.YIELD_ROUTER_ADDRESS,
//         abi: YIELD_ROUTER_ABI,
//         functionName: "getPoolCount",
//       })) as bigint;

//       const poolCount = Number(count);

//       flowLog("Pool Count: ", poolCount);
//       if (poolCount === 0) return [];

//       // Step 2: Fetch all pools in parallel
//       const poolPromises = Array.from({ length: poolCount }).map(
//         async (_, index) => {
//           const result = await publicClient!.readContract({
//             address: contracts.YIELD_ROUTER_ADDRESS,
//             abi: YIELD_ROUTER_ABI,
//             functionName: "getPool",
//             args: [BigInt(index)],
//           });

//         //   flowLog("Index: ", index, "Result: ", result);
//           return result as unknown as PoolEntry;
//         },
//       );

//       const results = await Promise.all(poolPromises);
//       return results as unknown as PoolEntry[];
//     },
//   });
// }

export function usePools() {
  const { contracts } = useContractClient();

  // Step 1: Automatically fetch the total number of pools
  const { data: count, isLoading: loadingCount } = useReadContract({
    address: contracts.YIELD_ROUTER_ADDRESS,
    abi: YIELD_ROUTER_ABI,
    functionName: "getPoolCount",
  });

  const poolCount = Number(count || 0n);

  // Step 2: Dynamically build the multicall array based on the count
  const poolCalls = Array.from({ length: poolCount }).map((_, index) => ({
    address: contracts.YIELD_ROUTER_ADDRESS,
    abi: YIELD_ROUTER_ABI,
    functionName: "getPool",
    args: [BigInt(index)],
  }));

  // Step 3: Fetch all pools in exactly ONE network request
  const query = useReadContracts({
    contracts: poolCalls,
    query: {
      enabled: poolCount > 0,
    },
  });

  // Step 4: Clean up, Filter, and Deduplicate the Wagmi response
  const pools: PoolEntry[] = query.data
    ? query.data
      // 1. Extract the actual result object
      .map((res) => res.result as unknown as PoolEntry)
      // 2. Filter out any undefined/failed RPC calls
      .filter(Boolean)
      // 3. Only keep pools where isActive is strictly true
      .filter((pool) => pool.isActive === true)
      // 4. Remove exact duplicates based on the pool address
      .filter(
        (pool, index, self) =>
          index === self.findIndex((p) => p.pool === pool.pool),
      )
    : [];

  return {
    data: pools,
    isLoading: loadingCount || query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// export function usePoolDetails(poolAddress: `0x${string}` | undefined) {
//   // const {contracts} = useContractClient();

//   // Wagmi's useReadContracts accepts an array of contract calls
//   const query = useReadContracts({
//     contracts: poolAddress
//       ? [
//           { address: poolAddress, abi: POOL_ABI, functionName: "name" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "symbol" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "poolName" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "apyBps" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "isStablePair" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "totalAssets" },
//           { address: poolAddress, abi: POOL_ABI, functionName: "totalSupply" },
//         ]
//       : [],
//     query: {
//       enabled: !!poolAddress,
//       // Cache this data for 5 minutes so we don't spam the RPC every re-render
//       staleTime: 1000 * 60 * 5,
//     },
//   });

//   // Wagmi returns an array of results in the exact order we requested them.
//   // Each item looks like { error, result, status }
//   const details: PoolDetails | null = query.data
//     ? {
//         name: query.data[0]?.result as string | undefined,
//         symbol: query.data[1]?.result as string | undefined,
//         poolName: query.data[2]?.result as string | undefined,
//         apyBps: query.data[3]?.result as bigint | undefined,
//         isStablePair: query.data[4]?.result as boolean | undefined,
//         totalAssets: query.data[5]?.result as bigint | undefined,
//         totalSupply: query.data[6]?.result as bigint | undefined,
//       }
//     : null;

//   return {
//     data: details,
//     isLoading: query.isLoading,
//     isError: query.isError,
//     refetch: query.refetch,
//   };
// }

export function usePoolDetails(poolAddress: `0x${string}` | undefined) {
  const { publicClient } = useContractClient();

  return useQuery({
    // We are back in control! A beautiful, simple query key.
    queryKey: ["pool-details", poolAddress],
    queryFn: async (): Promise<PoolDetails> => {

      const [
        name, symbol, poolName, apyBps, isStablePair, totalAssets, totalSupply
      ] = await Promise.all([
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "name" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "symbol" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "poolName" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "apyBps" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "isStablePair" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "totalAssets" }),
        publicClient!.readContract({ address: poolAddress!, abi: POOL_ABI, functionName: "totalSupply" }),
      ]);

      return {
        name: name as string,
        symbol: symbol as string,
        poolName: poolName as string,
        apyBps: apyBps as bigint,
        isStablePair: isStablePair as boolean,
        totalAssets: totalAssets as bigint,
        totalSupply: totalSupply as bigint,
      };
    },
    enabled: !!poolAddress,
    staleTime: 1000 * 60 * 5,
  });
}

// 2. THE SUPER HOOK: Allocation + USDC Value (Auto-updates on AgentAction)
export function usePoolData(
  cycleId: bigint | undefined,
  poolIndex: bigint | undefined,
  poolAddress: `0x${string}` | undefined,
) {
  const { address, publicClient, contracts } = useContractClient();
  // const { data: group } = useGroupDetails(address, groupId);
  // const cycleId = group ? (group.activeCycleId as bigint) : undefined;

  return useQuery({
    queryKey: ["pool-data", address, cycleId?.toString(), poolIndex?.toString()],
    queryFn: async (): Promise<PoolData> => {
      const shares = (await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "poolAllocations",
        args: [address!, cycleId!, poolIndex!],
      })) as bigint;

      let valueUsdc = 0n;
      if (shares > 0n && poolAddress) {
        valueUsdc = (await publicClient!.readContract({
          address: poolAddress,
          abi: POOL_ABI,
          functionName: "sharesToValue",
          args: [shares],
        })) as bigint;
      }
      return { shares, valueUsdc };
    },
    enabled: !!address && !!cycleId && poolIndex !== undefined && !!poolAddress,
  });
}
// 3. CALCULATE LIQUID BUFFER
export function useCycleBuffer(groupId: bigint | undefined) {
  const { publicClient, contracts, address } = useContractClient();
  const { data: group } = useGroupDetails(address,groupId);
  const cycleId = group ? (group.activeCycleId as bigint) : undefined;
  // flowLog("We are inside use cycle buffer with address and cycle id", address, cycleId)


  return useQuery({
    queryKey: ["cycle-buffer", address, cycleId?.toString()],
    queryFn: async () => {
      const result = await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "calculateBuffer",
        args: [address!, cycleId!],
      });

      // flowLog("Buffer amount inside useCycleBuffer: ", result)

      // Returns a tuple: [bufferAmount, bufferBps, timeLeft]
      const [bufferAmount, bufferBps, timeLeft] = result as [
        bigint,
        bigint,
        bigint,
      ];
      return { bufferAmount, bufferBps, timeLeft };
    },
    enabled: !!address && cycleId !== undefined,
  });
}

// 4. CALCULATE IDLE AMOUNT
export function useCycleIdleAmount(groupId: bigint | undefined) {
  const { publicClient, contracts, address } = useContractClient();
  const { data: group } = useGroupDetails(address, groupId);
  const cycleId = group ? (group.activeCycleId as bigint) : undefined;

  return useQuery({
    queryKey: ["cycle-idle", address, cycleId?.toString()],
    queryFn: async (): Promise<bigint> => {
      const result = await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "calculateIdleAmount",
        args: [address!, cycleId!],
      });
      return result as bigint;
    },
    enabled: !!address && cycleId !== undefined,
  });
}

export function useAgentSync(groupId: bigint | undefined) {
  const { address, queryClient, contracts } = useContractClient();
  const { data: group } = useGroupDetails(address, groupId);
  const cycleId = group ? (group.activeCycleId as bigint) : undefined;

  // flowLog("Setting up Agent Sync for groupId:", groupId, "cycleId:", cycleId , "address:", address);

  useWatchContractEvent({
    address: contracts.YIELD_ROUTER_ADDRESS,
    abi: YIELD_ROUTER_ABI,
    eventName: "AgentAction",
    // We only attach the listener if we have the address and cycleId
    args: (address && cycleId) ? {
      caller: address,
      cycleId: cycleId,
    } : undefined,
    enabled: !!(address && cycleId),
    onLogs(logs) {
      flowLog("🔥 Agent Action! Refreshing all pool data...", logs);
      queryClient.invalidateQueries({
        queryKey: ["pool-data", address],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: ["pool-details"],
        exact: false
      });
      queryClient.invalidateQueries({ queryKey: ["agent-logs", address, cycleId?.toString()], exact: false });
      queryClient.invalidateQueries({ queryKey: ["cycle-buffer", address, cycleId?.toString()], exact: false });
      queryClient.invalidateQueries({ queryKey: ["payroll-cycle", address, cycleId?.toString()], exact: false });
      queryClient.invalidateQueries({ queryKey: ["disbursement-record", address, cycleId?.toString()], exact: false });
      queryClient.invalidateQueries({ queryKey: ["cycle-settled", address, cycleId?.toString()], exact: false });
    },
  });
}

export function useAgentLogs(cycleId: bigint | undefined) {
  const { address, publicClient, contracts } = useContractClient();
  // const { data: group } = useGroupDetails(address, groupId);
  // const cycleId = group ? (group.activeCycleId as bigint) : undefined;

  return useQuery({
    queryKey: ["agent-logs", address, cycleId?.toString()],
    queryFn: async (): Promise<FormattedAgentLog[]> => {

      // 1. Get the exact second the cycle started from the contract
      const cycle = await publicClient!.readContract({
        address: contracts.YIELD_ROUTER_ADDRESS,
        abi: YIELD_ROUTER_ABI,
        functionName: "getCycle",
        args: [address!, cycleId!],
      });
      const cycleStartTime = Number(cycle.cycleStartTime);
      const TARGET_ACTIONS = [0, 1, 2, 5];

      // 2. Fetch the highly-filtered historical logs
      const logs = await publicClient!.getLogs({
        address: contracts.YIELD_ROUTER_ADDRESS,
        event: YIELD_ROUTER_ABI.find((x) => x.type === "event" && x.name === "AgentAction") as any,
        args: {
          caller: address,
          cycleId: cycleId,
          actionType: TARGET_ACTIONS,
        },
        fromBlock: contracts.PAYROLL_MANAGER_DEPLOYMENT_BLOCK,
        toBlock: "latest",
      });

      // 3. Format the data into "Tush" terminal outputs
      const formattedLogs = logs.map((log) => {
        const { actionType, amountMoved, fromPoolIndex, toPoolIndex, timeIntoCycle } = log.args as any;

        const amountUsdc = amountMoved
          ? Number(formatUnits(amountMoved, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "0.00";

        // The True Historical Timestamp Calculation
        const exactTimestampMs = (cycleStartTime + Number(timeIntoCycle)) * 1000;
        const formattedTime = new Date(exactTimestampMs).toLocaleTimeString();

        let message = "";
        let type: "info" | "success" | "warning" | "error" = "info";

        if (actionType === 0) {
          message = `[INIT] Payroll Cycle #${cycleId} initialized. Agent has begun monitoring yields.`;
          type = "info";
        }
        else if (actionType === 1) {
          message = `[REBALANCE] Agent moved ${amountUsdc} USDC from ${fromPoolIndex > 10 ? `Payroll Reserve` : `Pool ${fromPoolIndex}`} to Pool ${toPoolIndex} to optimize yield score.`;
          type = "success";
        }
        else if (actionType === 2) {
          message = `[LIQUIDITY] Agent withdrew ${amountUsdc} USDC from yield pools back to the Payroll Reserve to secure upcoming payday.`;
          type = "warning";
        }
        else if (actionType === 5) {
          message = `[PAYDAY] Cycle complete. All required funds are successfully unlocked for payroll disbursement.`;
          type = "success";
        }

        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          timestamp: formattedTime,
          message,
          type,
        };
      });

      return formattedLogs;
    },
    enabled: !!address && cycleId !== undefined,
  });
}