'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wallet,
    Lock,
    Clock,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Info,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'
import { SectionTitle } from '@/components/shared/SectionTitle'

// MOCK DATA
const MOCK_LOCKED_SALARY = 3500.85
const MOCK_WALLET_BALANCE = 1250.50
const MOCK_MAX_ADVANCE = 1500
const FEE_BPS = 150 
const NEXT_PAYDAY = "14 Days"

export default function MySalariesPage() {
    const [rawRequestAmount, setRawRequestAmount] = useState<string>('')
    const [activeDebt, setActiveDebt] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)

    const numericRequestAmount = Number(rawRequestAmount.replace(/[^0-9.]/g, ''))
    const availableToRequest = MOCK_MAX_ADVANCE - activeDebt
    const feeAmount = (numericRequestAmount * FEE_BPS) / 10000
    const netAmount = numericRequestAmount - feeAmount

    const exceedsMax = numericRequestAmount > availableToRequest
    const isInputActive = numericRequestAmount > 0

    const handleConfirmRequest = () => {
        if (numericRequestAmount < 10 || exceedsMax) return;
        setIsLoading(true)
        
        setTimeout(() => {
            setActiveDebt(prev => prev + numericRequestAmount)
            setIsLoading(false)
            setRawRequestAmount('')
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] transition-colors duration-500 pt-8 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/20">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <SectionTitle 
                    title="My Salaries" 
                    description="Monitor your wealth accrual and manage your liquidity." 
                />

                
              {/* TOP ROW: THE 4-GRID STAT ARRAY (Tooltip & Overflow Fixed) */}
<div className="w-full bg-white dark:bg-[#0a0c10] rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. Locked Salary */}
        <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b sm:border-r lg:border-b-0 border-slate-200/60 dark:border-slate-800 rounded-t-[2rem] sm:rounded-t-none sm:rounded-tl-[2rem] lg:rounded-l-[2rem]">
            <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                <Lock className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Locked Accrual</span>
                <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />
                
                {/* TOOLTIP */}
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                        Your earned salary currently locked in the smart contract, compounding yield until payday.
                    </div>
                    <div className="absolute top-full left-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
            </div>
            <div className="flex items-baseline">
                <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    {MOCK_LOCKED_SALARY.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>
            </div>
        </div>

        {/* 2. Wallet Balance */}
        <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b lg:border-r lg:border-b-0 border-slate-200/60 dark:border-slate-800 sm:rounded-tr-[2rem] lg:rounded-none">
            <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Wallet Balance</span>
                <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />
                
                {/* TOOLTIP */}
                <div className="absolute bottom-full left-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                        The liquid funds currently available in your connected Initia wallet.
                    </div>
                    <div className="absolute top-full left-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
            </div>
            <div className="flex items-baseline">
                <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    {MOCK_WALLET_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>
            </div>
        </div>

        {/* 3. Available Advance */}
        <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b sm:border-b-0 sm:border-r border-slate-200/60 dark:border-slate-800 sm:rounded-bl-[2rem] lg:rounded-none">
            <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Available Advance</span>
                <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />
                
                {/* TOOLTIP */}
                <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 lg:left-0 lg:right-auto mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                        The maximum portion of your locked accrual that you can withdraw early.
                    </div>
                    <div className="absolute top-full left-6 sm:left-auto sm:right-6 lg:left-6 lg:right-auto -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
            </div>
            <div className="flex items-baseline">
                <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    {availableToRequest.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>
            </div>
        </div>

        {/* 4. Active Debt */}
        <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative rounded-b-[2rem] sm:rounded-b-none sm:rounded-br-[2rem] lg:rounded-r-[2rem]">
            <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                {activeDebt > 0 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Active Debt</span>
                <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />
                
                {/* TOOLTIP */}
                <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                        Funds withdrawn early plus protocol fees. This will be automatically deducted on your next payday.
                    </div>
                    <div className="absolute top-full left-6 sm:left-auto sm:right-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                </div>
            </div>
            <div className="flex items-baseline">
                <span className={`text-3xl xl:text-4xl font-bold tracking-tight border-b-2 border-dashed transition-colors ${activeDebt > 0 ? 'text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900' : 'text-slate-900 dark:text-white border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    {activeDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className={`${activeDebt > 0 ? 'text-amber-600/70' : 'text-slate-600 dark:text-slate-500'} text-sm font-medium ml-1.5`}>USDC</span>
            </div>
        </div>

    </div>
</div>

                {/* BOTTOM ROW: CREDIT ENGINE & INFO CARD */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT CARD: FLOWROLL CREDIT ENGINE */}
                    
                    {/* LEFT CARD: FLOWROLL CREDIT ENGINE (Restructured & Sturdy) */}
<div className="lg:col-span-7 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
    
    {/* Subtle Header Background */}
    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 dark:from-slate-800/30 to-transparent pointer-events-none" />

    {/* Header Section */}
    <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Withdraw Advance</h3>
                <p className="text-sm  text-slate-500 dark:text-slate-400 mt-0.5">Draw liquidity instantly from your locked accrual.</p>
            </div>
        </div>
    </div>

    {/* Main Interaction Area */}
    <div className="p-8 space-y-8 flex-1 flex flex-col relative z-10">
        
        {/* Precision Input Block */}
        <div className="space-y-3">
           
            
           {/* Precision Input Block */}
        <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount to Draw</label>
                <span className="text-[11px] font-bold text-slate-400">
                    Available: <span className="text-slate-700 dark:text-slate-300">{availableToRequest.toLocaleString()} USDC</span>
                </span>
            </div>
            
            {/* DeFi Percentage Presets */}
            <div className="flex items-center gap-2">
                {[25, 50, 75, 100].map((percent) => (
                    <button
                        key={percent}
                        onClick={() => {
                            if (availableToRequest <= 0) return;
                            const calc = (availableToRequest * percent) / 100;
                            setRawRequestAmount(calc.toFixed(2).replace(/\.00$/, '')); // Keeps it clean without trailing zeros
                        }}
                        disabled={availableToRequest <= 0}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {percent === 100 ? 'MAX' : `${percent}%`}
                    </button>
                ))}
            </div>

            {/* The Sturdy, Minimal Input Container */}
            <div className={`relative flex items-center bg-white dark:bg-[#0d1117] border rounded-xl transition-colors duration-200 ${exceedsMax ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-slate-400 dark:focus-within:border-slate-500'}`}>
                
                <input 
                    type="text" 
                    inputMode="decimal"
                    value={rawRequestAmount}
                    onChange={(e) => setRawRequestAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-xl font-semibold tabular-nums py-4 pl-5 pr-20 ${exceedsMax ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}
                />
                
                {/* Pure USDC Suffix on the right */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    <span className="text-sm font-bold text-slate-400">USDC</span>
                </div>
            </div>
            
            {/* Error State */}
            {exceedsMax && (
                <div className="flex items-center gap-1.5 px-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Exceeds available limit</p>
                </div>
            )}
        </div>
            
            
        </div>

        {/* Dynamic Receipt (The Ledger Style) */}
       <div className="flex-1">
    <AnimatePresence>
        {isInputActive && !exceedsMax && (
            <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
            >
                <div className="pt-2 pb-4">
                    <div className="bg-slate-50/50 dark:bg-[#0d1117]/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-5 space-y-4">
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Gross Request</span>
                                <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {numericRequestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                    <span className="font-sans text-slate-400 text-xs ml-1.5 font-bold">USDC</span>
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    Protocol Fee 
                                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-500 font-bold tracking-normal">
                                        {(FEE_BPS / 100).toFixed(1)}%
                                    </span>
                                </span>
                                <span className="font-mono text-sm font-medium text-rose-500">
                                    -{feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                    <span className="font-sans text-rose-400/70 text-xs ml-1.5 font-bold">USDC</span>
                                </span>
                            </div>
                        </div>

                        <div className="relative h-px w-full">
                            <div className="absolute inset-0 border-t border-dashed border-slate-200 dark:border-slate-700"></div>
                        </div>

                        <div className="flex justify-between items-end pt-1">
                            <div className="space-y-1">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Net to Wallet</span>
                               
                            </div>
                            <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                {netAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                <span className="font-sans text-emerald-600/60 dark:text-emerald-500/60 text-sm font-bold ml-1.5 tracking-normal">USDC</span>
                            </span>
                        </div>

                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
</div>

        {/* Main Action Button */}
        <div className="pt-4 mt-auto">
            <button 
                onClick={handleConfirmRequest}
                disabled={numericRequestAmount < 10 || exceedsMax || availableToRequest <= 0 || isLoading}
                className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>Sign & Withdraw <Zap className="w-4 h-4 ml-1 opacity-70" /></>
                )}
            </button>
        </div>
        
    </div>
</div>

                    {/* RIGHT CARD: CREDIT HEALTH & INFO */}
                   {/* RIGHT CARD: CREDIT HEALTH & TERMS (Sleek & Independent Height) */}
<div className="lg:col-span-5 h-fit bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
    
    {/* Limit Utilized (Moved to Top as a Visual Anchor) */}
    <div className="mb-8">
        <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-slate-500" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Credit Utilization</span>
            </div>
            <span className={`text-xs font-black tabular-nums ${activeDebt > 0 ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400"}`}>
                {Math.round((activeDebt / MOCK_MAX_ADVANCE) * 100)}%
            </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(activeDebt / MOCK_MAX_ADVANCE) * 100}%` }}
                className="h-full rounded-full bg-emerald-500"
            />
        </div>
    </div>

    <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80 mb-8" />

    {/* Terms & Conditions (Minimal Ledger Style) */}
    <div className="space-y-6">
        <div className="flex items-start gap-4 group">
            <div className="mt-0.5">
                <Info className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Fixed Protocol Fee</h4>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed mt-1">
                    Flowroll enforces a strictly flat <span className="font-bold text-slate-700 dark:text-slate-300">{(FEE_BPS / 100).toFixed(1)}%</span> execution fee on all advances. The protocol guarantees zero recurring interest or hidden spreads.
                </p>
            </div>
        </div>

        <div className="flex items-start gap-4 group">
            <div className="mt-0.5">
                <Clock className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Atomic Repayment</h4>
                <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed mt-1">
                    Active debt is automatically settled via smart contract routing when the Payroll Dispatcher executes the next cycle.
                </p>
            </div>
        </div>
    </div>

    

</div>

                </div>
            </div>
        </div>
    )
}





























// 'use client'

// import { motion } from 'framer-motion'
// import { Sparkles } from 'lucide-react'
// import { SalarySection } from '@/components/employee/SalarySection'

// export default function MySalariesPage() {
//     return (
//         <div className="relative min-h-screen bg-slate-50 dark:bg-[#05070a] selection:bg-violet-500/30 overflow-hidden">
            
//             {/* --- AMBIENT BACKGROUND EFFECTS --- */}
//             {/* These create that premium Web3 depth without cluttering the UI */}
//             <div className="absolute inset-0 pointer-events-none">
//                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
//                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full" />
//                 <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 blur-[100px] rounded-full" />
//             </div>

//             <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                
//                 {/* --- CUSTOM HERO HEADER --- */}
//                 {/* Replaces the standard SectionTitle with a heavily styled header */}
//                 <motion.div 
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, ease: "easeOut" }}
//                     className="flex flex-col gap-5"
//                 >
//                     <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 w-fit backdrop-blur-md">
//                         <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
//                         <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
//                             Wealth Portfolio
//                         </span>
//                     </div>
                    
//                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//                         <div className="space-y-3">
//                             <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
//                                 My Salaries
//                             </h1>
//                             <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
//                                 Monitor your active payroll streams, track accrued earnings, and request instant advances across all your connected DAOs.
//                             </p>
//                         </div>

//                         {/* Live Network Indicator */}
//                         <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 dark:bg-[#0a0c10]/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm">
//                             <div className="relative flex h-2.5 w-2.5">
//                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
//                             </div>
//                             <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
//                                 Streams Active
//                             </span>
//                         </div>
//                     </div>
//                 </motion.div>

//                 {/* --- SLEEK DIVIDER --- */}
//                 <motion.div 
//                     initial={{ opacity: 0, scaleX: 0 }}
//                     animate={{ opacity: 1, scaleX: 1 }}
//                     transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
//                     className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent origin-left"
//                 />

//                 {/* --- YOUR CORE COMPONENT --- */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
//                 >
//                     <SalarySection />
//                 </motion.div>

//             </main>
//         </div>
//     )
// }