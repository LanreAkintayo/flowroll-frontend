'use client';

import { Droplets, ArrowRightLeft, Zap } from 'lucide-react';

import { useNativeTokenBalance, useTokenBalance } from '@/hooks/token/useTokenQueries';
import { useContractClient } from '@/hooks/useContractClient';
import { formatMoney } from '@/lib/utils';

interface LiveBalanceHeaderProps {
    step1Complete: boolean;
    step2Complete: boolean;
    allSetupComplete: boolean;
}

export function LiveBalanceHeader({
    step1Complete,
    step2Complete,
    allSetupComplete
}: LiveBalanceHeaderProps) {
    const { contracts } = useContractClient();
    
    // Data synchronization
    const { data: initTokenBalance, isLoading: isLoadingInitTokenBalance } = useTokenBalance(contracts.BRIDGED_INIT_ADDRESS);
    const { data: usdcTokenBalance, isLoading: isLoadingUsdcTokenBalance } = useTokenBalance(contracts.USDC_ADDRESS);
    const { data: gas, isLoading: isLoadingGas } = useNativeTokenBalance();

    // Universal safe formatter
    const safeFormat = (amount: bigint | undefined | null, decimals: number) => {
        return formatMoney(amount ?? 0n, decimals);
    };

    return (
        <div className="flex justify-center w-full overflow-x-auto no-scrollbar pb-4 -mb-4">
            <div className="inline-flex items-center justify-between bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800/80 rounded-[2.5rem] sm:rounded-full p-2 shadow-sm min-w-max">

                <div className="flex items-center gap-4 px-5 sm:px-6 py-2">
                    <div className={`p-2.5 rounded-full transition-colors duration-500 ${step1Complete ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                        <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Gas</span>
                        <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            {isLoadingGas ? '...' : safeFormat(gas, 18)}
                        </span>
                    </div>
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800/80" />

                <div className="flex items-center gap-4 px-5 sm:px-6 py-2">
                    <div className={`p-2.5 rounded-full transition-colors duration-500 ${step2Complete ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                        <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Init</span>
                        <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            {isLoadingInitTokenBalance ? '...' : safeFormat(initTokenBalance, 18)}
                        </span>
                    </div>
                </div>

                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800/80" />

                <div className="flex items-center gap-4 px-5 sm:px-6 py-2 pr-6 sm:pr-8">
                    <div className={`p-2.5 rounded-full transition-colors duration-500 ${allSetupComplete ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'}`}>
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">USDC</span>
                        <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            {isLoadingUsdcTokenBalance ? '...' : safeFormat(usdcTokenBalance, 6)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}