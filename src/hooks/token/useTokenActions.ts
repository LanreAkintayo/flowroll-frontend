import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData, erc20Abi } from "viem";
import { toast } from "sonner";
import { useContractClient } from "@/hooks/useContractClient";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import {
  useWriteContract,
  useAccount,
  usePublicClient,
  useSwitchChain,
} from "wagmi";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
import { flowLog } from "@/lib/utils";

export function useTokenActions(tokenAddress: `0x${string}`) {
  const { address, publicClient, writeContractAsync, queryClient, contracts } =
    useContractClient();

  const {
    address: interwovenAddress,
    initiaAddress,
    estimateGas,
    submitTxBlock,
    requestTxBlock,
  } = useInterwovenKit();

  const { switchChainAsync } = useSwitchChain();

  const approve = useMutation({
    mutationFn: async ({
      spender,
      amount,
    }: {
      spender: `0x${string}`;
      amount: bigint;
    }) => {
      if (!address) throw new Error("Wallet not connected");

      const { request } = await publicClient!.simulateContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
        account: address,
      });

      return await writeContractAsync(request);
    },
    onSuccess: (_, { spender }) => {
      queryClient.invalidateQueries({
        queryKey: ["allowance", tokenAddress, address, spender],
      });
      toast.success("Token approval confirmed.");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Approval failed.");
    },
  });

  const approveToken = useMutation({
    mutationFn: async ({
      spender,
      amount,
    }: {
      spender: `0x${string}`;
      amount: bigint;
    }) => {
      if (!address || !initiaAddress) throw new Error("Wallet not connected");

      const callData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
      });

      const messages = [
        {
          typeUrl: "/minievm.evm.v1.MsgCall",
          value: {
            sender: initiaAddress.toLowerCase(),
            contractAddr: tokenAddress,
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
        GasPrice.fromString("0.015uinit"),
      );

      const { transactionHash } = await submitTxBlock({ messages, fee });

      return transactionHash;
    },
    onSuccess: (hash, variables) => {
      flowLog("Approval successful. Hash:", hash);
      flowLog("Variables:", variables);

      queryClient.invalidateQueries({
        queryKey: ["token-allowance", address, tokenAddress],
      });
    },
  });

  const revokeApproval = useMutation({
    mutationFn: async (spender: `0x${string}`) => {
      if (!address) throw new Error("Wallet not connected");

      const { request } = await publicClient!.simulateContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, 0n], // setting allowance to zero = revoke
        account: address,
      });

      return await writeContractAsync(request);
    },
    onSuccess: (_, spender) => {
      queryClient.invalidateQueries({
        queryKey: ["allowance", tokenAddress, address, spender],
      });
      toast.success("Approval revoked.");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Revoke failed.");
    },
  });

  return { approveToken, revokeApproval };
}
