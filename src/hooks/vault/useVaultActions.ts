"use client";

import { useAccount } from "wagmi";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { PAY_VAULT_ABI, PAYROLL_MANAGER_ABI } from "@/lib/contracts/abis";
import { useContractClient } from "../useContractClient";
import { flowLog } from "@/lib/utils";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { encodeFunctionData } from "viem";
import { calculateFee, GasPrice } from "@cosmjs/stargate";

export function useVaultActions() {
    const { address } = useAccount();
    const {
        initiaAddress,
        estimateGas,
        submitTxBlock,
    } = useInterwovenKit();

    const { queryClient, contracts } = useContractClient();

    const claim = useMutation({
        mutationFn: async ({ amount }: { amount: bigint }) => {
            if (!address || !initiaAddress) throw new Error("Wallet not connected");

            flowLog("Amount: ", amount)

            flowLog("Initia address :", initiaAddress);

            const callData = encodeFunctionData({
                abi: PAY_VAULT_ABI,
                functionName: "claim",
                args: [amount],
            });

            flowLog("Calldata: ", callData)

            const messages = [
                {
                    typeUrl: "/minievm.evm.v1.MsgCall",
                    value: {
                        sender: initiaAddress.toLowerCase(),
                        contractAddr: contracts.PAY_VAULT_ADDRESS,
                        input: callData,
                        value: "0",
                        accessList: [],
                        authList: [],
                    },
                },
            ];

            flowLog("Messages: ", messages)

            const gasEstimate = await estimateGas({ messages });
            const fee = calculateFee(
                Math.ceil(gasEstimate * 1.4),
                GasPrice.fromString("0.015GAS")
            );

            flowLog("GAstimate: ", gasEstimate, "Fee: ", fee);

            const { transactionHash } = await submitTxBlock({
                messages,
                fee,
            });

            flowLog("Transaction Hash: ", transactionHash);

            return transactionHash;
        },
        onSuccess: (hash) => {
            flowLog("Claim successful. Hash:", hash);
            queryClient.invalidateQueries({ queryKey: ["available-balance", address] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS] });
        },
        onError: (error) => {
            flowLog("Claim failed:", error);
        },
    });

    const claimAndSave = useMutation({
        mutationFn: async ({
            amount,
            savePct,
            durationInSeconds,
        }: {
            amount: bigint;
            savePct: number;
            durationInSeconds: number;
        }) => {
            if (!address || !initiaAddress) throw new Error("Wallet not connected");

            const basisPoints = BigInt(Math.floor(savePct * 100));
            const duration = BigInt(durationInSeconds);

            const callData = encodeFunctionData({
                abi: PAY_VAULT_ABI,
                functionName: "claimAndSave",
                args: [amount, basisPoints, duration],
            });

            const messages = [
                {
                    typeUrl: "/minievm.evm.v1.MsgCall",
                    value: {
                        sender: initiaAddress.toLowerCase(),
                        contractAddr: contracts.PAY_VAULT_ADDRESS,
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

            const { transactionHash } = await submitTxBlock({
                messages,
                fee,
            });

            return transactionHash;
        },
        onSuccess: (hash) => {
            flowLog("Claim and Save successful. Hash:", hash);
            queryClient.invalidateQueries({ queryKey: ["available-balance", address] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS] });
        },
        onError: (error) => {
            flowLog("Claim and save failed:", error);
        },
    });

    return {
        claim,
        claimAndSave,
        isReady: !!address,
    };
}