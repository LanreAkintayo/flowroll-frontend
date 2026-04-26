import { NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  erc20Abi,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { APPCHAIN_EVM, TESTNET_EVM } from "@/lib/interwoven";
import { getContractsForChain } from "@/lib/contracts/addresses";

export async function POST(req: Request) {
  try {
    const { address, chainId } = await req.json();

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    if (!chainId) {
      return NextResponse.json(
        { error: "Chain ID is required" },
        { status: 400 },
      );
    }

    const privateKey = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 },
      );
    }

    // Resolve target network and corresponding contract addresses
    const targetChain = chainId === TESTNET_EVM.id ? TESTNET_EVM : APPCHAIN_EVM;
    const contracts = getContractsForChain(targetChain.id.toString());
    const tokenAddress = contracts.BRIDGED_INIT_ADDRESS as `0x${string}`;

    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const publicClient = createPublicClient({
      chain: targetChain as any,
      transport: http(targetChain.rpcUrls.default.http[0]),
    });

    const walletClient = createWalletClient({
      account,
      chain: targetChain as any,
      transport: http(targetChain.rpcUrls.default.http[0]),
    });

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [address as `0x${string}`, parseUnits("50", 18)],
      chain: targetChain as any,
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return NextResponse.json({ success: true, txHash });
  } catch (error: any) {
    console.error("Mock bridge error:", error);
    return NextResponse.json(
      { error: error.message || "Bridge simulation failed" },
      { status: 500 },
    );
  }
}

// import { NextResponse } from 'next/server';
// import { createPublicClient, createWalletClient, http, erc20Abi, parseUnits } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { FLOWROLL_CHAIN } from '@/lib/interwoven';

// export async function POST(req: Request) {
//     try {
//         const { address } = await req.json();

//         // Validate recipient address
//         if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
//             return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
//         }

//         // Validate server configuration
//         const privateKey = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;
//         const initAddress = process.env.NEXT_PUBLIC_BRIDGED_INIT_ADDRESS;

//         if (!privateKey || !initAddress) {
//             return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
//         }

//         const account = privateKeyToAccount(privateKey as `0x${string}`);

//         // Initialize RPC clients
//         const publicClient = createPublicClient({
//             chain: FLOWROLL_CHAIN,
//             transport: http(FLOWROLL_CHAIN.rpcUrls.default.http[0])
//         });

//         const walletClient = createWalletClient({
//             account,
//             chain: FLOWROLL_CHAIN,
//             transport: http(FLOWROLL_CHAIN.rpcUrls.default.http[0])
//         });

//         // Artificial delay to mimic cross-chain latency
//         // await new Promise(resolve => setTimeout(resolve, 3000));

//         // Execute ERC20 transfer
//         const txHash = await walletClient.writeContract({
//             address: initAddress as `0x${string}`,
//             abi: erc20Abi,
//             functionName: 'transfer',
//             args: [address as `0x${string}`, parseUnits("50", 18)]
//         });

//         // Halt API response until the block is fully mined
//         await publicClient.waitForTransactionReceipt({ hash: txHash });

//         return NextResponse.json({ success: true, txHash });

//     } catch (error: any) {
//         console.error("Mock bridge error:", error);
//         return NextResponse.json({ error: error.message || 'Bridge simulation failed' }, { status: 500 });
//     }
// }
