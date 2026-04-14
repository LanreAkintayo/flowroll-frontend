'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useInterwovenKit } from '@initia/interwovenkit-react';
import { useAddressConversion } from '@/hooks/identity/useAddressConversion';
import { useOnboardingQueries } from '@/hooks/onboarding/useOnboardingQueries';

import { Step1ClaimGas } from '@/components/onboarding/Step1ClaimGas';
import { Step2Bridge } from '@/components/onboarding/Step2Bridge';
import { Step3Zap } from '@/components/onboarding/Step3Zap';
import { LiveBalanceHeader } from '@/components/onboarding/LiveBalanceHeader';
import { OnboardingSuccessModal } from '@/components/onboarding/OnboardingSuccessModal';

export default function OnboardingPage() {
    const router = useRouter();

    const { initiaAddress } = useInterwovenKit();
    const { toEvm } = useAddressConversion();
    const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>();

    useEffect(() => {
        async function fetchEvm() {
            if (!initiaAddress) {
                setEvmAddress(undefined);
                return;
            }
            try {
                const converted = await toEvm(initiaAddress);
                setEvmAddress(converted as `0x${string}`);
            } catch (err) {
                console.error("Failed to resolve EVM equivalent", err);
            }
        }
        fetchEvm();
    }, [initiaAddress, toEvm]);

    const { balances, isLoadingBalances } = useOnboardingQueries(evmAddress);

    const step1Complete = balances.gas > 0.001;
    const step2Complete = balances.init > 0;
    const allSetupComplete = balances.usdc > 0;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-[#070b14] pt-12 pb-32 px-4 sm:px-6 font-sans overflow-hidden transition-colors duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-slate-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 max-w-3xl mx-auto space-y-12"
            >
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Get Your Wallet Ready
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Follow these three simple steps to get the gas and USDC you need to start using Flowroll.
                    </p>
                </motion.div>

                {evmAddress && (
                    <motion.div variants={itemVariants}>
                        <LiveBalanceHeader
                            balances={balances}
                            isLoading={isLoadingBalances}
                            step1Complete={step1Complete}
                            step2Complete={step2Complete}
                            allSetupComplete={allSetupComplete}
                        />
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-6 relative">
                    <div className="absolute left-8 top-10 bottom-10 w-px bg-slate-200 dark:bg-slate-800 -z-10 hidden sm:block" />

                    <Step1ClaimGas isComplete={step1Complete} evmAddress={evmAddress} />
                    <Step2Bridge isComplete={step2Complete} isUnlocked={step1Complete} evmAddress={evmAddress} />
                    <Step3Zap isComplete={allSetupComplete} isUnlocked={step2Complete} evmAddress={evmAddress} />
                </motion.div>

                <OnboardingSuccessModal isOpen={allSetupComplete} />

            </motion.div>
        </div>
    );
}