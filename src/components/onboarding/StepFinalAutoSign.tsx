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
            className={`relative rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border flex flex-col gap-6 ${
                !isUnlocked
                    ? 'opacity-50 pointer-events-none border-slate-100 dark:border-slate-900 grayscale'
                    : isComplete
                        ? 'border-emerald-500/10'
                        : 'border-slate-300 dark:border-slate-700'
            }`}
        >
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-5 items-start">
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                            !isUnlocked
                                ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                        {!isUnlocked ? <Lock className="w-6 h-6" /> : isComplete ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Enable 1-Click Protocol
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
                            Authorize transactions instantly without manual wallet prompts.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                    {!isComplete && (
                        <button
                            onClick={onSkip}
                            disabled={!isUnlocked || isProcessing}
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors py-2 px-4"
                        >
                            Skip for now
                        </button>
                    )}
                    
                    <Button
                        onClick={() => enableAutoSign.mutate()}
                        disabled={!isUnlocked || isComplete || isProcessing}
                        className={`w-full sm:w-auto h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none shadow-sm ${
                            !isUnlocked
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-none'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 shadow-none cursor-default'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        }`}
                    >
                        {isProcessing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {!isUnlocked ? 'Locked' : isComplete ? (isEnabled ? 'Protocol Active' : 'Skipped') : 'Enable Auto-Sign'}
                        {!isComplete && !isProcessing && isUnlocked && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}