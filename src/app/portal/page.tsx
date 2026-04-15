export default function PortalPage(){
    return (
        <div className="min-h-screen bg-surface-900 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
        </div>
    )
}

// 'use client';

// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { Building2, Wallet, ArrowRight, Activity, Zap } from 'lucide-react';

// export default function PortalPage() {
//     const router = useRouter();

//     const handleSelectRole = (role: 'employer' | 'employee') => {
//         // Persist the choice so we can smart-route them next time
//         if (typeof window !== 'undefined') {
//             localStorage.setItem('flowroll_role', role);
//         }
//         router.push(`/${role}`);
//     };

//     const containerVariants = {
//         hidden: { opacity: 0 },
//         show: {
//             opacity: 1,
//             transition: { staggerChildren: 0.15, delayChildren: 0.1 }
//         }
//     };

//     const cardVariants = {
//         hidden: { opacity: 0, y: 30 },
//         show: { 
//             opacity: 1, 
//             y: 0, 
//             transition: { type: "spring", stiffness: 300, damping: 25 } 
//         }
//     };

//     return (
//         <div className="relative min-h-screen bg-slate-50 dark:bg-[#05070a] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
//             {/* Ambient Background Glows */}
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
//                 <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
//                 <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-slate-500/10 rounded-full blur-[120px]" />
//             </div>

//             <motion.div 
//                 variants={containerVariants}
//                 initial="hidden"
//                 animate="show"
//                 className="relative z-10 w-full max-w-4xl"
//             >
//                 <motion.div variants={cardVariants} className="text-center mb-12 space-y-3">
//                     <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
//                         Select Your Path
//                     </h1>
//                     <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
//                         Choose how you want to interact with the Flowroll protocol today.
//                     </p>
//                 </motion.div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    
//                     {/* EMPLOYER CARD */}
//                     <motion.div variants={cardVariants}>
//                         <button
//                             onClick={() => handleSelectRole('employer')}
//                             className="group relative w-full text-left bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden"
//                         >
//                             {/* Hover Gradient Sweep */}
//                             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
//                             <div className="relative z-10">
//                                 <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 transition-colors duration-500">
//                                     <Building2 className="w-8 h-8 text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-500" />
//                                 </div>
                                
//                                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
//                                     Employer Portal
//                                 </h2>
                                
//                                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-10 h-10">
//                                     Manage payroll groups, fund your main vault, and stream automated yield.
//                                 </p>

//                                 <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-300">
//                                     <Wallet className="w-4 h-4" />
//                                     <span>Enter Workspace</span>
//                                     <ArrowRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
//                                 </div>
//                             </div>
//                         </button>
//                     </motion.div>

//                     {/* EMPLOYEE CARD */}
//                     <motion.div variants={cardVariants}>
//                         <button
//                             onClick={() => handleSelectRole('employee')}
//                             className="group relative w-full text-left bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden"
//                         >
//                             {/* Hover Gradient Sweep */}
//                             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
//                             <div className="relative z-10">
//                                 <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:border-emerald-200 dark:group-hover:border-emerald-500/20 transition-colors duration-500">
//                                     <Activity className="w-8 h-8 text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-500" />
//                                 </div>
                                
//                                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
//                                     Employee Portal
//                                 </h2>
                                
//                                 <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-10 h-10">
//                                     Track your live streaming earnings, claim salaries, and manage autosave.
//                                 </p>

//                                 <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-300">
//                                     <Zap className="w-4 h-4" />
//                                     <span>View Earnings</span>
//                                     <ArrowRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
//                                 </div>
//                             </div>
//                         </button>
//                     </motion.div>

//                 </div>
//             </motion.div>
//         </div>
//     );
// }