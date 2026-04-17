"use client";

import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { calculateFee, GasPrice } from "@cosmjs/stargate";

import { PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
import { useContractClient } from "../useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";

export function usePayrollActions() {
  const { 
    initiaAddress, 
    estimateGas, 
    submitTxBlock 
  } = useInterwovenKit();

  const { 
    address, 
    publicClient, 
    queryClient, 
    contracts 
  } = useContractClient();

  // Create new payroll group
  const createGroup = useMutation({
    mutationFn: async ({
      name,
      cycleDuration,
    }: {
      name: string;
      cycleDuration: bigint;
    }) => {
      if (!address || !initiaAddress) throw new Error("Wallet not connected");

      const callData = encodeFunctionData({
        abi: PAYROLL_MANAGER_ABI,
        functionName: "createGroup",
        args: [name, cycleDuration],
      });

      // Simulation to retrieve the deterministic groupId
      const { result } = await publicClient!.simulateContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "createGroup",
        args: [name, cycleDuration],
        account: address,
      });

      const messages = [
        {
          typeUrl: "/minievm.evm.v1.MsgCall",
          value: {
            sender: initiaAddress.toLowerCase(),
            contractAddr: contracts.PAYROLL_MANAGER_ADDRESS,
            input: callData,
            value: "0",
            accessList: [],
            authList: [],
          },
        },
      ];

      const gasEstimate = await estimateGas({ messages });
      const fee = calculateFee(
        Math.ceil(gasEstimate * 1.4),
        GasPrice.fromString("0.015GAS")
      );

      const { transactionHash } = await submitTxBlock({ messages, fee });

      return { hash: transactionHash, groupId: result as bigint };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-groups", address] });
    },
  });

  // Initialize payroll for an existing group
  const setupPayroll = useMutation({
    mutationFn: async ({
      groupId,
      employees,
      salaries,
    }: {
      groupId: bigint;
      employees: `0x${string}`[];
      salaries: bigint[];
    }) => {
      if (!address || !initiaAddress) throw new Error("Wallet not connected");

      const callData = encodeFunctionData({
        abi: PAYROLL_MANAGER_ABI,
        functionName: "setUpPayroll",
        args: [groupId, employees, salaries],
      });

      const messages = [
        {
          typeUrl: "/minievm.evm.v1.MsgCall",
          value: {
            sender: initiaAddress.toLowerCase(),
            contractAddr: contracts.PAYROLL_MANAGER_ADDRESS,
            input: callData,
            value: "0",
            accessList: [],
            authList: [],
          },
        },
      ];

      const gasEstimate = await estimateGas({ messages });
      const fee = calculateFee(
        Math.ceil(gasEstimate * 1.5),
        GasPrice.fromString("0.015GAS")
      );

      const { transactionHash } = await submitTxBlock({ messages, fee });
      return transactionHash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-details"] });
      queryClient.invalidateQueries({ queryKey: ["group-employees"] });
    },
  });

  return {
    createGroup,
    setupPayroll,
    isReady: !!address,
  };
}