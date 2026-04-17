import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, erc20Abi, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { FLOWROLL_CHAIN } from '@/lib/interwoven';

export async function POST(req: Request) {
    try {
        const { address } = await req.json();

        // Validate recipient address
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }

        // Validate server configuration
        const privateKey = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;
        const initAddress = process.env.NEXT_PUBLIC_BRIDGED_INIT_ADDRESS; 

        if (!privateKey || !initAddress) {
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

        // Artificial delay to mimic cross-chain latency
        // await new Promise(resolve => setTimeout(resolve, 3000));

        // Execute ERC20 transfer
        const txHash = await walletClient.writeContract({
            address: initAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [address as `0x${string}`, parseUnits("50", 18)]
        });

        // Halt API response until the block is fully mined
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("Mock bridge error:", error);
        return NextResponse.json({ error: error.message || 'Bridge simulation failed' }, { status: 500 });
    }
}