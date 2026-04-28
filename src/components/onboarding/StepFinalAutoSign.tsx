'use client';

import { ShieldCheck, CheckCircle2, Loader2, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

import { Button } from '@/components/ui/button';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { TESTNET_EVM, TESTNET_COSMOS_ID, APPCHAIN_COSMOS_ID } from '@/lib/interwoven';

interface StepFinalAutoSignProps {
    isComplete: boolean;
    isUnlocked: boolean;
    onSkip: () => void;
}

export function StepFinalAutoSign({ isComplete, isUnlocked, onSkip }: StepFinalAutoSignProps) {
    const { autoSign } = useInterwovenKit();
    const chainId = useChainId();
    
    const activeCosmosId = chainId === TESTNET_EVM.id ? TESTNET_COSMOS_ID : APPCHAIN_COSMOS_ID;
    const isEnabled = autoSign?.isEnabledByChain[activeCosmosId] || false;

    const enableAutoSign = useMutation({
        mutationFn: () => autoSign.enable(activeCosmosId),
        onSuccess: () => toast.success("1-Click Protocol Activated!"),
        onError: (error: any) => toast.error(error.message || "Activation failed"),
    });

    const isProcessing = enableAutoSign.isPending || autoSign.isLoading;

    return (
        <div
            className={`relative rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border flex flex-col w-full ${
                !isUnlocked
                    ? 'opacity-50 pointer-events-none border-slate-100 dark:border-slate-900 grayscale'
                    : isComplete
                        ? 'border-emerald-500/20 dark:border-emerald-500/10'
                        : 'border-slate-200 dark:border-slate-800'
            }`}
        >
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center justify-between w-full">
                
                {/* Left side: Icon & Text */}
                <div className="flex gap-3 sm:gap-5 items-start sm:items-center w-full">
                    <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                            !isUnlocked
                                ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                                    : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                        }`}
                    >
                        {!isUnlocked ? <Lock className="w-5 h-5 sm:w-6 sm:h-6" /> : isComplete ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </div>
                    <div className="flex flex-col justify-center w-full">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight break-words whitespace-normal">
                            Enable 1-Click Protocol
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed max-w-md break-words whitespace-normal">
                            Authorize transactions instantly without manual wallet prompts.
                        </p>
                    </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    {!isComplete && (
                        <button
                            onClick={onSkip}
                            disabled={!isUnlocked || isProcessing}
                            className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-2 px-4 w-full sm:w-auto text-center"
                        >
                            Skip for now
                        </button>
                    )}
                    
                    <Button
                        onClick={() => enableAutoSign.mutate()}
                        disabled={!isUnlocked || isComplete || isProcessing}
                        className={`w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none text-xs sm:text-sm ${
                            !isUnlocked
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 cursor-default'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        }`}
                    >
                        {isProcessing && <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin mr-1.5 sm:mr-2 shrink-0" />}
                        <span className="whitespace-normal break-words text-center">
                            {!isUnlocked ? 'Locked' : isComplete ? (isEnabled ? 'Protocol Active' : 'Skipped') : 'Enable Auto-Sign'}
                        </span>
                        {!isComplete && !isProcessing && isUnlocked && <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 shrink-0" />}
                    </Button>
                </div>

            </div>
        </div>
    );
}