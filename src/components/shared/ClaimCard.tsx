'use client'

import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUnits } from 'viem'

// --- THE ULTRA-PREMIUM GRADIENT DICTIONARY ---
const themeMap = {
    // 1. ADAPTIVE THEMES (Reacts perfectly to System Light/Dark Mode)
    emerald: {
        bg: "bg-gradient-to-br from-white to-slate-50 dark:from-[#162032] dark:to-[#0A0F1C] border-slate-200 dark:border-slate-800/60",
        glow: "bg-gradient-to-bl from-emerald-300/20 to-emerald-500/10 dark:from-emerald-500/20 dark:to-emerald-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-emerald-50/50 dark:bg-white/5 border-emerald-100/50 dark:border-white/5",
        icon: "text-emerald-600 dark:text-emerald-400",
        button: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-500 dark:hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },
    blue: {
        bg: "bg-gradient-to-br from-white to-slate-50 dark:from-[#162032] dark:to-[#0A0F1C] border-slate-200 dark:border-slate-800/60",
        glow: "bg-gradient-to-bl from-blue-300/20 to-blue-500/10 dark:from-blue-500/20 dark:to-blue-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-blue-50/50 dark:bg-white/5 border-blue-100/50 dark:border-white/5",
        icon: "text-blue-600 dark:text-blue-400",
        button: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white shadow-lg shadow-blue-500/20",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },
    amber: {
        bg: "bg-gradient-to-br from-white to-slate-50 dark:from-[#162032] dark:to-[#0A0F1C] border-slate-200 dark:border-slate-800/60",
        glow: "bg-gradient-to-bl from-amber-300/20 to-amber-500/10 dark:from-amber-500/20 dark:to-amber-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-amber-50/50 dark:bg-white/5 border-amber-100/50 dark:border-white/5",
        icon: "text-amber-600 dark:text-amber-400",
        button: "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-slate-900 dark:text-white shadow-lg shadow-amber-500/20",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },
    violet: {
        bg: "bg-gradient-to-br from-white to-slate-50 dark:from-[#162032] dark:to-[#0A0F1C] border-slate-200 dark:border-slate-800/60",
        glow: "bg-gradient-to-bl from-violet-300/20 to-violet-500/10 dark:from-violet-500/20 dark:to-violet-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-violet-50/50 dark:bg-white/5 border-violet-100/50 dark:border-white/5",
        icon: "text-violet-600 dark:text-violet-400",
        button: "bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 dark:from-violet-600 dark:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600 text-white shadow-lg shadow-violet-500/20",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },

    // 2. FORCED DARK THEMES (Uses the soft slate gradient, never turns white)
    "dark-emerald": {
        bg: "bg-gradient-to-br from-[#162032] to-[#0A0F1C] border-slate-800/60",
        glow: "bg-gradient-to-bl from-emerald-500/20 to-emerald-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-white/5 border-white/5",
        icon: "text-emerald-400",
        button: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20",
        title: "text-slate-400",
        value: "text-white",
        unit: "text-slate-500"
    },
    "dark-blue": {
        bg: "bg-gradient-to-br from-[#162032] to-[#0A0F1C] border-slate-800/60",
        glow: "bg-gradient-to-bl from-blue-500/20 to-blue-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-white/5 border-white/5",
        icon: "text-blue-400",
        button: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20",
        title: "text-slate-400",
        value: "text-white",
        unit: "text-slate-500"
    },
    "dark-violet": {
        bg: "bg-gradient-to-br from-[#162032] to-[#0A0F1C] border-slate-800/60",
        glow: "bg-gradient-to-bl from-violet-500/20 to-violet-400/10 group-hover:opacity-100 opacity-70",
        iconBox: "bg-white/5 border-white/5",
        icon: "text-violet-400",
        button: "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white shadow-lg shadow-violet-500/20",
        title: "text-slate-400",
        value: "text-white",
        unit: "text-slate-500"
    }
}

export type ThemeColor = keyof typeof themeMap;

interface ClaimCardProps {
    title?: string;
    balance: bigint | undefined;
    isLoading: boolean;
    buttonText?: string;
    theme?: ThemeColor;
    onAction: () => void;
    variants?: any; 
    className?: string; 
}

export function ClaimCard({ 
    title = "Available to Claim", 
    balance, 
    isLoading, 
    buttonText = "Route & Claim",
    theme = "emerald", 
    onAction,
    variants,
    className
}: ClaimCardProps) {

    const activeTheme = themeMap[theme] || themeMap.emerald;

    const formatUSDC = (amount: bigint) => {
        return Number(formatUnits(amount, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    return (
       <motion.div
            variants={variants}
            className={`border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-slate-900/40 group flex flex-col justify-between min-h-[220px] transition-colors ${activeTheme.bg} ${className || ''}`}
        >
            {/* The Gradient Blur Glow */}
            <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[3rem] transition-all duration-700 pointer-events-none ${activeTheme.glow}`} />

            <div className="flex justify-between items-start relative z-10 mb-8 lg:mb-0">
                <div className={`p-3 rounded-2xl border transition-colors backdrop-blur-md ${activeTheme.iconBox}`}>
                    <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${activeTheme.icon}`} />
                </div>

                <Button
                    onClick={onAction}
                    className={`rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 sm:px-5 h-9 sm:h-10 transition-all cursor-pointer border-none ${activeTheme.button}`}
                >
                    {buttonText} <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                </Button>
            </div>

            <div className="relative z-10">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2 transition-colors ${activeTheme.title}`}>
                    {title}
                </p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                    <h2 className={`text-4xl sm:text-5xl font-black tracking-tighter break-all transition-colors ${activeTheme.value}`}>
                        {isLoading ? "..." : formatUSDC(balance || 0n)}
                    </h2>
                    <span className={`text-base sm:text-xl font-bold transition-colors ${activeTheme.unit}`}>USDC</span>
                </div>
            </div>
        </motion.div>
    )
}