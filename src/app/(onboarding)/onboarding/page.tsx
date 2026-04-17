'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
import { Wallet, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useInterwovenKit } from '@initia/interwovenkit-react'
import { useAddressConversion } from '@/hooks/identity/useAddressConversion'
import { useOnboardingQueries } from '@/hooks/onboarding/useOnboardingQueries'

import { Step1ClaimGas } from '@/components/onboarding/Step1ClaimGas'
import { Step2Bridge } from '@/components/onboarding/Step2Bridge'
import { Step3Zap } from '@/components/onboarding/Step3Zap'
import { LiveBalanceHeader } from '@/components/onboarding/LiveBalanceHeader'
import { OnboardingSuccessModal } from '@/components/onboarding/OnboardingSuccessModal'
import { useContractClient } from '@/hooks/useContractClient'
import { useNativeTokenBalance, useTokenBalance } from '@/hooks/token/useTokenQueries'
import { flowLog } from '@/lib/utils'

export default function OnboardingPage() {
    const router = useRouter()

    const { initiaAddress } = useInterwovenKit()
    const { address: evmAddress, contracts } = useContractClient()

    // flowLog("Address: ", evmAddress)

    const { data: initTokenBalance } = useTokenBalance(contracts.BRIDGED_INIT_ADDRESS)
    const { data: usdcBalance } = useTokenBalance(contracts.USDC_ADDRESS);
    const { data: gas } = useNativeTokenBalance()

    flowLog(`Init token balance: `, initTokenBalance, "usdc balance is ", usdcBalance, "and gas is", gas);

    // Sync on-chain balances for the converted address
    // const { balances, isLoadingBalances } = useOnboardingQueries(evmAddress)

    // Define completion thresholds for the onboarding workflow
    // const step1Complete = balances.gas > 0.001
    // const step2Complete = (initTokenBalance ?? 0n) > 0n
    // const allSetupComplete = (usdcBalance ?? 0n) > 0n

    const step1Complete = (gas ?? 0n) > 0.1e18
    const step2Complete = (initTokenBalance ?? 0n) > 0.1e18
    const allSetupComplete = (usdcBalance ?? 0n) > 0n

    // Staggered animation layout for the setup steps
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-[#070b14] pt-12 pb-32 px-4 sm:px-6 font-sans overflow-hidden transition-colors duration-500">
            {/* Ambient background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-slate-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative max-w-3xl mx-auto space-y-12"
            >
                {/* Intro and context */}
                <motion.div variants={itemVariants} className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Get Your Wallet Ready
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                        Follow these three simple steps to get the gas and USDC you need to start using Flowroll.
                    </p>
                </motion.div>

                {/* Real-time status tracker */}
                {evmAddress && (
                    <motion.div variants={itemVariants}>
                        <LiveBalanceHeader
                            // balances={balances}
                            // isLoading={isLoadingBalances}
                            step1Complete={step1Complete}
                            step2Complete={step2Complete}
                            allSetupComplete={allSetupComplete}
                        />
                    </motion.div>
                )}

                {/* Step-by-step execution path */}
                <motion.div variants={itemVariants} className="space-y-6 relative">
                    <div className="absolute left-8 top-10 bottom-10 w-px bg-slate-200 dark:bg-slate-800 -z-10 hidden sm:block" />

                    <Step1ClaimGas isComplete={step1Complete} evmAddress={evmAddress} />
                    <Step2Bridge isComplete={step2Complete} isUnlocked={step1Complete} evmAddress={evmAddress} />
                    <Step3Zap isComplete={allSetupComplete} isUnlocked={step2Complete} evmAddress={evmAddress} />
                </motion.div>

                {/* Completion Modal: Triggered when final balance is detected */}
                <OnboardingSuccessModal isOpen={allSetupComplete} />

            </motion.div>
        </div>
    )
}