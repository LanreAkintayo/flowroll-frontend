"use client";

import { useState, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  ArrowRight,
  Plus,
  Activity,
  Layers,
  FolderOpen,
  Wallet,
  Info,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateGroupModal } from "@/components/employer/CreateGroupModal";
import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
import { GroupCard } from "@/components/employer/GroupCard";
// import { YieldStrategyModal } from "@/components/employer/YieldStrategyModal"; // We'll create this next
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useTokenBalance } from "@/hooks/token/useTokenQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { flowLog } from "@/lib/utils";

export default function EmployerDashboard() {
  const { address } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const { contracts } = useContractClient();

  // 1. Fetch Real On-Chain Data
  const { data: employerGroups, isLoading } = useEmployerGroups();
  const { data: usdcBalance } = useTokenBalance(contracts.USDC_ADDRESS);

  flowLog("Employer Groups: ", employerGroups)

  // 3. Calculate Total Locked (Instant O(n) math)
  const totalLockedBigInt = useMemo(() => {
    return (
      employerGroups?.reduce((sum, group) => sum + group.totalPayroll, 0n) || 0n
    );
  }, [employerGroups]);

  const formattedTotalLocked = Number(
    formatUnits(totalLockedBigInt, 6),
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedUnit = formatUnits(usdcBalance ?? 0n, 6);
  const formattedBalance = usdcBalance
    ? Number(formattedUnit).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen space-y-12">
      {/* --- TOP SECTION: COMMAND CENTER --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* CARD 1: THE LIQUID TREASURY (Dark Hero) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-slate-900/20 group"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl group-hover:bg-violet-600/30 transition-colors duration-500" />

          <div className="flex flex-col h-full justify-between gap-8 relative z-10">
            <div className="flex justify-between items-start">
              <div className="bg-white/10 p-3 rounded-2xl  border border-white/10">
                <Wallet className="w-6 h-6 text-violet-400" />
              </div>
              <Button
                variant="ghost"
                className="text-violet-300 hover:text-white hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest"
                onClick={() =>
                  window.open("https://faucet.initia.xyz", "_blank")
                } // Faucet link for hackathon
              >
                Fund Wallet <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em] mb-2">
                Liquid Treasury
              </p>
              <h2 className="text-5xl font-medium text-white ">
                {formattedBalance}{" "}
                <span className="text-2xl text-slate-400 ">USDC</span>
              </h2>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: ALLOCATED CAPITAL (Clean/Stats) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-violet-200 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Earning
            </div>
          </div>

          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em] mb-2">
              Allocated Capital
            </p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              ${isLoading ? "..." : formattedTotalLocked}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Total payroll locked in yield vaults
            </p>
          </div>
        </motion.div>

        {/* CARD 3: THE STRATEGY HUB (Interactive Discovery) */}
        <motion.div
          variants={itemVariants}
          onClick={() => setIsYieldModalOpen(true)}
          className="lg:col-span-3 cursor-pointer group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 bg-white shadow-sm"
        >
          {/* CONTENT LAYER */}
          <div className="flex flex-col h-full justify-between relative z-20">
            {/* ICON: Enclosed in a "Liquid" container */}
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-50 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <ShieldCheck className="w-7 h-7 text-emerald-500" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                Strategy Hub
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Learn how the Flowroll Engine optimizes your capital.
              </p>

              {/* THE CTA: Sliding text effect */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Explore Mechanics
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* --- ACTION BAR --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">
            Active Allocations
          </h3>
          <p className="text-slate-500 font-medium">
            Manage your payroll groups and agent settings.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-800 text-white rounded-md px-6 py-3 h-auto font-bold transition-all hover:shadow-xl shadow-slate-900/20 group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Create New Group
        </Button>
      </div>

      {/* --- GRID OF GROUPS --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-50 rounded-[2rem] animate-pulse"
              />
            ))}
          </div>
        ) : !employerGroups || employerGroups.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Ready to deploy?
            </h3>
            <p className="text-slate-500 mb-8 max-w-xs">
              Create your first group to start automating your payroll with
              yield.
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-full px-8"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...employerGroups].reverse().map((group) => (
              <GroupCard key={group.groupId.toString()} group={group} />
            ))}
          </div>
        )}
      </motion.div>

      {/* MODALS */}
      <CreateGroupModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      {/*<YieldStrategyModal isOpen={isYieldModalOpen} onClose={() => setIsYieldModalOpen(false)} /> */}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { motion, Variants } from "framer-motion";
// import {
//   TrendingUp,
//   ArrowRight,
//   Plus,
//   Activity,
//   Layers,
//   FolderOpen,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { CreateGroupModal } from "@/components/employer/CreateGroupModal";
// import { useEmployerGroups } from "@/hooks/payroll/usePayrollQueries";
// import { GroupCard } from "@/components/employer/GroupCard"; // IMPORT HERE!

// const YIELD_STATS = {
//   tvl: "$124,500.00",
//   apy: "12.4%",
//   yieldEarned: "$3,450.20",
// };

// export default function EmployerDashboard() {
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const { data: employerGroups, isLoading } = useEmployerGroups();

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: { opacity: 1, transition: { staggerChildren: 0.08 } },
//   };

//   const itemVariants: Variants = {
//     hidden: { opacity: 0, y: 15 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { type: "spring", stiffness: 400, damping: 30 },
//     },
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">
//       {/* HEADER */}
//       <motion.div
//         initial={{ opacity: 0, filter: "blur(10px)" }}
//         animate={{ opacity: 1, filter: "blur(0px)" }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
//       >
//         <div>
//           <p className="text-slate-600 text-xl font-medium">
//             Monitor your yield-bearing capital and manage global allocations.
//           </p>
//         </div>

//         <Button
//           onClick={() => setIsCreateModalOpen(true)}
//           className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-3 h-auto font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 group border border-slate-700/50"
//         >
//           <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
//           New Payroll Group
//         </Button>

//         <CreateGroupModal
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//         />
//       </motion.div>

//       {/* METRICS DASHBOARD */}
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="show"
//         className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16"
//       >
//         {/* TVL */}
//         <motion.div
//           variants={itemVariants}
//           className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
//           <div className="flex justify-between items-start mb-8 relative">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-slate-900" />
//               <span className="text-sm font-medium tracking-wider text-slate-500 uppercase">
//                 Total Locked
//               </span>
//             </div>
//             <Layers className="w-5 h-5 text-slate-300" />
//           </div>
//           <h2 className="text-4xl font-black text-slate-900 tracking-tighter relative">
//             {YIELD_STATS.tvl}
//           </h2>
//         </motion.div>

//         {/* APY */}
//         <motion.div
//           variants={itemVariants}
//           className="bg-slate-900 rounded-3xl p-7 shadow-2xl shadow-slate-900/20 relative overflow-hidden transform transition-transform hover:-translate-y-1"
//         >
//           <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-500 rounded-full blur-[80px] opacity-20" />
//           <div className="flex justify-between items-start mb-8 relative">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
//               <span className="text-sm font-medium tracking-wider text-slate-300 uppercase">
//                 Live APY
//               </span>
//             </div>
//             <Activity className="w-5 h-5 text-violet-400" />
//           </div>
//           <div className="relative">
//             <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
//               {YIELD_STATS.apy}
//             </h2>
//             <p className="text-violet-300 text-sm font-medium mt-2 flex items-center gap-1.5">
//               Powered by Initia Yield <ArrowRight className="w-3 h-3" />
//             </p>
//           </div>
//         </motion.div>

//         {/* Yield Generated */}
//         <motion.div
//           variants={itemVariants}
//           className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//           <div className="flex justify-between items-start mb-8 relative">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 rounded-full bg-emerald-500" />
//               <span className="text-sm font-medium tracking-wider text-slate-500 uppercase">
//                 Yield Earned
//               </span>
//             </div>
//             <TrendingUp className="w-5 h-5 text-emerald-400" />
//           </div>
//           <h2 className="text-4xl font-black text-emerald-600 tracking-tighter relative">
//             +{YIELD_STATS.yieldEarned}
//           </h2>
//         </motion.div>
//       </motion.div>

//       {/* ACTIVE GROUPS SECTION */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-medium text-slate-900 tracking-tight">
//             Active Allocations
//           </h3>
//         </div>

//         {/* LOADING STATE */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {[1, 2].map((i) => (
//               <div
//                 key={i}
//                 className="bg-white border border-slate-200 rounded-[2rem] p-7 h-[220px] animate-pulse flex flex-col justify-between"
//               >
//                 <div className="flex justify-between">
//                   <div className="w-1/2 h-8 bg-slate-200 rounded-lg"></div>
//                   <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
//                 </div>
//                 <div className="flex gap-4">
//                   <div className="w-1/3 h-12 bg-slate-100 rounded-xl"></div>
//                   <div className="w-1/3 h-12 bg-slate-100 rounded-xl"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : !employerGroups || employerGroups.length === 0 ? (
//           /* EMPTY STATE */
//           <div className="bg-white border border-dashed border-slate-300 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
//             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
//               <FolderOpen className="w-8 h-8 text-slate-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-slate-900 mb-2">
//               No Payroll Groups Found
//             </h3>
//             <p className="text-slate-500 max-w-sm mb-6">
//               Create your first allocation group to start adding employees and
//               generating yield.
//             </p>
//             <Button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6"
//             >
//               Create Group
//             </Button>
//           </div>
//         ) : (
//           /* LIVE DATA STATE */
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {[...employerGroups].reverse().map((group) => (
//               <GroupCard key={group.groupId.toString()} group={group} />
//             ))}
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }
