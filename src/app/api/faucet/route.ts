import { NextResponse } from 'next/server';
import { createWalletClient, createPublicClient, http, parseEther, parseUnits, erc20Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { APPCHAIN_EVM, TESTNET_EVM } from '@/lib/interwoven';
import { getContractsForChain } from '@/lib/contracts/addresses';
import { Pool } from 'pg';

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
const COOLDOWN_INTERVAL = "24 hours";

export async function POST(req: Request) {
    try {
        const { address, chainId, tokenType } = await req.json();
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
        }

        if (!chainId) {
            return NextResponse.json({ error: 'Chain ID is required' }, { status: 400 });
        }

        if (!tokenType || (tokenType !== 'INIT' && tokenType !== 'USDC')) {
            return NextResponse.json({ error: 'Invalid token type. Must be INIT or USDC' }, { status: 400 });
        }

        const privateKey = process.env.FAUCET_PRIVATE_KEY;
        if (!privateKey) {
            console.error("FAUCET_PRIVATE_KEY missing in environment variables");
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // Independent 24-hour database cooldown check per token type
        const checkQuery = `
            SELECT wallet_address, ip_address FROM faucet_claims 
            WHERE (wallet_address = $1 OR ip_address = $2) 
            AND token_type = $3
            AND claimed_at > NOW() - INTERVAL '${COOLDOWN_INTERVAL}'
            LIMIT 1
        `;
        const checkpoint = await pool.query(checkQuery, [address.toLowerCase(), ip, tokenType]);

        if (checkpoint.rows.length > 0) {
            return NextResponse.json({ 
                error: `You have already claimed ${tokenType} in the last 24 hours.` 
            }, { status: 429 });
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

        let txHash: `0x${string}`;

        // Branching execution logic based on the payload selection
        if (tokenType === 'INIT') {
            txHash = await walletClient.sendTransaction({
                to: address as `0x${string}`,
                value: parseEther("0.5"),
                chain: targetChain as any
            });
        } else {
            const contracts = getContractsForChain(targetChain.id.toString());
            const usdcAddress = contracts.USDC_ADDRESS;

            txHash = await walletClient.writeContract({
                address: usdcAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [address as `0x${string}`, parseUnits("2000", 6)],
                chain: targetChain as any
            });
        }

        await publicClient.waitForTransactionReceipt({ hash: txHash });

        // Commit successful claim state to the independent tracking ledger
        const logQuery = `
            INSERT INTO faucet_claims (wallet_address, ip_address, token_type, tx_hash) 
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(logQuery, [address.toLowerCase(), ip, tokenType, txHash]);

        return NextResponse.json({ success: true, txHash });

    } catch (error: any) {
        console.error("Faucet distribution error:", error);
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
    }
}



// import { NextResponse } from 'next/server';
// import { createWalletClient, createPublicClient, http, parseEther } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
// import { APPCHAIN_EVM, TESTNET_EVM } from '@/lib/interwoven';

// export async function POST(req: Request) {
//     try {
//         const { address, chainId } = await req.json();

//         if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
//             return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
//         }

//         if (!chainId) {
//             return NextResponse.json({ error: 'Chain ID is required' }, { status: 400 });
//         }

//         const privateKey = process.env.FAUCET_PRIVATE_KEY;
//         if (!privateKey) {
//             console.error("FAUCET_PRIVATE_KEY missing in environment variables");
//             return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
//         }

//         const targetChain = chainId === TESTNET_EVM.id ? TESTNET_EVM : APPCHAIN_EVM;
//         const account = privateKeyToAccount(privateKey as `0x${string}`);

//         const publicClient = createPublicClient({
//             chain: targetChain as any,
//             transport: http(targetChain.rpcUrls.default.http[0])
//         });

//         const walletClient = createWalletClient({
//             account,
//             chain: targetChain as any,
//             transport: http(targetChain.rpcUrls.default.http[0]) 
//         });

//         const txHash = await walletClient.sendTransaction({
//             to: address as `0x${string}`,
//             value: parseEther("0.5"),
//             chain: targetChain as any
//         });

//         await publicClient.waitForTransactionReceipt({ hash: txHash });

//         return NextResponse.json({ success: true, txHash });

//     } catch (error: any) {
//         console.error("Faucet error:", error);
//         return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
//     }
// }