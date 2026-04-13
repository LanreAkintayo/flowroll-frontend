'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Unlock, Cpu, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePayrollCycle, useLiveYield } from "@/hooks/router/useRouterQueries" // Make sure to import useLiveYield!
import { useContractClient } from "@/hooks/useContractClient"
import { AutoSaveCycle } from "@/types"
import { flowLog, formatMoney, formatTimestamp } from "@/lib/utils"

interface AutosavePositionCardProps {
    autoSaveCycle: AutoSaveCycle
    onOpenAgent: () => void
}

export function AutoSaveCard({ autoSaveCycle, onOpenAgent }: AutosavePositionCardProps) {
    const { address } = useContractClient()
    const { data: cycleData } = usePayrollCycle(address, autoSaveCycle.cycleId)
    

    flowLog("Cycle data of AutoSaveCard", cycleData)
    // Wire up the live yield for this specific cycle!
    const { data: liveYield } = useLiveYield(address, autoSaveCycle.cycleId)
    
    // Live timer so the card unlocks automatically exactly when duration ends
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // --- DERIVED SMART CONTRACT DATA ---
    const epochStr = autoSaveCycle.cycleId.toString().padStart(2, '0')
    const principalStr = formatMoney(autoSaveCycle.amountSaved, 6)
    
    // Calculation: Unlock Time = Start Time + Duration
    const unlockTime = Number(autoSaveCycle.startTime) + Number(autoSaveCycle.duration)
    // It is locked if it is active AND the current time hasn't passed the unlock time
    const isLocked = autoSaveCycle.isActive && (now < unlockTime)

    // --- REAL YIELD INTEGRATION ---
    const currentValue = liveYield ? formatMoney(liveYield.totalValue, 6) : principalStr
    const yieldEarned = liveYield ? formatMoney(liveYield.netYield, 6) : "0.00"
    const isLoss = liveYield?.isLoss ?? false
    const payTime = formatTimestamp(autoSaveCycle.startTime + autoSaveCycle.duration)

    // flowLog("Pay time: ", payTime)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative flex flex-col bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] overflow-hidden transition-all duration-300 ${isLocked
                    ? "border border-slate-200 dark:border-slate-800"
                    : "border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                }`}
        >
            {/* Top Details */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-[#141414] border border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold rounded shadow-sm tracking-widest">
                            EPOCH-{epochStr}
                        </span>
                    </div>

                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors ${isLocked
                            ? "bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        }`}>
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isLocked ? "Locked" : "Unlocked"}
                    </div>
                </div>

                {/* The Money */}
                <div className="mb-6">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Net Value</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black tabular-nums tracking-tight ${isLoss ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                            {currentValue}
                        </span>
                        <span className="text-sm font-bold text-slate-400">USDC</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium flex-wrap">
                        <span className="text-slate-400">Principal: ${principalStr}</span>
                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                        {/* Dynamic Profit/Loss styling */}
                        <span className={`font-bold ${isLoss ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {isLoss ? "-" : "+"}{yieldEarned} Yield
                        </span>
                    </div>
                </div>
            </div>

            {/* The Agent Action Footer */}
            <div className="bg-slate-50 dark:bg-[#0f0f0f] border-t border-slate-200 dark:border-slate-800/80 p-4 mt-auto">
                <Button
                    onClick={onOpenAgent}
                    variant="outline"
                    className="w-full h-12 flex items-center justify-between bg-white dark:bg-[#141414] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-bold">Agent Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </motion.div>
    )
}