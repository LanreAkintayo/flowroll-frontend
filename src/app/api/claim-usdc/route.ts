import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseUnits, erc20Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { APPCHAIN_EVM, TESTNET_EVM } from '@/lib/interwoven';
import { getContractsForChain } from '@/lib/contracts/addresses';

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
        const contracts = getContractsForChain(targetChain.id.toString());
        const usdcAddress = contracts.USDC_ADDRESS;
        
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

        const txHash = await walletClient.writeContract({
            address: usdcAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [address as `0x${string}`, parseUnits("2000", 6)],
            chain: targetChain as any
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("USDC Claim error:", error);
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
    }
}