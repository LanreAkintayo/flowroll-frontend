"use client";

import { useMutation } from "@tanstack/react-query";
import { PAY_VAULT_ABI } from "@/lib/contracts/abis";
import { useContractClient } from "../useContractClient";
import { flowLog } from "@/lib/utils";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { encodeFunctionData } from "viem";
import { calculateFee, GasPrice } from "@cosmjs/stargate";

export function useVaultActions() {
    const {
        initiaAddress,
        estimateGas,
        submitTxBlock,
    } = useInterwovenKit();

    const { queryClient, contracts, address, isTestnet, cosmosChainId } = useContractClient();

    const claim = useMutation({
        mutationFn: async ({ amount }: { amount: bigint }) => {
            if (!address || !initiaAddress) throw new Error("Wallet not connected");

            const callData = encodeFunctionData({
                abi: PAY_VAULT_ABI,
                functionName: "claim",
                args: [amount],
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

            const gasEstimate = await estimateGas({ messages, chainId: cosmosChainId });
            const fee = calculateFee(
                Math.ceil(gasEstimate * 1.4),
                isTestnet? GasPrice.fromString(`${0.15e6}evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22`) : GasPrice.fromString("0.015GAS")
                // GasPrice.fromString("0.015GAS")
            );

            const { transactionHash } = await submitTxBlock({
                messages,
                fee,
                chainId: cosmosChainId, 
            });

            return transactionHash;
        },
        onSuccess: (hash) => {
            flowLog("Claim successful. Hash:", hash);
            queryClient.invalidateQueries({ queryKey: ["available-balance", address] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, address ] });
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

            const gasEstimate = await estimateGas({ messages, chainId: cosmosChainId });
            const fee = calculateFee(
                Math.ceil(gasEstimate * 1.4),
                isTestnet
                  ? GasPrice.fromString(
                      `${0.15e6}evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22`,
                    )
                  : GasPrice.fromString("0.015GAS")
            );

            const { transactionHash } = await submitTxBlock({
                messages,
                fee,
                chainId: cosmosChainId,
            });

            return transactionHash;
        },
        onSuccess: (hash) => {
            flowLog("Claim and Save successful. Hash:", hash);
            queryClient.invalidateQueries({ queryKey: ["available-balance", address] });
            queryClient.invalidateQueries({ queryKey: ["token-balance", contracts.USDC_ADDRESS, address] });
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