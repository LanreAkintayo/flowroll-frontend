import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { calculateFee, GasPrice } from "@cosmjs/stargate";

import { useContractClient } from "@/hooks/useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { FLOWROLL_CREDIT_ABI } from "@/lib/contracts/abis";

export function useFlowrollActions(evmAddress?: `0x${string}`) {
    const queryClient = useQueryClient();
    const { contracts } = useContractClient();
    const { initiaAddress, estimateGas, submitTxBlock } = useInterwovenKit();

    // Protocol salary advance request
    const requestSalary = useMutation({
        mutationFn: async (amountInBaseUnits: bigint) => {
            if (!initiaAddress) throw new Error("Wallet not connected");

            const callData = encodeFunctionData({
                abi: FLOWROLL_CREDIT_ABI,
                functionName: "requestSalary",
                args: [amountInBaseUnits],
            });

            const messages = [{
                typeUrl: "/minievm.evm.v1.MsgCall",
                value: {
                    sender: initiaAddress,
                    contractAddr: contracts.FLOWROLL_CREDIT_ADDRESS,
                    input: callData,
                    value: "0",
                    accessList: [],
                    authList: []
                },
            }];

            const gasEstimate = await estimateGas({ messages });
            const fee = calculateFee(
                Math.ceil(gasEstimate * 1.4), 
                GasPrice.fromString("0.015GAS")
            );

            const { transactionHash } = await submitTxBlock({ messages, fee });
            return transactionHash;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance-info", evmAddress] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, evmAddress] });
        }
    });

    // Credit debt repayment orchestrator
    const repayDebt = useMutation({
        mutationFn: async ({ 
            employee, 
            amountInBaseUnits 
        }: { 
            employee: `0x${string}`, 
            amountInBaseUnits: bigint 
        }) => {
            if (!initiaAddress) throw new Error("Wallet not connected");

            const callData = encodeFunctionData({
                abi: FLOWROLL_CREDIT_ABI,
                functionName: "repayDebt",
                args: [employee, amountInBaseUnits],
            });

            const messages = [{
                typeUrl: "/minievm.evm.v1.MsgCall",
                value: {
                    sender: initiaAddress,
                    contractAddr: contracts.FLOWROLL_CREDIT_ADDRESS,
                    input: callData,
                    value: "0",
                    accessList: [],
                    authList: []
                },
            }];

            const gasEstimate = await estimateGas({ messages });
            const fee = calculateFee(
                Math.ceil(gasEstimate * 1.4), 
                GasPrice.fromString("0.015GAS")
            );

            const { transactionHash } = await submitTxBlock({ messages, fee });
            return transactionHash;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance-info", evmAddress] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, evmAddress] });
        }
    });

    return { requestSalary, repayDebt };
}