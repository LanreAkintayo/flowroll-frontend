'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Info, Clock, ArrowUpRight } from 'lucide-react'
import { useAdvanceInfo } from '@/hooks/flowroll/useFlowrollQueries'

export function CreditTermsCard() {
    // ============================================================================
    // 1. DATA FETCHING (Live Protocol Data)
    // ============================================================================
    const { data: advanceInfo, isLoading } = useAdvanceInfo()

    const activeDebt = advanceInfo?.currentDebt ?? 0n
    const available = advanceInfo?.maxAvailableToDraw ?? 0n
    const feeBps = Number(advanceInfo?.currentFeeBps ?? 150n)
    
    // Calculate total limit to find utilization percentage
    const totalLimit = activeDebt + available
    const utilizationPercent = totalLimit > 0n 
        ? Number((activeDebt * 100n) / totalLimit) 
        : 0

    return (
        <div className="h-fit bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col">
            
            {/* Subtle Top-Right Ambient Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Section: Credit Utilization */}
            <div className="mb-7 relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Credit Utilization
                        </span>
                    </div>
                    <span className={`text-sm font-black tabular-nums ${activeDebt > 0n ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                        {isLoading ? "..." : `${utilizationPercent}%`}
                    </span>
                </div>
                
                {/* Sleeker Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${utilizationPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full bg-emerald-500"
                    />
                </div>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800/60 mb-7" />

            {/* Middle Section: Terms & Conditions (Increased Font Sizes) */}
            <div className="space-y-8 relative z-10">
                
                <div className="flex items-start gap-5 group">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors shrink-0">
                        <Info className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Fixed Protocol Fee</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                            Flowroll enforces a strictly flat <span className="font-bold text-slate-700 dark:text-slate-300">{(feeBps / 100).toFixed(1)}%</span> execution fee on all advances. The protocol guarantees zero recurring interest or hidden spreads.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-5 group">
                    <div className="mt-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 border border-slate-100 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors shrink-0">
                        <Clock className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Atomic Repayment</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5">
                            Active debt is automatically settled via smart contract routing when the Payroll Dispatcher executes the next cycle.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Docs Link Footer */}
            <div className="mt-7 pt-6 border-t border-slate-100 dark:border-slate-800/60 relative z-10">
                <a
                    href="https://docs.flowroll.com/credit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <span>Flowroll Credit Docs</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </div>

        </div>
    )
}