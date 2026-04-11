// src/hooks/usePayrollQueries.ts

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { FLOWROLL_CHAIN } from "@/lib/interwoven";
import { PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
import { getContractsForChain } from "@/lib/contracts/addresses";
import { useContractClient } from "../useContractClient";
import { flowLog } from "@/lib/utils";
import { EmployeePayrollGroup, PayrollGroup } from "@/types";
import { parseAbiItem } from "viem";

export function usePayrollQueries() {
  const { address } = useAccount();
  const { publicClient } = useContractClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  const isRegistered = useQuery({
    queryKey: ["is-registered", address],
    queryFn: async () => {
      return await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "isRegistered",
        args: [address!],
      });
    },
    enabled: !!address,
  });

  const employerProfile = useQuery({
    queryKey: ["employer-profile", address],
    queryFn: async () => {
      return await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "getEmployer",
        args: [address!],
      });
    },
    enabled: !!address,
  });

  const yieldRouterAddress = useQuery({
    queryKey: ["yield-router-address"],
    queryFn: async () => {
      const routerAddress = await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "yieldRouter",
      });

      flowLog("Yield Router Address: ", routerAddress);
      return routerAddress;
    },
  });

  const payrollDispatcherAddress = useQuery({
    queryKey: ["payroll-dispatcher-address"],
    queryFn: async () => {
      return await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "payrollDispatcher",
      });
    },
  });

  return {
    isRegistered,
    employerProfile,
    yieldRouterAddress,
    payrollDispatcherAddress,
  };
}

export function useGroupDetails(address: `0x${string}` | undefined, groupId: bigint | undefined) {

  const { publicClient } = useContractClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["payroll-group", address, groupId?.toString()],
    queryFn: async (): Promise<PayrollGroup> => {
      const group = await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "getGroup",
        args: [address!, groupId!],
      });

      return group as PayrollGroup;
    },
    enabled: !!address && groupId !== undefined,
  });
}

export function useGroupEmployees(groupId: bigint | undefined) {
  const { address } = useAccount();
  const { publicClient } = useContractClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["group-employees", address, groupId?.toString()],
    queryFn: async (): Promise<string[]> => {
      const groupEmployees = await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "getGroupEmployees",
        args: [address!, groupId!],
      });
      return groupEmployees as string[];
    },
    enabled: !!address && groupId !== undefined,
  });
}

export function useEmployerGroups() {
  const { address } = useAccount();
  const { publicClient, contracts } = useContractClient();

  return useQuery({
    queryKey: ["employer-groups", address],
    queryFn: async (): Promise<PayrollGroup[]> => {
      const logs = await publicClient!.getLogs({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        event: parseAbiItem(
          "event GroupCreated(address indexed employer, uint256 indexed groupId, string name)"
        ),
        args: {
          employer: address!,
        },
        fromBlock: contracts.PAYROLL_MANAGER_DEPLOYMENT_BLOCK,
        toBlock: "latest",
      });

      const ids = Array.from(new Set(logs.map((log) => log.args.groupId as bigint)));

      if (ids.length === 0) return [];

      const groupPromises = ids.map(async (id) => {
        const groupData = await publicClient!.readContract({
          address: contracts.PAYROLL_MANAGER_ADDRESS,
          abi: PAYROLL_MANAGER_ABI,
          functionName: "getGroup",
          args: [address!, id],
        });

        return {
          groupId: id,
          ...(groupData as any),
        } as PayrollGroup;
      });

      return await Promise.all(groupPromises);
    },
    enabled: !!address && !!publicClient,
  });
}

export function useGroupEmployeesWithSalaries(groupId: bigint | undefined) {
  const { address } = useAccount();
  const { publicClient } = useContractClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  const { data: employees } = useGroupEmployees(groupId);

  return useQuery({
    queryKey: [
      "group-employees-salaries",
      address,
      groupId?.toString(),
      employees,
    ],
    queryFn: async () => {
      if (!employees || employees.length === 0) return [];

      const salaries = await Promise.all(
        employees.map((employee) =>
          publicClient!.readContract({
            address: contracts.PAYROLL_MANAGER_ADDRESS,
            abi: PAYROLL_MANAGER_ABI,
            functionName: "getSalary",
            args: [address!, groupId!, employee as `0x${string}`],
          }),
        ),
      );

      return employees.map((employee, i) => ({
        address: employee,
        salary: salaries[i] as bigint,
      }));
    },
    enabled:
      !!address && groupId !== undefined && !!employees && employees.length > 0,
  });
}

export function useTotalPayroll(groupId: bigint | undefined) {
  const { address } = useAccount();
  const { publicClient } = useContractClient();
  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["total-payroll", address, groupId?.toString()],
    queryFn: async (): Promise<bigint> => {
      const totalPayroll = await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "getTotalPayroll",
        args: [address!, groupId!],
      });
      return totalPayroll as bigint;
    },
    enabled: !!address && groupId !== undefined,
  });
}

export function useHasActiveGroup(groupId: bigint | undefined) {
  const { address } = useAccount();
  const { publicClient } = useContractClient();

  const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

  return useQuery({
    queryKey: ["has-active-group", address, groupId?.toString()],
    queryFn: async () => {
      return await publicClient!.readContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "hasActiveGroup",
        args: [address!, groupId!],
      });
    },
    enabled: !!address && groupId !== undefined,
  });
}

export function useEmployeeGroups() {
  const { address } = useAccount();
  const { publicClient, contracts } = useContractClient();

  return useQuery({
    queryKey: ["employee-groups", address],
    queryFn: async (): Promise<EmployeePayrollGroup[]> => {
      const logs = await publicClient!.getLogs({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        event: parseAbiItem(
          "event EmployeeAdded(address indexed employer, uint256 indexed groupId, address indexed employee, uint256 salary)"
        ),
        args: {
          employee: address!,
        },
        fromBlock: contracts.PAYROLL_MANAGER_DEPLOYMENT_BLOCK,
        toBlock: "latest",
      });

      const uniqueGroups = new Map<string, { groupId: bigint; employer: string; salary: bigint }>();

      logs.forEach((log) => {
        const groupId = log.args.groupId as bigint;
        const employer = log.args.employer as string;
        const salary = log.args.salary as bigint;
        
        uniqueGroups.set(groupId.toString(), { groupId, employer, salary });
      });

      if (uniqueGroups.size === 0) return [];

      const groupPromises = Array.from(uniqueGroups.values()).map(async ({ groupId, employer, salary }) => {
        const groupData = await publicClient!.readContract({
          address: contracts.PAYROLL_MANAGER_ADDRESS,
          abi: PAYROLL_MANAGER_ABI,
          functionName: "getGroup",
          args: [employer as `0x${string}`, groupId],
        });

        return {
          groupId,
          employerAddress: employer,
          employeeSalary: salary,
          ...(groupData as any),
        } as EmployeePayrollGroup;
      });

      return await Promise.all(groupPromises);
    },
    enabled: !!address && !!publicClient,
  });
}


// import { useQuery } from "@tanstack/react-query";
// import { useInterwovenKit } from "@initia/interwovenkit-react";
// import { createPublicClient, http } from "viem";
// import { FLOWROLL_CHAIN } from "@/lib/interwoven";
// import { PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
// import { getContractsForChain } from "@/lib/contracts/addresses";

// const publicClient = createPublicClient({
//   chain: FLOWROLL_CHAIN,
//   transport: http("http://localhost:8545"),
// });

// console.log("Public client: ", publicClient);

// export function usePayrollQueries() {
//   const { address } = useInterwovenKit();
//   const validAddress = address as `0x${string}` | undefined;
//   console.log("Address: ", address);
//   console.log("validAddress: ", validAddress);

//   const contracts = getContractsForChain(FLOWROLL_CHAIN.id.toString());

//   console.log("Contracts", contracts);
// //   const registrationStatus = useQuery({
// //     queryKey: ["is-registered", validAddress],
// //     queryFn: async () => {
// //       return await publicClient.readContract({
// //         address: contracts.PAYROLL_MANAGER_ADDRESS,
// //         abi: PAYROLL_MANAGER_ABI,
// //         functionName: "isRegistered",
// //         args: [validAddress!],
// //       });
// //     },
// //     enabled: !!validAddress,
// //   });

// //   const employerProfile = useQuery({
// //     queryKey: ["employer-profile", validAddress],
// //     queryFn: async () => {
// //       return await publicClient.readContract({
// //         address: contracts.PAYROLL_MANAGER_ADDRESS,
// //         abi: PAYROLL_MANAGER_ABI,
// //         functionName: "getEmployer",
// //         args: [validAddress!],
// //       });
// //     },
// //     enabled: !!validAddress,
// //   });

//   const getGroupDetails = (groupId: bigint) =>
//     useQuery({
//       queryKey: ["payroll-group", validAddress, groupId?.toString()],
//       queryFn: async () => {
//         return await publicClient.readContract({
//           address: contracts.PAYROLL_MANAGER_ADDRESS,
//           abi: PAYROLL_MANAGER_ABI,
//           functionName: "getGroup",
//           args: [validAddress!, groupId],
//         });
//       },
//       enabled: !!validAddress && groupId !== undefined,
//     });

// // const  getGroupEmployees = (groupId: bigint) => useQuery({
// //   queryKey: ["group-employees", validAddress, groupId?.toString()],
// //   queryFn: async () => {
// //     return await publicClient.readContract({
// //       address: contracts.PAYROLL_MANAGER_ADDRESS,
// //       abi: PAYROLL_MANAGER_ABI,
// //       functionName: "getGroupEmployees",
// //       args: [validAddress!, groupId],
// //     });
// //   },
// //   enabled: !!validAddress && groupId !== undefined,
// // });

// //   const getTotalPayroll = (groupId: bigint) =>
// //     useQuery({
// //       queryKey: ["total-payroll", validAddress, groupId?.toString()],
// //       queryFn: async () => {
// //         return await publicClient.readContract({
// //           address: contracts.PAYROLL_MANAGER_ADDRESS,
// //           abi: PAYROLL_MANAGER_ABI,
// //           functionName: "getTotalPayroll",
// //           args: [validAddress!, groupId],
// //         });
// //       },
// //       enabled: !!validAddress && groupId !== undefined,
// //     });

// //   const hasActiveGroup = (groupId: bigint) =>
// //     useQuery({
// //       queryKey: ["has-active-group", validAddress, groupId?.toString()],
// //       queryFn: async () => {
// //         return await publicClient.readContract({
// //           address: contracts.PAYROLL_MANAGER_ADDRESS,
// //           abi: PAYROLL_MANAGER_ABI,
// //           functionName: "hasActiveGroup",
// //           args: [validAddress!, groupId],
// //         });
// //       },
// //       enabled: !!validAddress && groupId !== undefined,
// //     });

//   const getYieldRouterAddress = useQuery({
//     queryKey: ["yield-router-address"],
//     queryFn: async () => {
//       return await publicClient.readContract({
//         address: contracts.PAYROLL_MANAGER_ADDRESS,
//         abi: PAYROLL_MANAGER_ABI,
//         functionName: "yieldRouter",
//       });
//     },
//   });

//   const getPayrollDispatcherAddress = useQuery({
//     queryKey: ["payroll-dispatcher-address"],
//     queryFn: async () => {
//       return await publicClient.readContract({
//         address: contracts.PAYROLL_MANAGER_ADDRESS,
//         abi: PAYROLL_MANAGER_ABI,
//         functionName: "payrollDispatcher",
//       });
//     },
//   });

//   return {
//     // registrationStatus,
//     // employerProfile,
//     getGroupDetails,
//     // getGroupEmployees,
//     // getTotalPayroll,
//     // hasActiveGroup,
//     getYieldRouterAddress,
//     getPayrollDispatcherAddress,
//   };
// }
