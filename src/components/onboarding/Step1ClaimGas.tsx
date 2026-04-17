'use client';

import { Droplets, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/onboarding/useOnboardingActions';
import { useInterwovenKit } from '@initia/interwovenkit-react';

interface Step1ClaimGasProps {
    isComplete: boolean;
    evmAddress?: `0x${string}`;
}

export function Step1ClaimGas({ isComplete, evmAddress }: Step1ClaimGasProps) {
    // Protocol setup
    const { claimFreeGas } = useOnboardingActions(evmAddress);
    const { openConnect } = useInterwovenKit();

    // Transaction orchestrator
    const handleAction = async () => {
        if (!evmAddress) {
            openConnect();
            return;
        }

        const toastId = "gas-claim-tx";

        try {
            toast.loading("Requesting native gas from faucet...", { id: toastId });
            
            // Execute gas claim
            await claimFreeGas.mutateAsync();
            
            toast.success("Gas claimed successfully!", { id: toastId });
        } catch (error: any) {
            const errorMessage = error?.shortMessage || error?.message || "Failed to claim gas. Please try again.";
            toast.error(errorMessage, { id: toastId });
        }
    };

    return (
        <div 
            className={`relative rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border ${
                isComplete 
                    ? 'border-emerald-500/10' 
                    : 'border-slate-300 dark:border-slate-700'
            }`}
        >
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-5 items-start">
                    <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                            isComplete 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                    >
                        {isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Claim Network Gas
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
                            Fund your address with native gas to execute transactions on the local Initia L2.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleAction}
                    disabled={isComplete || claimFreeGas.isPending}
                    className={`w-full sm:w-auto shrink-0 h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none ${
                        isComplete 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 cursor-default' 
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm'
                    }`}
                >
                    {claimFreeGas.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {isComplete ? 'Gas Claimed' : 'Claim 0.5 GAS'}
                </Button>
            </div>
        </div>
    );
}