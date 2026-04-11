'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ShieldCheck, ArrowRightLeft, Sparkles, ArrowRight, Zap, Globe, CheckCircle2, Lock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUnits, parseUnits } from 'viem'
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AllocationEngine } from '@/components/employee/AllocationEngine'
import { OmnichainBridge } from '@/components/employee/OmnichainBridge'
import { useAvailableBalance } from '@/hooks/vault/useVaultQueries'
import { useContractClient } from '@/hooks/useContractClient'

// --- MOCK DATA ---
const MOCK_CLAIMABLE = 1200n * 1000000n // $1,200 USDC
const MOCK_WALLET_BAL = 500n * 1000000n // $500 USDC
const MOCK_APY = 0.085 // 8.5%

export default function ClaimHubPage() {

    const { address } = useContractClient()
    const { data: claimableBalance } = useAvailableBalance(address)
    const formattedMax = claimableBalance ? Number(formatUnits(claimableBalance, 6)).toString() : "0"

    // --- STATE: Claim Engine ---
    const [claimInput, setClaimInput] = useState<string>("")
    const [savePct, setSavePct] = useState<number>(0) // 0 to 100
    const [durationMonths, setDurationMonths] = useState<number>(1)
    const [isClaiming, setIsClaiming] = useState(false)
    const [durationValue, setDurationValue] = useState<string>("30")
    const [durationType, setDurationType] = useState<string>("days")

    // --- STATE: Bridge ---
    const [bridgeInput, setBridgeInput] = useState<string>("")
    const [targetChain, setTargetChain] = useState<string>("arbitrum")
    const [isBridging, setIsBridging] = useState(false)

    // --- DERIVED CALCULATIONS ---
    const numClaimInput = Number(claimInput) || 0
    const vaultAmount = numClaimInput * (savePct / 100)
    const liquidAmount = numClaimInput - vaultAmount

    // Dummy Yield Projection: (Principal * APY * (Months / 12))
    const projectedYield = vaultAmount * MOCK_APY * (durationMonths / 12)

    // Formatters
    const formatUSDC = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formatBigInt = (amount: bigint) => Number(formatUnits(amount, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Handlers
    const handleClaim = () => {
        setIsClaiming(true)
        setTimeout(() => {
            setIsClaiming(false)
            // Show success toast here in real app
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER HERO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Liquidity Hub
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Route, save, and bridge your payroll seamlessly.</p>
                    </div>
                    <div className="bg-emerald-50/70 dark:bg-emerald-500/10 border  dark:border-emerald-500/20 px-5 py-3 rounded-2xl flex items-center gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest mb-1">Total Claimable</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                                {formattedMax} <span className="text-sm font-bold text-slate-500">USDC</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    <AllocationEngine />
                    <OmnichainBridge walletBalance={MOCK_WALLET_BAL} />
                </div>
            </div>
        </div>
    )
}