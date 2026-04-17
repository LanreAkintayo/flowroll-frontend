'use client';

import { ArrowRightLeft, CheckCircle2, Loader2, Lock, Info, ExternalLink } from 'lucide-react';
import { toast } from "sonner";

import { Button } from '@/components/ui/button';
import { useOnboardingActions } from '@/hooks/onboarding/useOnboardingActions';
import { useInterwovenKit } from '@initia/interwovenkit-react';

interface Step2BridgeProps {
    isComplete: boolean;
    isUnlocked: boolean;
    evmAddress?: `0x${string}`;
}

export function Step2Bridge({ isComplete, isUnlocked, evmAddress }: Step2BridgeProps) {
    
    const { mockBridge } = useOnboardingActions(evmAddress);
    const { initiaAddress, openConnect, openBridge } = useInterwovenKit();

    // Simulated local environment action
    const handleMockAction = async () => {
        if (!evmAddress) {
            openConnect();
            return;
        }

        if (mockBridge.isPending) return;

        const toastId = toast.loading("Initiating bridge transfer...");

        try {
            await mockBridge.mutateAsync();
            toast.success("Bridge complete!", { id: toastId });
        } catch (error: any) {
            console.error("Bridge simulation failed:", error);
            toast.error(error.message || "Bridge failed. Please try again.", { id: toastId });
        }
    };

    // Native production action
    const handleNativeBridge = () => {
        if (!initiaAddress) {
            openConnect();
            return;
        }
        openBridge({
            srcChainId: 'initiation-2',
            srcDenom: 'uinit',
        });
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
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-5 items-start">
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${!isUnlocked
                                ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400'
                                : isComplete
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                    >
                        {!isUnlocked ? <Lock className="w-6 h-6" /> : isComplete ? <CheckCircle2 className="w-6 h-6" /> : <ArrowRightLeft className="w-6 h-6" />}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Bridge INIT Tokens
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
                            Simulate bridging 50 INIT from L1 to your local Flowroll account to proceed.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleMockAction}
                    disabled={!isUnlocked || isComplete || mockBridge.isPending}
                    className={`w-full sm:w-auto shrink-0 h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none shadow-sm ${!isUnlocked
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-none'
                            : isComplete
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 shadow-none cursor-default'
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        }`}
                >
                    {mockBridge.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {!isUnlocked ? 'Locked' : isComplete ? 'Bridged' : 'Bridge 50 INIT'}
                </Button>
            </div>

            {!isComplete && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Hackathon Environment Notice
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                                Because local dev chains are unregistered on the native Interwoven kit, we use the simulation above. However, the production bridge integration is fully implemented and accessible below.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleNativeBridge}
                        variant="outline"
                        disabled={!isUnlocked}
                        className="w-full sm:w-auto shrink-0 h-10 px-4 rounded-lg font-semibold text-xs cursor-pointer border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 bg-transparent transition-colors shadow-none"
                    >
                        Open Bridge
                        <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}