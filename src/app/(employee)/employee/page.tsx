'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import {
    Wallet,
    ArrowUpRight,
    Lock,
    Clock,
    Building2,
    ChevronRight,
    Sparkles,
    Banknote,
    ArrowRight,
    Zap
} from 'lucide-react'
import { formatUnits } from 'viem'
import { useEmployeeGroups } from '@/hooks/payroll/usePayrollQueries'
import { flowLog } from '@/lib/utils'
import EmployeeGroupCard from '@/components/employee/EmployeeGroupCard'
import { useAvailableBalance, useTotalLocked } from '@/hooks/vault/useVaultQueries'
import { useContractClient } from '@/hooks/useContractClient'
import { Button } from '@/components/ui/button'


export default function EmployeeDashboard() {
    const router = useRouter()
    const { address } = useContractClient()

    const { data: employeeGroups, isLoading: isLoadingEmployeeGroups } = useEmployeeGroups()
    const { data: availableBalance, isLoading: isLoadingAvailableBalance } = useAvailableBalance(address)
    const { data: totalLocked, isLoading: isLoadingTotalLocked } = useTotalLocked(address)


    flowLog("Employee Groups: ", employeeGroups);

    // Framer motion variants for that staggered, buttery entrance
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




    // Formatter utility
    const formatUSDC = (amount: bigint) => {
        return Number(formatUnits(amount, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Salary Portfolio
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Manage your claimable salary, advances, and yield across all employers.
                        </p>
                    </div>

                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
                >
                    {/* CARD 1: AVAILABLE TO CLAIM (The Dark Hero) */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-5 bg-[#0A0A0A] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-slate-900/20 group flex flex-col justify-between min-h-[220px]"
                    >
                        {/* Emerald Glow */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-colors duration-700 pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10 mb-8 lg:mb-0">
                            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                            </div>

                            {/* The Routing Button */}
                            <Button
                                onClick={() => router.push('/employee/claim')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 sm:px-5 h-9 sm:h-10 transition-all  cursor-pointer"
                            >
                                Route & Claim <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                            </Button>
                        </div>

                        <div className="relative z-10">
                            <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2">
                                Available to Claim
                            </p>
                            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter break-all">
                                    {isLoadingAvailableBalance ? "..." : formatUSDC(availableBalance!)}
                                </h2>
                                <span className="text-base sm:text-xl font-bold text-slate-500">USDC</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 2: LOCKED SALARY (The Clean Vault) */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-4 bg-white dark:bg-[#0f172a] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between group hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors min-h-[220px] relative overflow-hidden"
                    >
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700 pointer-events-none" />

                        <div className="flex justify-between items-start relative z-10 mb-8 lg:mb-0">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300" />
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                              
                                Compounding
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2">
                                Locked Salary
                            </p>
                            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter break-all">
                                    {isLoadingTotalLocked ? "..." : formatUSDC(totalLocked!)}
                                </h2>
                                <span className="text-sm sm:text-base font-bold text-slate-500">USDC</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* CARD 3: SALARY ADVANCE (The Teaser Hub) */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-1.5 bg-white dark:bg-[#0f172a] shadow-xs border border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-500/30 min-h-[220px]"
                    >
                        {/* Subtle Amber Glow */}
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors duration-500 pointer-events-none" />

                        <div className="flex flex-col h-full justify-between relative z-20">

                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-amber-100 dark:border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shrink-0">
                                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                                </div>

                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest shrink-0">
                                    Coming Soon
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                                    Salary Advance
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                                    Need liquidity now? Draw from your locked accrual before payday.
                                </p>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                                        Join Waitlist
                                    </span>
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center group-hover:translate-x-1.5 transition-transform duration-300">
                                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>

                {/* ACTIVE STREAMS GRID */}
                <div className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Active Payroll Streams</h2>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                    </div>

                    {isLoadingEmployeeGroups ? (
                        <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching your wealth portfolio...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                {employeeGroups?.map((group, idx) => {


                                    return (
                                        <EmployeeGroupCard
                                            key={idx}
                                            group={group}
                                            index={idx}
                                        />
                                    );
                                })}
                            </div>

                            {(!employeeGroups || employeeGroups.length === 0) && (
                                <div className="w-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                                    <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No active payroll streams found for this wallet.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    )
}