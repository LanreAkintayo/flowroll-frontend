'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Building2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

interface OnboardingSuccessModalProps {
    isOpen: boolean;
}

export function OnboardingSuccessModal({ isOpen }: OnboardingSuccessModalProps) {
    const router = useRouter();
    const { setRole } = useAuthStore();

    const handleSelectRole = (selectedRole: "employer" | "employee") => {
        setRole(selectedRole); 
        router.push(`/${selectedRole}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 dark:bg-[#05070a]/80 backdrop-blur-xs"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-10 overflow-hidden shadow-2xl"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-8">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>

                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                                Wallet Funded
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
                                Your setup is complete. You now have the gas and USDC required to use Flowroll.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full">
                                {/* Employer Option*/}
                                <Button
                                    onClick={() => handleSelectRole('employer')}
                                    className="group relative w-full sm:w-1/2 h-16 pl-3 pr-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all duration-300 hover:bg-slate-900 dark:hover:bg-slate-100 hover:-translate-y-1 cursor-pointer border-none shadow-sm flex items-center"
                                >
                                    <div className="flex items-center w-full">
                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        </div>

                                        <div className="flex-1 px-3 text-left">
                                            <span className="block text-sm leading-none">Employer</span>
                                        </div>

                                        <ArrowRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </div>
                                </Button>

                                {/* Employee Option*/}
                                <Button
                                    onClick={() => handleSelectRole('employee')}
                                    variant="outline"
                                    className="group relative w-full sm:w-1/2 h-16 pl-3 pr-4 rounded-2xl bg-transparent border-slate-200 dark:border-slate-800 font-bold transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#0d1117] hover:-translate-y-1 cursor-pointer flex items-center"
                                >
                                    <div className="flex items-center w-full">
                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                        </div>

                                        <div className="flex-1 px-3 text-left">
                                            <span className="block text-sm leading-none text-slate-900 dark:text-white">Employee</span>
                                        </div>

                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900 dark:group-hover:text-white transition-all" />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}