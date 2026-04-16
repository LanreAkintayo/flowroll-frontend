'use client'

import { 
    Lock, 
    Wallet, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle2, 
    Info 
} from 'lucide-react'
import { formatUnits } from 'viem'
import { useContractClient } from '@/hooks/useContractClient'
import { useTokenBalance } from '@/hooks/token/useTokenQueries'
import { useAdvanceInfo } from '@/hooks/flowroll/useFlowrollQueries'
import { formatMoney } from '@/lib/utils'

export function SalaryStats() {
    const { contracts } = useContractClient()

    const { data: usdcBalance, isLoading: isLoadingBalance } = useTokenBalance(contracts.USDC_ADDRESS)
    const { data: advanceInfo, isLoading: isLoadingAdvance } = useAdvanceInfo()

    const safeFormat = (amount?: bigint) => {
        if (amount === undefined || amount === null) return "0.00"
        return formatMoney(amount, 6)
    }

    const exactFormat = (amount?: bigint) => {
        if (amount === undefined || amount === null) return "0"
        return formatUnits(amount, 6)
    }

    const isDebtActive = (advanceInfo?.currentDebt || 0n) > 0n

    return (
        <div className="w-full bg-white dark:bg-[#0a0c10] rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

                {/* 1. Locked Salary */}
                <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b sm:border-r lg:border-b-0 border-slate-200/60 dark:border-slate-800 rounded-t-[2rem] sm:rounded-t-none sm:rounded-tl-[2rem] lg:rounded-l-[2rem]">
                    <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                        <Lock className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Locked Accrual</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />

                        <div className="absolute bottom-full left-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                                Your earned salary currently locked in the smart contract, compounding yield until payday.
                            </div>
                            <div className="absolute top-full left-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>
                    
                    <div className="group/num relative inline-flex items-baseline cursor-help">
                        <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent group-hover/num:border-slate-300 dark:group-hover/num:border-slate-700 transition-colors">
                            {isLoadingAdvance ? "..." : safeFormat(advanceInfo?.pendingSalary)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>
                        
                        {!isLoadingAdvance && advanceInfo?.pendingSalary !== undefined && (
                            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
                                <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap">
                                    {exactFormat(advanceInfo?.pendingSalary)} USDC
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Wallet Balance */}
                <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b lg:border-r lg:border-b-0 border-slate-200/60 dark:border-slate-800 sm:rounded-tr-[2rem] lg:rounded-none">
                    <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Wallet Balance</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />

                        <div className="absolute bottom-full left-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                                The liquid funds currently available in your connected Initia wallet.
                            </div>
                            <div className="absolute top-full left-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>

                    <div className="group/num relative inline-flex items-baseline cursor-help">
                        <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent group-hover/num:border-slate-300 dark:group-hover/num:border-slate-700 transition-colors">
                            {isLoadingBalance ? "..." : safeFormat(usdcBalance)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>

                        {!isLoadingBalance && usdcBalance !== undefined && (
                            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
                                <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap">
                                    {exactFormat(usdcBalance)} USDC
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Available Advance */}
                <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative border-b sm:border-b-0 sm:border-r border-slate-200/60 dark:border-slate-800 sm:rounded-bl-[2rem] lg:rounded-none">
                    <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Available Advance</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />

                        <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 lg:left-0 lg:right-auto mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                                The maximum portion of your locked accrual that you can withdraw early.
                            </div>
                            <div className="absolute top-full left-6 sm:left-auto sm:right-6 lg:left-6 lg:right-auto -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>

                    <div className="group/num relative inline-flex items-baseline cursor-help">
                        <span className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-dashed border-transparent group-hover/num:border-slate-300 dark:group-hover/num:border-slate-700 transition-colors">
                            {isLoadingAdvance ? "..." : safeFormat(advanceInfo?.maxAvailableToDraw)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-500 text-sm font-medium ml-1.5">USDC</span>

                        {!isLoadingAdvance && advanceInfo?.maxAvailableToDraw !== undefined && (
                            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
                                <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap">
                                    {exactFormat(advanceInfo?.maxAvailableToDraw)} USDC
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Active Debt */}
                <div className="p-6 xl:p-8 transition-colors hover:bg-slate-50/80 dark:hover:bg-[#0d1117] relative rounded-b-[2rem] sm:rounded-b-none sm:rounded-br-[2rem] lg:rounded-r-[2rem]">
                    <div className="flex items-center gap-2 text-slate-500 mb-4 w-fit group/tooltip cursor-help relative">
                        {isDebtActive ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Active Debt</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 opacity-50 group-hover/tooltip:opacity-100 transition-opacity" />

                        <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-3 hidden group-hover/tooltip:block z-50 w-56 sm:w-64 animate-in fade-in slide-in-from-bottom-1 duration-200">
                            <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-medium p-3 rounded-xl shadow-xl border border-slate-700/50 leading-relaxed whitespace-normal">
                                Funds withdrawn early plus protocol fees. This will be automatically deducted on your next payday.
                            </div>
                            <div className="absolute top-full left-6 sm:left-auto sm:right-6 -mt-px border-[5px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>

                    <div className="group/num relative inline-flex items-baseline cursor-help">
                        <span className={`text-3xl xl:text-4xl font-bold tracking-tight border-b-2 border-dashed transition-colors ${isDebtActive ? 'text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-900' : 'text-slate-900 dark:text-white border-transparent group-hover/num:border-slate-300 dark:group-hover/num:border-slate-700'}`}>
                            {isLoadingAdvance ? "..." : safeFormat(advanceInfo?.currentDebt)}
                        </span>
                        <span className={`${isDebtActive ? 'text-amber-600/70' : 'text-slate-600 dark:text-slate-500'} text-sm font-medium ml-1.5`}>USDC</span>

                        {!isLoadingAdvance && advanceInfo?.currentDebt !== undefined && (
                            <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 hidden group-hover/num:block z-50">
                                <div className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap">
                                    {exactFormat(advanceInfo?.currentDebt)} USDC
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}