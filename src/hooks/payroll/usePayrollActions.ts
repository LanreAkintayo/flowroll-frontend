"use client";

import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { useChainId } from "wagmi";

import { PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
import { useContractClient } from "../useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { flowLog } from "@/lib/utils";
import {
  APPCHAIN_COSMOS_ID,
  TESTNET_COSMOS_ID,
  TESTNET_EVM,
} from "@/lib/interwoven";

export function usePayrollActions() {
  const { initiaAddress, estimateGas, submitTxBlock, requestTxBlock, autoSign } = useInterwovenKit();

  const {
    address,
    publicClient,
    queryClient,
    contracts,
    chainId,
    cosmosChainId,
    isTestnet,
  } = useContractClient();

  // const chainId = useChainId();
  const gasPriceString = isTestnet ? "0.15uinit" : "0.015GAS";

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

      flowLog("About to simulate contract")
      const { result } = await publicClient!.simulateContract({
        address: contracts.PAYROLL_MANAGER_ADDRESS,
        abi: PAYROLL_MANAGER_ABI,
        functionName: "createGroup",
        args: [name, cycleDuration],
        account: address,
      });


      flowLog("Formign message")
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

      flowLog("About to estimate gas")
      const gasEstimate = await estimateGas({
        messages,
        chainId: cosmosChainId,
      });

      flowLog("About to calculate fee")
      const fee = calculateFee(
        Math.ceil(gasEstimate * 1.4),
        isTestnet
          ? GasPrice.fromString(
              `${0.15e6}evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22`,
            )
          : GasPrice.fromString("0.015GAS"),
      );

      flowLog("Is Autosign Active?", autoSign.isEnabledByChain[cosmosChainId]);
      flowLog("Submitting to Chain:", cosmosChainId);
      flowLog("Sender Address:", initiaAddress);

      const { transactionHash } = await submitTxBlock({
        messages,
        fee,
        chainId: cosmosChainId,
      });

      flowLog("Transaction hash: ", transactionHash);

      return { hash: transactionHash, groupId: result as bigint };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-groups", address] });
    },
  });


//   const createGroup = useMutation({
//   mutationFn: async ({
//     name,
//     cycleDuration,
//   }: {
//     name: string;
//     cycleDuration: bigint;
//   }) => {
//     if (!address || !initiaAddress) throw new Error("Wallet not connected");

//     const callData = encodeFunctionData({
//       abi: PAYROLL_MANAGER_ABI,
//       functionName: "createGroup",
//       args: [name, cycleDuration],
//     });

//     flowLog("About to simulate contract");
//     const { result } = await publicClient!.simulateContract({
//       address: contracts.PAYROLL_MANAGER_ADDRESS,
//       abi: PAYROLL_MANAGER_ABI,
//       functionName: "createGroup",
//       args: [name, cycleDuration],
//       account: address,
//     });

//     const messages = [
//       {
//         typeUrl: "/minievm.evm.v1.MsgCall",
//         value: {
//           sender: initiaAddress.toLowerCase(),
//           contractAddr: contracts.PAYROLL_MANAGER_ADDRESS,
//           input: callData,
//           value: "0",
//           accessList: [],
//           authList: [],
//         },
//       },
//     ];

//     const isAutoSignActive = !!autoSign.isEnabledByChain[cosmosChainId];
//     flowLog("Is Autosign Active?", isAutoSignActive);

//     let txHash = "";

//     if (isAutoSignActive) {
//       flowLog("Executing via silent submitTxBlock pipeline");
//       const gasEstimate = await estimateGas({
//         messages,
//         chainId: cosmosChainId,
//       });

//       const fee = calculateFee(
//         Math.ceil(gasEstimate * 1.4),
//         isTestnet
//           ? GasPrice.fromString(
//               `${0.15e6}evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22`,
//             )
//           : GasPrice.fromString("0.015GAS"),
//       );

//       const response = await submitTxBlock({
//         messages,
//         fee,
//         chainId: cosmosChainId,
//       });
//       txHash = response.transactionHash;
//     } else {
//       flowLog("Executing via interactive requestTxBlock drawer UI");
//       const response = await requestTxBlock({
//         messages,
//         chainId: cosmosChainId,
//         gasAdjustment: 1.4,
//       });
//       txHash = response.transactionHash;
//     }

//     flowLog("Transaction hash: ", txHash);
//     return { hash: txHash, groupId: result as bigint };
//   },
//   onSuccess: () => {
//     queryClient.invalidateQueries({ queryKey: ["employer-groups", address] });
//   },
// });

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

      flowLog("Encoding function data")
      const callData = encodeFunctionData({
        abi: PAYROLL_MANAGER_ABI,
        functionName: "setUpPayroll",
        args: [groupId, employees, salaries],
      });

      flowLog("Forming message")
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

      flowLog("Estimating gas")
      const gasEstimate = await estimateGas({
        messages,
        chainId: cosmosChainId,
      });

      flowLog("Calculating fee")
      const fee = calculateFee(
        Math.ceil(gasEstimate * 3),
        isTestnet
          ? GasPrice.fromString(
              `${0.15e6}evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22`,
            )
          : "0.015GAS",
      );

        flowLog("Submitting transaction..")
      const { transactionHash } = await submitTxBlock({
        messages,
        fee,
        chainId: cosmosChainId,
      });

      return transactionHash;
    },
    // The first parameter is the return value of mutationFn (txHash), the second parameter contains your input payload variables
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["payroll-group", address, variables.groupId.toString()] 
      });
      queryClient.invalidateQueries({ queryKey: ["group-employees"] });
    },
    onError: (error) => {
      flowLog("Payroll error: ", error);
    },
  });

  return {
    createGroup,
    setupPayroll,
    isReady: !!address,
  };
}
