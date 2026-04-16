'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Unlock, Lock, Copy, Check, Zap, Wallet, Building2, Clock } from 'lucide-react'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import type { EmployeePayrollGroup } from '@/types'
import { useAddressResolver } from '@/hooks/identity/useAddressResolver'
import { usePayrollCycle } from '@/hooks/router/useRouterQueries'
import { flowLog, formatDuration, formatMoney, formatTimeLeft, formatTimestamp, truncateAddress } from '@/lib/utils'
import { useDisbursementRecord } from '@/hooks/dispatcher/useDispatcherQueries'

interface EmployeeGroupCardProps {
    group: EmployeePayrollGroup
    index: number
}

export default function EmployeeGroupCard({ group, index }: EmployeeGroupCardProps) {
    const [copied, setCopied] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState(0)

    const { resolvedName: initUsername } = useAddressResolver(group.employerAddress)
    const { data: payrollCycle } = usePayrollCycle(group.employerAddress as `0x${string}`, group.activeCycleId)
    const { data: disbursementRecord } = useDisbursementRecord(group.employerAddress as `0x${string}`, group.activeCycleId)


    const handleCopy = () => {
        navigator.clipboard.writeText(group.employerAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // --- CORE TIME LOGIC ---
    const payDay = payrollCycle?.payDay ? Number(payrollCycle.payDay) : 0


    const hasActiveCycle = group.activeCycleId !== 0n

    useEffect(() => {
        // Guard: Stop if there is no active cycle or payday yet
        if (!hasActiveCycle || !payDay) {
            setTimeRemaining(0)
            return
        }

        const updateCountdown = () => {
            const now = Math.floor(Date.now() / 1000)
            const diff = payDay - now
            setTimeRemaining(diff > 0 ? diff : 0)
        }

        updateCountdown() // Run instantly on mount
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [payDay, hasActiveCycle])

    // --- DERIVED UI STATES ---
    // It is past payday ONLY if there is an active cycle, payday is set, and time ran out
    const isPastPayday = hasActiveCycle && timeRemaining === 0

    // Manual trigger is needed if it's past payday, but the dispatcher hasn't executed
    const needsManualTrigger = isPastPayday && (!disbursementRecord || !disbursementRecord.executed)

    // Funds are available if it's past payday AND the dispatcher successfully executed
    const fundsAvailable = isPastPayday && disbursementRecord?.executed

    // The duration string should format the remaining difference, not the absolute timestamp
    const durationString = formatDuration(timeRemaining)

 

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.23, 1, 0.32, 1] }}
            className={`group relative flex flex-col bg-white dark:bg-[#0A0A0A] rounded-[24px] overflow-hidden transition-all duration-500 ${isPastPayday
                ? "border border-slate-200 dark:border-slate-800 shadow-xs"
                : "border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                }`}
        >
            {/* Top Section */}
            <div className="p-5 sm:p-6 pb-5">
                <div className="flex flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                            <Building2 className="w-4 h-4 text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl font-medium text-slate-900 dark:text-white leading-none">
                                    {group.name || "Payroll Stream"}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 uppercase tracking-widest shrink-0">
                                    ID: {group.groupId.toString()}
                                </span>
                            </div>
                            <div
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 mt-1 sm:mt-1.5 cursor-pointer group/copy w-fit"
                            >
                                <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 group-hover/copy:text-slate-900 dark:group-hover/copy:text-white transition-colors">
                                    {initUsername?.concat(".init") || truncateAddress(group.employerAddress)}
                                </span>
                                {copied ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <Copy className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover/copy:text-slate-900 dark:group-hover/copy:text-white transition-colors shrink-0" />}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Badges */}
                    {!hasActiveCycle ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shrink-0">
                            <Clock className="w-3 h-3 hidden sm:block" /> Waiting
                        </div>
                    ) : isPastPayday ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest  shrink-0">
                            <Unlock className="w-3 h-3 hidden sm:block" /> Unlocked
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm shrink-0">
                            <Lock className="w-3 h-3 hidden sm:block" /> Locked
                        </div>
                    )}
                </div>

                {/* Center Section */}
                <div className="mt-2">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Net Salary</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight break-all">
                            {group.employeeSalary ? formatMoney(group.employeeSalary, 6) : "0.00"}
                        </h2>
                        <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">USDC</span>
                    </div>
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800/50" />

            {/* Bottom Section: Safe State Machine Rendering */}
            <div className="p-4  bg-slate-50/50 dark:bg-[#0f0f0f] flex-1 flex flex-col justify-center">
                {!hasActiveCycle ? (
                    <div className="flex items-center gap-2.5">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Employer Setup</span>
                    </div>
                ) : timeRemaining > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Time to Payday</span>
                        </div>
                        <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {durationString}
                        </span>
                    </div>
                ) : needsManualTrigger ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1 sm:gap-0">
                            <span className="font-medium text-slate-500 text-[11px] sm:text-xs">Settlement taking too long?</span>
                        </div>
                        <Button
                            variant="outline"
                            className="h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-all text-xs sm:text-sm cursor-pointer"
                        >
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 shrink-0" /> Trigger Manually
                        </Button>
                    </div>
                ) : fundsAvailable ? (
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Funds Available</span>
                            <span className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">Check your dashboard balance</span>
                        </div>
                    </div>
                ) : null}
            </div>
        </motion.div>
    )
}