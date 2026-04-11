'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Unlock, Lock, Copy, Check, Zap, Wallet, Building2 } from 'lucide-react'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import type { EmployeePayrollGroup } from '@/types'
import { useAddressResolver } from '@/hooks/identity/useAddressResolver'
import { usePayrollCycle } from '@/hooks/router/useRouterQueries'

interface EmployeeGroupCardProps {
    group: EmployeePayrollGroup
    claimableAmount: bigint
    index: number
}

export default function EmployeeGroupCard({ group, claimableAmount, index }: EmployeeGroupCardProps) {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState<string>("...")
    const [isPastPayday, setIsPastPayday] = useState(false)

    const { resolvedName: initUsername } = useAddressResolver(group.employerAddress)
    const { data: payrollCycle } = usePayrollCycle(group.employerAddress as `0x${string}`, group.activeCycleId)

    const formatUSDC = (amount: bigint) => Number(formatUnits(amount, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

    const handleCopy = () => {
        navigator.clipboard.writeText(group.employerAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        if (!payrollCycle?.payDay) return

        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000)
            const payDayUnix = Number(payrollCycle.payDay)
            const diff = payDayUnix - now

            if (diff <= 0) {
                setIsPastPayday(true)
                setCountdown("00:00:00:00")
                clearInterval(timer)
            } else {
                const days = Math.floor(diff / (60 * 60 * 24))
                const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60))
                const minutes = Math.floor((diff % (60 * 60)) / 60)
                const seconds = Math.floor(diff % 60)

                const d = days.toString().padStart(2, '0')
                const h = hours.toString().padStart(2, '0')
                const m = minutes.toString().padStart(2, '0')
                const s = seconds.toString().padStart(2, '0')

                setCountdown(`${d}d ${h}h ${m}m ${s}s`)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [payrollCycle?.payDay])

    const needsManualTrigger = isPastPayday && claimableAmount === 0n

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
                {/* Header changes to flex-col on very tiny screens, row on sm screens */}
                <div className="flex flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                            <Building2 className="w-4 h-4 text-slate-900 dark:text-white" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-sm font-bold text-slate-900 dark:text-white leading-none">
                                    {group.name || "Payroll Stream"}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
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

                    {/* Badges shrink-0 ensures they don't get squished */}
                    {isPastPayday ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 sm:text-[10px] font-bold uppercase tracking-widest  shrink-0">
                            <Unlock className="w-3 h-3 hidden sm:block" /> Unlocked
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm shrink-0">
                            <Lock className="w-3 h-3 hidden sm:block" /> Locked
                        </div>
                    )}
                </div>

                {/* Center Section: Salary scales perfectly now */}
                <div className="mt-2">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 sm:mb-2">Net Salary</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight break-all">
                            {group.employeeSalary ? formatUSDC(group.employeeSalary) : "0.00"}
                        </h2>
                        <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">USDC</span>
                    </div>
                </div>
            </div>

            <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800/50" />

            {/* Bottom Section: Flexible wrapping for mobile */}
            <div className="p-4  bg-slate-50/50 dark:bg-[#0f0f0f] flex-1 flex flex-col justify-center">
                {!isPastPayday ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Time to Payday</span>
                        </div>
                        <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white tabular-nums tracking-tight">
                            {countdown}
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
                ) : (
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Funds Available</span>
                            <span className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">Check your dashboard balance</span>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}