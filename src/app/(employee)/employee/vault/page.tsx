'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants, AnimatePresence } from 'framer-motion'
import {
    Activity,
    ShieldCheck,
    TrendingUp,
    Info,
    Cpu,
    ArrowRight
} from 'lucide-react'

// --- Hooks & Utils ---
import { useAutoSaveCycles, useAvailableBalance } from '@/hooks/vault/useVaultQueries'
import { useContractClient } from '@/hooks/useContractClient'
import { useTokenBalance } from '@/hooks/token/useTokenQueries'
import { flowLog, formatMoney } from '@/lib/utils'

// --- Components ---
import { AutoSaveCard } from '@/components/employee/AutoSaveCard'
import { EmployeeVaultEngine } from '@/components/employee/EmployeeVaultEngine'
import { ClaimCard } from '@/components/shared/ClaimCard'

export default function EmployeeVaultPage() {
    const router = useRouter()
    const [selectedCycleId, setSelectedCycleId] = useState<bigint | null>(null)

    const { address, contracts } = useContractClient();
    
    // --- Data Fetching ---
    const { data: autoSaveCycles, isLoading } = useAutoSaveCycles(address);
    const { data: availableBalance, isLoading: isLoadingAvailableBalance } = useAvailableBalance(address)
    const { data: tokenBalance, isLoading: isLoadingTokenBalance } = useTokenBalance(contracts.USDC_ADDRESS as `0x${string}`);

    flowLog("Auto save cycles: ", autoSaveCycles);

    // --- Handlers ---
    const openAgentCenter = (cycleId: bigint) => setSelectedCycleId(cycleId)
    const closeAgentCenter = () => setSelectedCycleId(null)

    // --- Dynamic TVL Calculation ---
    const totalValueLocked = autoSaveCycles?.reduce((acc, cycle) => acc + cycle.amountSaved, 0n) || 0n;
    const formattedTVL = formatMoney(totalValueLocked, 6);

    // --- Framer Motion Variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* ========================================== */}
                    {/* --- HEADER TITLE --- */}
                    {/* ========================================== */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                Global Vault
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                
                                Yield Agent Online & Managing Assets
                            </p>
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* --- THE STAGGERED COMMAND ROW (12-GRID) --- */}
                    {/* ========================================== */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
                    >
                        {/* CARD 1: AVAILABLE TO CLAIM (Span 5) */}
                        <ClaimCard
                            className="lg:col-span-5"
                            title="Available to Claim"
                            balance={availableBalance}
                            isLoading={isLoadingAvailableBalance}
                            theme="dark-violet"
                            buttonText="Route & Claim"
                            onAction={() => router.push('/employee/claim')}
                            variants={itemVariants}
                        />

                        {/* CARD 2: WALLET BALANCE (Span 4) */}
                        <ClaimCard
                            className="lg:col-span-4"
                            title="Wallet Balance"
                            balance={tokenBalance}
                            isLoading={isLoadingTokenBalance}
                            theme="violet"
                            buttonText="View History"
                            onAction={() => console.log('Trigger Wallet Action')}
                            variants={itemVariants}
                        />

                        {/* CARD 3: HOW IT WORKS (Span 3 - Teaser Hub Style) */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1.5 bg-white dark:bg-[#0f172a] shadow-xs border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-500/30 min-h-[220px]"
                        >
                            {/* Subtle Violet Glow */}
                            <div className="absolute right-0 bottom-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-colors duration-500 pointer-events-none" />

                            <div className="flex flex-col h-full justify-between relative z-20">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-violet-100 dark:border-violet-500/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shrink-0">
                                        <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
                                    </div>

                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest shrink-0">
                                        Auto-Yield
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                                        How the Vault Works
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                                        Your salary autosaves are routed to top DeFi protocols to automatically accrue yield.
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-500">
                                            Read Docs
                                        </span>
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform duration-300">
                                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600 dark:text-violet-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* ========================================== */}
                    {/* --- ACTIVE POSITIONS GRID (THE AUTOSAVES) --- */}
                    {/* ========================================== */}
                    <div className="mt-12">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Active Positions</h2>
                                <div className="hidden sm:block h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-4 w-32" />
                            </div>
                            {/* TVL Relocated to a sleek badge */}
                            <div className="text-sm font-medium text-slate-500 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm shrink-0">
                                TVL: <span className="font-bold text-slate-900 dark:text-white tabular-nums">{formattedTVL} USDC</span>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing vault positions...</p>
                            </div>
                        ) : !autoSaveCycles || autoSaveCycles.length === 0 ? (
                            <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No active autosave positions found.</p>
                            </div>
                        ) : (
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 items-start"
                            >
                                {autoSaveCycles.map((cycle) => (
                                    <motion.div variants={itemVariants} key={cycle.cycleId.toString()}>
                                        <AutoSaveCard
                                            autoSaveCycle={cycle}
                                            onOpenAgent={() => openAgentCenter(cycle.cycleId)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* --- THE IMMERSIVE AGENT COMMAND CENTER --- */}
            {/* ========================================== */}
            <AnimatePresence>
                {selectedCycleId !== null && (
                    <EmployeeVaultEngine
                        cycleId={selectedCycleId}
                        onClose={closeAgentCenter}
                    />
                )}
            </AnimatePresence>
        </>
    )
}