'use client';

import { useState } from 'react';
import { Zap, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { parseUnits } from 'viem/utils';

import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/onboarding/useOnboardingActions';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { useContractClient } from '@/hooks/useContractClient';
import { useTokenActions } from '@/hooks/token/useTokenActions';
import { useAllowance, useTokenBalance } from '@/hooks/token/useTokenQueries';
import { formatMoney } from '@/lib/utils';

interface Step3ZapProps {
    isComplete: boolean;
    isUnlocked: boolean;
    evmAddress?: `0x${string}`;
}

export function Step3Zap({ isComplete, isUnlocked, evmAddress }: Step3ZapProps) {
    const { contracts } = useContractClient();
    const [zapInput, setZapInput] = useState<string>('');

    // Protocol integrations
    const { data: currentAllowance } = useAllowance(contracts.BRIDGED_INIT_ADDRESS, contracts.FLOWROLL_ZAPPER_ADDRESS);
    const { data: initTokenBalance } = useTokenBalance(contracts.BRIDGED_INIT_ADDRESS);
    
    const { zapTokens } = useOnboardingActions(evmAddress);
    const { approveToken } = useTokenActions(contracts.BRIDGED_INIT_ADDRESS as `0x${string}`);
    const { openConnect } = useInterwovenKit();

    // Input state calculations
    const initBalance = initTokenBalance ?? 0n;
    const amountNum = Number(zapInput);
    const parsedAmountNum = parseUnits(zapInput, 18);
    
    const isValidInput = parsedAmountNum > 0 && parsedAmountNum <= initBalance;
    const needsApproval = parsedAmountNum > (currentAllowance ?? 0n);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) {
            setZapInput(val);
        }
    };

    // Orchestrate approval and execution
    const handleAction = async () => {
        if (!evmAddress) {
            openConnect();
            return;
        }

        const toastId = "zapper-tx";

        try {
            const parsedAmount = parseUnits(zapInput, 18);

            if (needsApproval) {
                toast.loading("Approving INIT spend...", { id: toastId });

                await approveToken.mutateAsync({
                    spender: contracts.FLOWROLL_ZAPPER_ADDRESS as `0x${string}`,
                    amount: parsedAmount
                });
            }

            toast.loading(needsApproval ? "Approval successful! Zapping INIT..." : "Zapping INIT...", { id: toastId });

            await zapTokens.mutateAsync(parsedAmount);

            toast.success("Payroll engine kickstarted!", { id: toastId });
            setZapInput('');

        } catch (error: any) {
            const errorMessage = error?.shortMessage || error?.message || "Transaction failed. Please try again.";
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div
            className={`relative rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border flex flex-col gap-6 ${!isUnlocked
                ? 'opacity-50 pointer-events-none border-slate-100 dark:border-slate-900 grayscale'
                : isComplete
                    ? 'border-emerald-500/10'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
        >
            <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
                <div className="flex gap-5 items-start">
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${!isUnlocked
                            ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                            : isComplete
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                    >
                        {!isUnlocked ? <Lock className="w-6 h-6" /> : isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                    </div>
                    <div className="pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1.5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Zap to Payroll Assets
                            </h3>
                            {isUnlocked && !isComplete && (
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
                                    Avail: {formatMoney(initBalance, 18)} INIT
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                            Convert your bridged INIT into USDC for your employee vaults.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#0f0f0f] rounded-2xl p-2 border border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={zapInput}
                        onChange={handleInputChange}
                        className="flex-1 w-full h-12 bg-transparent border-none outline-none text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 px-4 disabled:opacity-50"
                        disabled={!isUnlocked || isComplete || approveToken.isPending || zapTokens.isPending}
                    />

                    <Button
                        onClick={handleAction}
                        disabled={!isUnlocked || isComplete || !zapInput || !isValidInput || approveToken.isPending || zapTokens.isPending}
                        className={`h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none shrink-0 shadow-sm ${
                            !isUnlocked || (!isValidInput && zapInput !== '')
                                ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 cursor-default shadow-none'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        }`}
                    >
                        {(approveToken.isPending || zapTokens.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {!isUnlocked
                            ? 'Locked'
                            : isComplete
                                ? 'Zapped Successfully'
                                : !isValidInput && zapInput !== ''
                                    ? 'Invalid Amount'
                                    : needsApproval
                                        ? 'Approve INIT'
                                        : 'Zap Now'
                        }
                    </Button>
                </div>
            </div>

            {isValidInput && !isComplete && (
                <div className="mt-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl p-2 border border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Estimated Output</span>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="px-3 py-1.5 bg-white dark:bg-[#0a0a0a] rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                {(amountNum * 10_000).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USDC</span>
                        </div>

                        <span className="text-slate-300 dark:text-slate-700 font-black">+</span>

                        <div className="px-3 py-1.5 bg-white dark:bg-[#0a0a0a] rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                            <span className="text-slate-700 dark:text-slate-300 font-black">
                                {(amountNum * 5).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GAS</span>
                        </div>
                    </div>
                </div>
            )}

            {amountNum > initBalance && zapInput !== '' && (
                <div className="pt-2 text-sm text-red-500 dark:text-red-400 font-bold text-right animate-in fade-in">
                    Amount exceeds available INIT balance.
                </div>
            )}
        </div>
    );
}