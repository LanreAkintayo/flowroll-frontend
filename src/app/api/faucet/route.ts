import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { FLOWROLL_CHAIN } from '@/lib/interwoven';

/**
 * Server-side faucet for distributing gas tokens to new wallets
 */
export async function POST(req: Request) {
    try {
        const { address } = await req.json();

        // Validate wallet address format
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }

        // Validate server credentials
        const privateKey = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;
        if (!privateKey) {
            console.error("FAUCET_PRIVATE_KEY missing in environment variables");
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const account = privateKeyToAccount(privateKey as `0x${string}`);

        // Initialize RPC clients
        const publicClient = createPublicClient({
            chain: FLOWROLL_CHAIN,
            transport: http(FLOWROLL_CHAIN.rpcUrls.default.http[0])
        });

        const walletClient = createWalletClient({
            account,
            chain: FLOWROLL_CHAIN,
            transport: http(FLOWROLL_CHAIN.rpcUrls.default.http[0]) 
        });

        // Execute the cross-chain simulation/transfer
        const txHash = await walletClient.sendTransaction({
            to: address as `0x${string}`,
            value: parseEther("0.5")
        });

        // Halt API response until the block is fully mined
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("Faucet error:", error);
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
    }
}