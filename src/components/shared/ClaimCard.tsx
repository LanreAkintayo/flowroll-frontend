'use client'

import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUnits } from 'viem'

// --- THE OMNI-THEME DICTIONARY ---
const themeMap = {
    // 1. ADAPTIVE THEMES (React to System Light/Dark Mode)
    emerald: {
        bg: "bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800/80",
        glow: "bg-emerald-400/20 dark:bg-emerald-500/20 group-hover:bg-emerald-400/30 dark:group-hover:bg-emerald-500/30",
        iconBox: "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10",
        icon: "text-emerald-600 dark:text-emerald-400",
        button: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },
    blue: {
        bg: "bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800/80",
        glow: "bg-blue-400/20 dark:bg-blue-500/20 group-hover:bg-blue-400/30 dark:group-hover:bg-blue-500/30",
        iconBox: "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10",
        icon: "text-blue-600 dark:text-blue-400",
        button: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },
    violet: {
        bg: "bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800/80",
        glow: "bg-violet-400/20 dark:bg-violet-500/20 group-hover:bg-violet-400/30 dark:group-hover:bg-violet-500/30",
        iconBox: "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10",
        icon: "text-violet-600 dark:text-violet-400",
        button: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white",
        title: "text-slate-500 dark:text-slate-400",
        value: "text-slate-900 dark:text-white",
        unit: "text-slate-400 dark:text-slate-500"
    },

    // 2. FORCED DEEP THEMES (Always dark & rich, ignores Light Mode)
    "dark-emerald": {
        bg: "bg-[#022c22] border-[#064e3b]",
        glow: "bg-emerald-500/20 group-hover:bg-emerald-500/30",
        iconBox: "bg-emerald-900/50 border-emerald-800/50",
        icon: "text-emerald-400",
        button: "bg-emerald-500 hover:bg-emerald-400 text-[#022c22]",
        title: "text-emerald-500",
        value: "text-white",
        unit: "text-emerald-600"
    },
    "dark-blue": {
        bg: "bg-[#082f49] border-[#0c4a6e]",
        glow: "bg-blue-500/20 group-hover:bg-blue-500/30",
        iconBox: "bg-blue-900/50 border-blue-800/50",
        icon: "text-blue-400",
        button: "bg-blue-500 hover:bg-blue-400 text-[#082f49]",
        title: "text-blue-500",
        value: "text-white",
        unit: "text-blue-600"
    },
    "dark-violet": {
        bg: "bg-[#2e1065] border-[#4c1d95]",
        glow: "bg-violet-500/20 group-hover:bg-violet-500/30",
        iconBox: "bg-violet-900/50 border-violet-800/50",
        icon: "text-violet-400",
        button: "bg-violet-500 hover:bg-violet-400 text-[#2e1065]",
        title: "text-violet-400",
        value: "text-white",
        unit: "text-violet-600"
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

    const activeTheme = themeMap[theme] || themeMap.emerald; // Fallback to emerald just in case

    const formatUSDC = (amount: bigint) => {
        return Number(formatUnits(amount, 6)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    return (
       <motion.div
            variants={variants}
            // Background, border, and text colors are now entirely injected from activeTheme!
            className={`border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-slate-900/20 group flex flex-col justify-between min-h-[220px] transition-colors ${activeTheme.bg} ${className || ''}`}
        >
            {/* Dynamic Glow */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl transition-colors duration-700 pointer-events-none ${activeTheme.glow}`} />

            <div className="flex justify-between items-start relative z-10 mb-8 lg:mb-0">
                {/* Dynamic Icon Box */}
                <div className={`p-3 rounded-2xl border transition-colors ${activeTheme.iconBox}`}>
                    <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${activeTheme.icon}`} />
                </div>

                {/* Dynamic Button */}
                <Button
                    onClick={onAction}
                    className={`rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 sm:px-5 h-9 sm:h-10 transition-all cursor-pointer shadow-sm border-none ${activeTheme.button}`}
                >
                    {buttonText} <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
                </Button>
            </div>

            <div className="relative z-10">
                {/* Dynamic Title */}
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2 transition-colors ${activeTheme.title}`}>
                    {title}
                </p>
                <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                    {/* Dynamic Amount */}
                    <h2 className={`text-4xl sm:text-5xl font-black tracking-tighter break-all transition-colors ${activeTheme.value}`}>
                        {isLoading ? "..." : formatUSDC(balance || 0n)}
                    </h2>
                    {/* Dynamic Currency */}
                    <span className={`text-base sm:text-xl font-bold transition-colors ${activeTheme.unit}`}>USDC</span>
                </div>
            </div>
        </motion.div>
    )
}