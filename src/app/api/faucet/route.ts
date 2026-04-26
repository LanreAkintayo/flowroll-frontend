import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { APPCHAIN_EVM, TESTNET_EVM } from '@/lib/interwoven';

export async function POST(req: Request) {
    try {
        const { address, chainId } = await req.json();

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }

        if (!chainId) {
            return NextResponse.json({ error: 'Chain ID is required' }, { status: 400 });
        }

        const privateKey = process.env.NEXT_PUBLIC_FAUCET_PRIVATE_KEY;
        if (!privateKey) {
            console.error("FAUCET_PRIVATE_KEY missing in environment variables");
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const targetChain = chainId === TESTNET_EVM.id ? TESTNET_EVM : APPCHAIN_EVM;
        const account = privateKeyToAccount(privateKey as `0x${string}`);

        const publicClient = createPublicClient({
            chain: targetChain as any,
            transport: http(targetChain.rpcUrls.default.http[0])
        });

        const walletClient = createWalletClient({
            account,
            chain: targetChain as any,
            transport: http(targetChain.rpcUrls.default.http[0]) 
        });

        const txHash = await walletClient.sendTransaction({
            to: address as `0x${string}`,
            value: parseEther("0.5"),
            chain: targetChain as any
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("Faucet error:", error);
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
    }
}