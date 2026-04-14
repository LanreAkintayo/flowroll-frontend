'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Droplets,
    Network,
    Zap,
    CheckCircle2,
    Wallet,
    Loader2,
    Coins
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useInterwovenKit } from '@initia/interwovenkit-react'
import { formatEther, formatUnits, erc20Abi, encodeFunctionData, parseUnits } from 'viem'
import { useContractClient } from '@/hooks/useContractClient'
import { toast } from 'sonner'
import { useAddressConversion } from '@/hooks/identity/useAddressConversion'
import { flowLog } from '@/lib/utils'

export default function OnboardingPage() {
    const router = useRouter()
    // const { initiaAddress, openConnect, requestTxBlock } = useInterwovenKit()
    const { initiaAddress, openConnect, requestTxBlock, openBridge } = useInterwovenKit()
    const { publicClient, contracts } = useContractClient()
    const { toEvm } = useAddressConversion()
    const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>()


    flowLog("Evm address: ", evmAddress);

    useEffect(() => {
        async function fetchEvm() {
            if (initiaAddress) {
                try {
                    const converted = await toEvm(initiaAddress)
                    setEvmAddress(converted as `0x${string}`)
                } catch (err) {
                    console.error("Failed to fetch EVM equivalent")
                }
            }
        }
        fetchEvm()
    }, [initiaAddress, toEvm])


    // --- UI LOADING STATES ---
    const [isClaiming, setIsClaiming] = useState(false)
    const [isZapping, setIsZapping] = useState(false)
    const [zapInput, setZapInput] = useState<string>('')



    // --- LIVE DATA FETCHING (The "Tush" Way) ---
    const { data: balances, refetch: refetchBalances } = useQuery({
        queryKey: ['onboarding-balances', evmAddress],
        queryFn: async () => {
            // Fetch all 3 balances simultaneously for maximum speed
            const [gas, init, usdc] = await Promise.all([
                publicClient!.getBalance({ address: evmAddress! }),
                publicClient!.readContract({
                    address: contracts.BRIDGED_INIT_ADDRESS as `0x${string}`, // 18 decimals
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [evmAddress!]
                }),
                publicClient!.readContract({
                    address: contracts.USDC_ADDRESS as `0x${string}`, // 6 decimals
                    abi: erc20Abi,
                    functionName: 'balanceOf',
                    args: [evmAddress!]
                })
            ])

            return {
                gas: Number(formatEther(gas)),
                init: Number(formatUnits(init, 18)), // Assuming 18 decimals for bridged INIT
                usdc: Number(formatUnits(usdc, 6))   // Assuming 6 decimals for USDC
            }
        },
        enabled: !!evmAddress && !!publicClient,
        refetchInterval: 5000, // Poll every 5 seconds so they see updates instantly without refreshing
    })

    const gasBalance = balances?.gas || 0
    const initBalance = balances?.init || 0
    const usdcBalance = balances?.usdc || 0

    // --- REAL HANDLERS ---
    const handleClaimGas = async () => {
        if (!evmAddress) {
            openConnect()
            return
        }

        setIsClaiming(true)
        try {
            const response = await fetch('/api/faucet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: evmAddress }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to claim gas from faucet')

            await refetchBalances()
            toast.success("0.5 GAS claimed successfully!")
        } catch (error: any) {
            console.error("Faucet error:", error)
            toast.error(error.message || "Something went wrong while claiming gas.")
        } finally {
            setIsClaiming(false)
        }
    }

    const handleZap = async () => {
        if (!zapInput || Number(zapInput) <= 0 || Number(zapInput) > initBalance || !evmAddress) return

        setIsZapping(true)
        try {
            const amountInBaseUnits = parseUnits(zapInput, 18) // Assuming 18 decimals

            // 1. First, encode the Approve transaction
            const approveData = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [contracts.FLOWROLL_ZAPPER_ADDRESS as `0x${string}`, amountInBaseUnits]
            })

            // 2. Encode the Zap transaction
            // Note: You will need to import your FlowrollZapper ABI for this
            // const zapData = encodeFunctionData({ abi: ZAPPER_ABI, functionName: 'zap', args: [amountInBaseUnits] })

            // 3. Dispatch via requestTxBlock (Mocking the block execution here for layout)
            /*
            await requestTxBlock({
                chainId: contracts.CHAIN_ID,
                messages: [
                    { typeUrl: '/minievm.evm.v1.MsgCall', value: { sender: evmAddress.toLowerCase(), contractAddr: contracts.BRIDGED_INIT_ADDRESS, input: approveData, value: '0', accessList: [], authList: [] } },
                    { typeUrl: '/minievm.evm.v1.MsgCall', value: { sender: evmAddress.toLowerCase(), contractAddr: contracts.FLOWROLL_ZAPPER_ADDRESS, input: zapData, value: '0', accessList: [], authList: [] } }
                ]
            })
            */

            setZapInput('')
            await refetchBalances()
        } catch (error) {
            console.error("Zap error:", error)
        } finally {
            setIsZapping(false)
        }
    }

    // --- STEP PROGRESSION LOGIC ---
    // We use a small threshold for gas (0.01) just in case they spent a tiny bit already
    const step1Complete = gasBalance >= 0.01
    const step2Complete = initBalance > 0
    const allSetupComplete = usdcBalance > 0

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] pt-8 pb-24 px-4 sm:px-6 relative">

            {/* --- LIVE BALANCE HEADER --- */}
            <div className="sticky top-4 z-50 flex justify-center mb-10">
                <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm rounded-full px-6 py-3 flex items-center gap-6 text-sm font-bold">
                    <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-900 dark:text-white">{gasBalance.toFixed(4)} GAS</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-900 dark:text-white">{initBalance.toFixed(2)} INIT</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-900 dark:text-white">{usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-4">
                {/* HEADER TEXT */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                        Initialize Your Employer Vault
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                        Follow these three steps to fund your Flowroll account with test assets.
                    </p>
                </div>

                {/* THE 3-STEP WIZARD */}
                <div className="space-y-6">

                    {/* STEP 1: CLAIM GAS */}
                    <div className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 bg-white dark:bg-[#0a0a0a] ${step1Complete ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                            <div className="flex gap-4 items-start">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${step1Complete ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-[#111] text-slate-400'}`}>
                                    {step1Complete ? <CheckCircle2 className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        1. Bootstrap Network Gas
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Claim free native gas to pay for your setup transactions.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleClaimGas}
                                disabled={isClaiming || step1Complete || !initiaAddress}
                                className={`w-full sm:w-auto shrink-0 h-11 px-6 rounded-xl font-bold ${step1Complete ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            >
                                {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {step1Complete ? 'Gas Claimed' : 'Claim 0.5 GAS'}
                            </Button>
                        </div>
                    </div>


                    {/* STEP 2: BRIDGE INIT */}
                    <div className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 bg-white dark:bg-[#0a0a0a] ${!step1Complete ? 'opacity-50 pointer-events-none border-slate-100 dark:border-slate-900' : step2Complete ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-amber-200 dark:border-amber-900/50'}`}>
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                            <div className="flex gap-4 items-start">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${step2Complete ? 'bg-emerald-500 text-white' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500'}`}>
                                    {step2Complete ? <CheckCircle2 className="w-6 h-6" /> : <Network className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        2. Fetch Ecosystem Capital
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Bridge INIT from the public testnet to our appchain.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => openBridge()}
                                disabled={step2Complete}
                                className={`w-full sm:w-auto shrink-0 h-11 px-6 rounded-xl font-bold ${step2Complete ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                            >
                                {step2Complete ? 'Capital Bridged' : 'Open Bridge'}
                            </Button>
                        </div>
                    </div>

                    {/* STEP 3: ZAP TO USDC */}
                    <div className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all duration-500 bg-white dark:bg-[#0a0a0a] ${!step2Complete ? 'opacity-50 pointer-events-none border-slate-100 dark:border-slate-900' : 'border-purple-200 dark:border-purple-900/50 shadow-lg shadow-purple-500/5'}`}>
                        <div className="flex gap-4 items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-500 flex items-center justify-center shrink-0">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    3. Zap to Payroll Assets
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Convert your bridged INIT into USDC for your employee vaults.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    placeholder="Amount of INIT"
                                    value={zapInput}
                                    onChange={(e) => setZapInput(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-slate-900 dark:text-white"
                                    disabled={!step2Complete || isZapping}
                                />
                                <Button
                                    onClick={handleZap}
                                    disabled={!zapInput || Number(zapInput) <= 0 || isZapping || Number(zapInput) > initBalance}
                                    className="h-12 px-8 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isZapping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Zap Now'}
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* SUCCESS STATE */}
                {allSetupComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 text-center"
                    >
                        <Button
                            onClick={() => router.push('/employer/dashboard')}
                            className="h-14 px-8 rounded-2xl text-lg font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform"
                        >
                            <Wallet className="w-5 h-5 mr-2" />
                            Go to Employer Dashboard
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}