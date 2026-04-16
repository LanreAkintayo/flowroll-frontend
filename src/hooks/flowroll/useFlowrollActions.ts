import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData } from "viem";
import { toast } from "sonner";
import { useContractClient } from "@/hooks/useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { FLOWROLL_CREDIT_ABI } from "@/lib/contracts/abis";

export function useFlowrollActions(evmAddress?: `0x${string}`) {
    const queryClient = useQueryClient();
    const { contracts } = useContractClient();
    const { initiaAddress, estimateGas, submitTxBlock } = useInterwovenKit();

    /**
     * REQUEST SALARY ADVANCE
     * Encodes the requestSalary(uint256 amount) call
     */
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
            const fee = calculateFee(Math.ceil(gasEstimate * 1.4), GasPrice.fromString("0.015GAS"));

            const { transactionHash } = await submitTxBlock({ messages, fee });
            return transactionHash;
        },
        onSuccess: (txHash) => {
            // Invalidate advance info and wallet balance to show the update
            queryClient.invalidateQueries({ queryKey: ["advance-info", evmAddress] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, evmAddress] });
        },
        onError: (error: Error) => {
            console.error("Request Salary Error:", error);
            // toast.error(error.message || "Failed to request salary");
        },
    });

    /**
     * REPAY DEBT
     * Encodes the repayDebt(address employee, uint256 amount) call
     */
    const repayDebt = useMutation({
        mutationFn: async ({ employee, amountInBaseUnits }: { employee: `0x${string}`, amountInBaseUnits: bigint }) => {
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
            const fee = calculateFee(Math.ceil(gasEstimate * 1.4), GasPrice.fromString("0.015GAS"));

            const { transactionHash } = await submitTxBlock({ messages, fee });
            return transactionHash;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["advance-info", evmAddress] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, evmAddress] });
            // toast.success("Debt repaid successfully!");
        },
        onError: (error: Error) => {
            console.error("Repay Debt Error:", error);
            // toast.error(error.message || "Failed to repay debt");
        },
    });

    return { requestSalary, repayDebt };
}