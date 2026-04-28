"use client";

import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  X,
  Info,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
import { useTokenBalance } from "@/hooks/token/useTokenQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { flowLog, formatMoney } from "@/lib/utils";

import { ClaimCard } from "@/components/shared/ClaimCard";
import GroupSection from "@/components/employer/GroupSection";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function EmployerDashboard() {
  const router = useRouter();
  const { contracts } = useContractClient();

  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const { data: employerGroups, isLoading } = useEmployerGroups();
  const { data: usdcBalance, isLoading: isLoadingBalance } = useTokenBalance(contracts.USDC_ADDRESS);

  const totalLockedBigInt = useMemo(() => {
    return employerGroups?.reduce((sum, group) => sum + group.totalPayroll, 0n) || 0n;
  }, [employerGroups]);

  const formattedTotalLocked = formatMoney(totalLockedBigInt, 6);

  const formattedBalance = usdcBalance
    ? formatMoney(usdcBalance, 6)
    : "0.00";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-6 sm:pt-8 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <SectionTitle
          title="Employer Dashboard"
          description="Manage Assets and View Active Allocations"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6"
        >
          <ClaimCard
            title="Wallet Balance"
            balance={usdcBalance}
            isLoading={isLoadingBalance}
            theme="emerald"
            buttonText="Fund Wallet"
            onAction={() => setIsFundModalOpen(true)}
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-5"
          />

          <motion.div
            variants={itemVariants}
            className="md:col-span-1 lg:col-span-4 bg-white dark:bg-[#0a0c10] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-200 dark:hover:border-violet-500/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-6 sm:mb-0">
              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Earning
              </div>
            </div>

            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
                Allocated Capital
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
                ${isLoading ? "..." : formattedTotalLocked}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
                Total payroll locked in yield vaults
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            onClick={() => setIsYieldModalOpen(true)}
            className="md:col-span-1 lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex flex-col h-full justify-between relative z-20">
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-emerald-50 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight">
                  Strategy Hub
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
                  Learn how the Flowroll Engine optimizes your capital.
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Explore Mechanics
                  </span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <GroupSection />
      </div>

     <Dialog open={isFundModalOpen} onOpenChange={setIsFundModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-0 [&>button]:hidden">
          <div className="relative z-10 flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-4 shrink-0">
            <div className="min-w-0 w-full">
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter break-words whitespace-normal">
                Wallet Funding
              </DialogTitle>
            </div>
            <button
              onClick={() => setIsFundModalOpen(false)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-5 sm:mb-6 shrink-0 border border-blue-100 dark:border-blue-500/20">
              <Info className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 break-words whitespace-normal">
              Feature in Development
            </h3>

            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 break-words whitespace-normal">
              Direct fiat and crypto funding is coming soon. For now, please utilize the{" "}
              <span className=" text-slate-900 dark:text-slate-200">
                testnet faucet allocation
              </span>{" "}
              provided to you during onboarding to test out the payroll mechanics.
            </p>

            <Button
              onClick={() => setIsFundModalOpen(false)}
              className="w-full h-11 sm:h-12 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 border-none shadow-none text-xs sm:text-sm cursor-pointer shrink-0"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



// "use client";

// import { useState, useMemo } from "react";
// import { motion, Variants, AnimatePresence } from "framer-motion";
// import {
//   ArrowRight,
//   Layers,
//   ShieldCheck,
//   X,
//   Info,
//   Droplets
// } from "lucide-react";

// import { useRouter } from 'next/navigation'

// import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
// import { useTokenBalance } from "@/hooks/token/useTokenQueries";
// import { useContractClient } from "@/hooks/useContractClient";
// import { flowLog, formatMoney } from "@/lib/utils";

// import { ClaimCard } from "@/components/shared/ClaimCard";
// import GroupSection from "@/components/employer/GroupSection";
// import { SectionTitle } from "@/components/shared/SectionTitle";
// import { Button } from "@/components/ui/button";

// export default function EmployerDashboard() {
//   const router = useRouter();
//   const { contracts } = useContractClient();

//   // Local UI state
//   const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
//   const [isFundModalOpen, setIsFundModalOpen] = useState(false);

//   // Protocol data synchronization
//   const { data: employerGroups, isLoading } = useEmployerGroups();
//   const { data: usdcBalance, isLoading: isLoadingBalance } = useTokenBalance(contracts.USDC_ADDRESS);

//   // memoize aggregate payroll to prevent redundant math on re-renders
//   const totalLockedBigInt = useMemo(() => {
//     return employerGroups?.reduce((sum, group) => sum + group.totalPayroll, 0n) || 0n;
//   }, [employerGroups]);

//   // presentation formatting for financial metrics
//   const formattedTotalLocked = formatMoney(totalLockedBigInt, 6);

//   const formattedBalance = usdcBalance
//     ? formatMoney(usdcBalance, 6)
//     : "0.00";

//   // Animation layout 
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   };

//   const itemVariants: Variants = {
//     hidden: { opacity: 0, y: 20 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 300, damping: 24 },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-6 sm:pt-8 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

//         <SectionTitle
//           title="Employer Dashboard"
//           description="Manage Assets and View Active Allocations"
//         />

//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6"
//         >
//           {/* Liquidity Management Module */}
//           <ClaimCard
//             title="Wallet Balance"
//             balance={usdcBalance}
//             isLoading={isLoadingBalance}
//             theme="emerald"
//             buttonText="Fund Wallet"
//             onAction={() => setIsFundModalOpen(true)}
//             variants={itemVariants}
//             className="md:col-span-2 lg:col-span-5"
//           />

//           {/* Aggregate Yield Metrics */}
//           <motion.div
//             variants={itemVariants}
//             className="md:col-span-1 lg:col-span-4 bg-white dark:bg-[#0a0c10] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-200 dark:hover:border-violet-500/30 transition-colors"
//           >
//             <div className="flex justify-between items-start mb-6 sm:mb-0">
//               <div className="bg-slate-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
//                 <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
//               </div>
//               <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
//                 Earning
//               </div>
//             </div>

//             <div>
//               <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
//                 Allocated Capital
//               </p>
//               <h2 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
//                 ${isLoading ? "..." : formattedTotalLocked}
//               </h2>
//               <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
//                 Total payroll locked in yield vaults
//               </p>
//             </div>
//           </motion.div>

//           {/* Protocol Mechanics Explorer */}
//           <motion.div
//             variants={itemVariants}
//             onClick={() => setIsYieldModalOpen(true)}
//             className="md:col-span-1 lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 shadow-sm"
//           >
//             <div className="flex flex-col h-full justify-between relative z-20">
//               <div className="mb-6 sm:mb-8">
//                 <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-emerald-50 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
//                   <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight">
//                   Strategy Hub
//                 </h3>
//                 <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
//                   Learn how the Flowroll Engine optimizes your capital.
//                 </p>

//                 <div className="flex items-center gap-2">
//                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600">
//                     Explore Mechanics
//                   </span>
//                   <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
//                     <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>

//         <GroupSection />

//       </div>

//       {/* Feature Notice Modal */}
//       <AnimatePresence>
//         {isFundModalOpen && (
//           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.2 }}
//               onClick={() => setIsFundModalOpen(false)}
//               className="absolute inset-0 bg-slate-900/80 dark:bg-[#05070a]/90 backdrop-blur-sm"
//             />

//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 10 }}
//               transition={{ type: "spring", stiffness: 400, damping: 30 }}
//               className="relative z-10 w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col"
//             >
//               <div className="relative z-10 flex items-start sm:items-center justify-between mb-6 gap-4 shrink-0">
//                 <div className="min-w-0">
//                   <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tighter break-words whitespace-normal">
//                     Funding
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => setIsFundModalOpen(false)}
//                   className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
//                 >
//                   <X className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </button>
//               </div>

//               <div className="flex flex-col items-center text-center w-full">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 shrink-0 border border-blue-100 dark:border-blue-500/20">
//                   <Info className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
//                 </div>
                
//                 <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 break-words whitespace-normal">
//                   Feature in Development
//                 </h3>
                
//                 <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 break-words whitespace-normal">
//                   Direct fiat and crypto funding is coming soon. For now, please utilize the <span className="font-bold text-slate-900 dark:text-slate-200">testnet faucet allocation</span> provided to you during onboarding to test out the payroll mechanics.
//                 </p>

//                 <Button
//                   onClick={() => setIsFundModalOpen(false)}
//                   className="w-full h-12 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 border-none shadow-none"
//                 >
//                   Understood
//                 </Button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//     </div>
//   );
// }


// "use client";

// import { useState, useMemo } from "react";
// import { motion, Variants } from "framer-motion";
// import {
//   ArrowRight,
//   Layers,
//   ShieldCheck,
//   Zap,
// } from "lucide-react";

// import { useRouter } from 'next/navigation'

// import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
// import { useTokenBalance } from "@/hooks/token/useTokenQueries";
// import { useContractClient } from "@/hooks/useContractClient";
// import { flowLog, formatMoney } from "@/lib/utils";

// import { ClaimCard } from "@/components/shared/ClaimCard";
// import GroupSection from "@/components/employer/GroupSection";
// import { SectionTitle } from "@/components/shared/SectionTitle";

// export default function EmployerDashboard() {
//   const router = useRouter();
//   const { contracts } = useContractClient();

//   // Local UI state
//   const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);

//   // Protocol data synchronization
//   const { data: employerGroups, isLoading } = useEmployerGroups();
//   const { data: usdcBalance, isLoading: isLoadingBalance } = useTokenBalance(contracts.USDC_ADDRESS);

//   // memoize aggregate payroll to prevent redundant math on re-renders
//   const totalLockedBigInt = useMemo(() => {
//     return employerGroups?.reduce((sum, group) => sum + group.totalPayroll, 0n) || 0n;
//   }, [employerGroups]);

//   // presentation formatting for financial metrics
//   const formattedTotalLocked = formatMoney(totalLockedBigInt, 6);

//   const formattedBalance = usdcBalance
//     ? formatMoney(usdcBalance, 6)
//     : "0.00";

//   // Animation layout 
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.1 } },
//   };

//   const itemVariants: Variants = {
//     hidden: { opacity: 0, y: 20 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 300, damping: 24 },
//     },
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-6 sm:pt-8 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

//         <SectionTitle
//           title="Employer Dashboard"
//           description="Manage Assets and View Active Allocations"
//         />

//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6"
//         >
//           {/* Liquidity Management Module */}
//           <ClaimCard
//             title="Wallet Balance"
//             balance={usdcBalance}
//             isLoading={isLoadingBalance}
//             theme="emerald"
//             buttonText="Fund Wallet"
//             onAction={() => router.push('/claim')}
//             variants={itemVariants}
//             className="md:col-span-2 lg:col-span-5"
//           />

//           {/* Aggregate Yield Metrics */}
//           <motion.div
//             variants={itemVariants}
//             className="md:col-span-1 lg:col-span-4 bg-white dark:bg-[#0a0c10] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-200 dark:hover:border-violet-500/30 transition-colors"
//           >
//             <div className="flex justify-between items-start mb-6 sm:mb-0">
//               <div className="bg-slate-50 dark:bg-slate-900 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
//                 <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
//               </div>
//               <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
//                 Earning
//               </div>
//             </div>

//             <div>
//               <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] mb-1.5 sm:mb-2">
//                 Allocated Capital
//               </p>
//               <h2 className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">
//                 ${isLoading ? "..." : formattedTotalLocked}
//               </h2>
//               <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2">
//                 Total payroll locked in yield vaults
//               </p>
//             </div>
//           </motion.div>

//           {/* Protocol Mechanics Explorer */}
//           <motion.div
//             variants={itemVariants}
//             onClick={() => setIsYieldModalOpen(true)}
//             className="md:col-span-1 lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 shadow-sm"
//           >
//             <div className="flex flex-col h-full justify-between relative z-20">
//               <div className="mb-6 sm:mb-8">
//                 <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-emerald-50 dark:border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
//                   <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tight">
//                   Strategy Hub
//                 </h3>
//                 <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6">
//                   Learn how the Flowroll Engine optimizes your capital.
//                 </p>

//                 <div className="flex items-center gap-2">
//                   <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-600">
//                     Explore Mechanics
//                   </span>
//                   <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
//                     <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>

//         <GroupSection />

//       </div>
//     </div>
//   );
// }

