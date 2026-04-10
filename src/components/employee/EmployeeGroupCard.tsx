'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Sparkles, Clock, ChevronRight } from 'lucide-react'
import { formatUnits } from 'viem'
import type { EmployeePayrollGroup } from '@/types'
import { useAddressResolver } from '@/hooks/identity/useAddressResolver'
import { flowLog } from '@/lib/utils'

interface EmployeeGroupCardProps {
    group: EmployeePayrollGroup
    claimableAmount: bigint
    lockedAmount: bigint
    index: number
}

export default function EmployeeGroupCard({ group, claimableAmount, lockedAmount, index }: EmployeeGroupCardProps) {
    const router = useRouter()
    const initUsername = group.employerAddress && useAddressResolver(group.employerAddress);

    flowLog("INit username: ", initUsername)

    const isReady = claimableAmount > 0n

    const formatUSDC = (amount: bigint) => {
        return Number(formatUnits(amount, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const truncateAddress = (addr: string) =>
        `${addr.slice(0, 6)}...${addr.slice(-4)}`

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            onClick={() => router.push(`/employee/groups/${group.groupId.toString()}`)}
            className={`group cursor-pointer bg-white dark:bg-slate-900/40 p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${isReady
                    ? "border-emerald-200 dark:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:border-emerald-400 dark:hover:border-emerald-500/60"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-none"
                }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight  transition-colors">
                            {group.name || `Group #${group.groupId.toString()}`}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                            Employer: {truncateAddress(group.employerAddress)}
                        </p>
                    </div>
                </div>

                {isReady ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Ready
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> Locked
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/50 mb-4">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Claimable Now</p>
                    <p className="text-xl  font-bold text-slate-900 dark:text-white">
                        {formatUSDC(claimableAmount)}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1">Locked Position</p>
                    <p className="text-xl  font-bold text-slate-600 dark:text-slate-400">
                        {formatUSDC(lockedAmount)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isReady ? "Payday has arrived." : "Accruing yield in protocol."}
                </p>
                <div className="flex items-center gap-1 text-sm text-slate-800 dark:text-slate-400  hover:translate-x-1 transition-transform">
                    Manage <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    )
}