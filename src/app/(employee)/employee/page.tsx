'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Wallet,
    ArrowUpRight,
    Lock,
    Clock,
    Building2,
    ChevronRight,
    Sparkles,
    Banknote
} from 'lucide-react'
import { formatUnits } from 'viem'
import { useEmployeeGroups } from '@/hooks/payroll/usePayrollQueries'
import { flowLog } from '@/lib/utils'
import EmployeeGroupCard from '@/components/employee/EmployeeGroupCard'

// --- MOCK DATA (Replace these with your actual Smart Contract Hooks) ---
// e.g., const { data: employeeGroups } = useEmployeeGroups(connectedAddress);
const MOCK_METRICS = {
    totalClaimable: 2500000000n, // $2,500.00
    totalLocked: 8400000000n,    // $8,400.00
    activeAdvances: 500000000n,  // $500.00
}

const MOCK_GROUPS = [
    {
        id: 1n,
        name: "Revotek Technologies",
        role: "Senior Blockchain Dev",
        claimable: 1500000000n,
        locked: 4500000000n,
        nextPayday: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
        status: "active"
    },
    {
        id: 2n,
        name: "UI-FoC Faculty",
        role: "Backend Architect",
        claimable: 1000000000n,
        locked: 3900000000n,
        nextPayday: Math.floor(Date.now() / 1000) - 3600, // Payday reached!
        status: "ready"
    }
]

export default function EmployeeDashboard() {
    const router = useRouter()

    const { data: employeeGroups, isLoading: isLoadingEmployeeGroups } = useEmployeeGroups()

    // flowLog("Employee Groups: ", employeeGroups)

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

                {/* HERO METRICS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">

                    {/* Claimable Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.03)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Available to Claim</span>
                        </div>
                        <p className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                            {formatUSDC(MOCK_METRICS.totalClaimable)} <span className="text-lg font-medium text-slate-500">USDC</span>
                        </p>
                    </motion.div>

                    {/* Locked / Incoming */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-none relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Locked Salary</span>
                        </div>
                        <p className="text-3xl lg:text-4xl  font-bold text-slate-900 dark:text-white">
                            {formatUSDC(MOCK_METRICS.totalLocked)} <span className="text-lg font-medium text-slate-500">USDC</span>
                        </p>
                    </motion.div>

                    {/* Active Advances */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-amber-100 dark:border-amber-500/20 shadow-sm dark:shadow-none relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
                                <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Advances</span>
                        </div>
                        <p className="text-3xl lg:text-4xl  font-bold text-slate-900 dark:text-white">
                            {formatUSDC(MOCK_METRICS.activeAdvances)} <span className="text-lg font-medium text-slate-500">USDC</span>
                        </p>
                    </motion.div>

                </div>

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
                                    // Calculate paid amount
                                    // const amountPaidThisGroup = employeePaidLogs
                                    //     ?.filter(log => log.groupId === group.groupId)
                                    //     .reduce((sum, log) => sum + log.share, 0n) || 0n;

                                    // Deduct paid from salary to get locked
                                    // const lockedAmount = group.employeeSalary - amountPaidThisGroup;

                                    // If locked is 0, it means it was disbursed and sits in balance
                                    // const claimableAmount = lockedAmount === 0n ? group.employeeSalary : 0n;

                                    return (
                                        <EmployeeGroupCard
                                            key={group.groupId.toString()}
                                            group={group}
                                            // claimableAmount={claimableAmount}
                                            // lockedAmount={lockedAmount}
                                            claimableAmount={0n}
                                            lockedAmount={0n}
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