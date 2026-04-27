'use client';

import { Droplets, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useChainId } from 'wagmi';

import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/onboarding/useOnboardingActions';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { TESTNET_EVM } from '@/lib/interwoven';

interface Step1ClaimGasProps {
    isComplete: boolean;
    isUnlocked: boolean; // Added this to accept the master lock from OnboardingFlow
    evmAddress?: `0x${string}`;
}

export function Step1ClaimGas({ isComplete, isUnlocked, evmAddress }: Step1ClaimGasProps) {
    const { claimFreeGas } = useOnboardingActions(evmAddress);
    const { openConnect } = useInterwovenKit();
    const chainId = useChainId();

    const isTestnet = chainId === TESTNET_EVM.id;
    const symbol = isTestnet ? 'INIT' : 'GAS';
    
    // Synced with the parseEther("0.1") we set in your backend route
    const amountToClaim = 0.1; 

    const handleAction = async () => {
        if (!evmAddress) {
            openConnect();
            return;
        }

        if (claimFreeGas.isPending) return;

        const toastId = "gas-claim-tx";

        try {
            toast.loading(`Requesting native ${symbol} from faucet...`, { id: toastId });
            
            await claimFreeGas.mutateAsync();
            
            toast.success(`${symbol} claimed successfully!`, { id: toastId });
        } catch (error: any) {
            const errorMessage = error?.shortMessage || error?.message || `Failed to claim ${symbol}. Please try again.`;
            toast.error(errorMessage, { id: toastId });
        }
    };

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
                        {!isUnlocked ? <Lock className="w-6 h-6" /> : isComplete ? <CheckCircle2 className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Claim Network Gas
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
                            Fund your address with native gas to execute transactions on Flowroll.
                        </p>
                        
                        {/* Only show the official Initia faucet link if they are on the Testnet */}
                        {isTestnet && (
                            <a 
                                href="https://app.testnet.initia.xyz/faucet" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-700 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline mt-1 block"
                            >
                                Request for more INIT 
                            </a>
                        )}
                    </div>
                </div>

                <Button
                    onClick={handleAction}
                    disabled={!isUnlocked || isComplete || claimFreeGas.isPending}
                    className={`w-full sm:w-auto shrink-0 h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none shadow-sm ${
                        !isUnlocked 
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-none'
                            : isComplete 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 cursor-default shadow-none' 
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                    }`}
                >
                    {claimFreeGas.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {!isUnlocked ? 'Locked' : isComplete ? 'Gas Claimed' : `Claim ${amountToClaim} ${symbol}`}
                </Button>
            </div>
        </div>
    );
}