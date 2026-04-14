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
import { useRouter } from 'next/navigation'
import { ClaimCard } from "@/components/shared/ClaimCard";


export default function EmployerDashboard() {

  const router = useRouter()
  const { address } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const { contracts } = useContractClient();

  // 1. Fetch Real On-Chain Data
  const { data: employerGroups, isLoading } = useEmployerGroups();
  const { data: usdcBalance, isLoading: isLoadingBalance } = useTokenBalance(contracts.USDC_ADDRESS);

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

        <ClaimCard
          title="Liquid Treasury"
          balance={usdcBalance}
          isLoading={isLoadingBalance}
          theme="emerald" // Try "violet" or "rose" here shey you get!
          buttonText="Fund Wallet"
          onAction={() => router.push('/employee/claim')}
          variants={itemVariants}
          className="lg:col-span-5"

        />


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


