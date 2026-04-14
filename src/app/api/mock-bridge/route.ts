import { NextResponse } from 'next/server';
import { createWalletClient, http, erc20Abi, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { FLOWROLL_CHAIN } from '@/lib/interwoven';

export async function POST(req: Request) {
    try {
        const { address } = await req.json();

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }

        const privateKey = process.env.FAUCET_PRIVATE_KEY;
        const initAddress = process.env.NEXT_PUBLIC_BRIDGED_INIT_ADDRESS; 

        if (!privateKey || !initAddress) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const account = privateKeyToAccount(privateKey as `0x${string}`);

        const walletClient = createWalletClient({
            account,
            chain: FLOWROLL_CHAIN,
            transport: http()
        });

        // Simulate a 3-second IBC bridging delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Transfer 50 INIT (Assuming 18 decimals, adjust if it's 6)
        const txHash = await walletClient.writeContract({
            address: initAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [address as `0x${string}`, parseUnits("50", 18)]
        });

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("Mock bridge error:", error);
        return NextResponse.json({ error: error.message || 'Bridge simulation failed' }, { status: 500 });
    }
}