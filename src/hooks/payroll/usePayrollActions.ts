"use client";

import {
  useWriteContract,
  useAccount,
  usePublicClient,
  useSwitchChain,
} from "wagmi";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
import { getContractsForChain } from "@/lib/contracts/addresses";
import { FLOWROLL_CHAIN } from "@/lib/interwoven";
import { useContractClient } from "../useContractClient";
import { flowLog } from "@/lib/utils";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { encodeFunctionData, hexToBytes } from "viem";
import { autheoTestnet } from "viem/chains";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
// import { MsgCall } from "@initia/initia.js";

export function usePayrollActions() {
  const { address, chainId } = useAccount();
  const {
    address: interwovenAddress,
    initiaAddress,
    estimateGas,
    submitTxBlock,
    requestTxBlock,
  } = useInterwovenKit();

  // flowLog("Chain Id: ", chainId);

  const { switchChainAsync } = useSwitchChain();

  const { publicClient, writeContractAsync, queryClient, contracts } =
    useContractClient();

  // ─── Create group ───────────────────────────────────────────────────────────
  const createGroup = useMutation({
    mutationFn: async ({
      name,
      cycleDuration,
    }: {
      name: string;
      cycleDuration: bigint;
    }) => {
      if (!address || !initiaAddress) throw new Error("Wallet not connected");

      let callData: string;
      try {
        callData = encodeFunctionData({
          abi: PAYROLL_MANAGER_ABI,
          functionName: "createGroup",
          args: [name, cycleDuration],
        });
        flowLog("callData:", callData);
      } catch (e) {
        flowLog("encodeFunctionData failed:", e);
        throw e;
      }

      const { result } = await publicClient!.simulateContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "createGroup",
        args: [name, cycleDuration],
        account: address,
      });

      flowLog("Simulation result (groupId):", result);

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

      flowLog("Constructed message for createGroup:", messages);

      const gasEstimate = await estimateGas({ messages });
      const fee = calculateFee(
        Math.ceil(gasEstimate * 1.4),
        GasPrice.fromString("0.015GAS"),
      );

      const { transactionHash } = await submitTxBlock({
        messages,
        fee,
      });

      flowLog("Submitted transaction for createGroup, hash:", transactionHash);

      return { hash: transactionHash, groupId: result as bigint };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-groups", address] });
    },
  });

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

      flowLog("Constructed message for setUpPayroll:", messages);

      const gasEstimate = await estimateGas({ messages });

      flowLog("Gas Estimate: ", gasEstimate);

      const fee = calculateFee(
        Math.ceil(gasEstimate * 2.0),
        GasPrice.fromString("0.015GAS"),
      );


      flowLog("Fee: ", fee);

      const { transactionHash } = await submitTxBlock({ messages, fee });

      return transactionHash;
    },
    onSuccess: (hash) => {
      flowLog("Payroll setup successful. Hash:", hash);

      queryClient.invalidateQueries({ queryKey: ["group-details"] });
      queryClient.invalidateQueries({ queryKey: ["group-employees"] });
    },
    onError: (error) => {
      flowLog("Payroll setup failed:", error);
    },
  });

  return {
    // registerEmployer,
    createGroup,
    setupPayroll,
    // batchAddEmployees,
    // depositPayroll,
    isReady: !!address,
  };
}
