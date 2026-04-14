'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface OnboardingSuccessModalProps {
    isOpen: boolean;
}

export function OnboardingSuccessModal({ isOpen }: OnboardingSuccessModalProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 ">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 dark:bg-[#05070a]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-10 overflow-hidden shadow-2xl"
                    >
                        {/* Subtle Ambient Glow inside modal */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {/* Success Icon Node */}
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>

                            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                All Systems Ready
                            </div> */}

                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                                Wallet Funded
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
                                You've got all the gas and USDC you need to start exploring Flowroll and its features
                            </p>

                            <Button
                                onClick={() => router.push('/employer')}
                                className="group relative w-full h-16 pl-3 pr-8 rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold text-lg transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden border-none hover:bg-slate-800"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
                                        <Wallet className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                    </div>

                                    <span className="flex-1 text-center pr-4">Go To Dashboard</span>

                                    <ArrowRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </div>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}