import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { toast } from "sonner";
import { useContractClient } from "@/hooks/useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { FLOWROLL_ZAPPER_ABI } from "@/lib/contracts/abis";

export function useOnboardingActions(evmAddress?: `0x${string}`) {
    const queryClient = useQueryClient();
    const { contracts } = useContractClient();
    const { initiaAddress, estimateGas, submitTxBlock } = useInterwovenKit();

    const claimFreeGas = useMutation({
        mutationFn: async () => {
            if (!evmAddress) throw new Error("Wallet not connected");

            const response = await fetch('/api/faucet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: evmAddress }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to claim gas');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-queries", evmAddress] });
        },
        onError: (error: Error) => toast.error(error.message),
    });


    const mockBridge = useMutation({
        mutationFn: async () => {
            if (!evmAddress) throw new Error("Wallet not connected");

            const response = await fetch('/api/mock-bridge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: evmAddress }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to simulate bridge');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-queries", evmAddress] });
            toast.success("50 INIT bridged successfully via simulation!");
        },
        onError: (error: Error) => toast.error(error.message),
    });


    
    const zapTokens = useMutation({
        mutationFn: async (amountInBaseUnits: bigint) => {
            if (!initiaAddress) throw new Error("Wallet not connected");

            const callData = encodeFunctionData({
                abi: FLOWROLL_ZAPPER_ABI,
                functionName: "zap",
                args: [amountInBaseUnits],
            });

            const messages = [{
                typeUrl: "/minievm.evm.v1.MsgCall",
                value: { sender: initiaAddress, contractAddr: contracts.FLOWROLL_ZAPPER_ADDRESS, input: callData, value: "0", accessList: [], authList: [] },
            }];

            const gasEstimate = await estimateGas({ messages });
            const fee = calculateFee(Math.ceil(gasEstimate * 1.4), GasPrice.fromString("0.015GAS"));

            const { transactionHash } = await submitTxBlock({ messages, fee });
            return transactionHash;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["onboarding-queries", evmAddress] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    return { claimFreeGas, mockBridge, zapTokens }; 

}