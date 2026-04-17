"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, HandCoins, Lock } from "lucide-react";

import { usePayrollCycle, useLiveYield } from "@/hooks/router/useRouterQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { formatMoney, formatDuration } from "@/lib/utils";

interface TreasuryHeroProps {
  cycleId: bigint;
}

export function TreasuryHero({ cycleId }: TreasuryHeroProps) {
  const { address } = useContractClient();
  
  // Protocol synchronization
  const { data: cycleData } = usePayrollCycle(address, cycleId);
  const { data: liveYieldData } = useLiveYield(address, cycleId);

  // Countdown state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const payDay = cycleData?.payDay ? Number(cycleData.payDay) : 0;

  // Financial calculations
  const totalAssets = cycleData?.totalDeposited || 0n;
  const amountInReserve = cycleData?.idleBalance || 0n;
  const yieldEarned = liveYieldData?.netYield || 0n;

  const currentAllocation = totalAssets > amountInReserve 
    ? totalAssets - amountInReserve 
    : 0n;

  // Visual metrics
  const inReservePercent = totalAssets > 0n ? (Number(amountInReserve) / Number(totalAssets)) * 100 : 0;
  const allocationPercent = totalAssets > 0n ? (Number(currentAllocation) / Number(totalAssets)) * 100 : 0;

  useEffect(() => {
    if (!payDay) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = payDay - now;
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [payDay]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
      
      {/* Reserve telemetry */}
      <div className="col-span-1 bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-950/80 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 p-6 lg:p-8 rounded-[24px] relative overflow-hidden flex flex-col justify-between dark:shadow-[0_0_30px_rgba(99,102,241,0.05)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm dark:shadow-none">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold">Payroll Reserve</h3>
            <p className="text-slate-700/70 dark:text-indigo-300/70 text-[11px] uppercase tracking-wider font-bold">Secured Base</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white">
            {formatMoney(amountInReserve, 6)} <span className="text-sm font-medium text-slate-600 dark:text-slate-400">USDC</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-none">
            <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {formatDuration(timeRemaining)} to Payday
            </span>
          </div>
        </div>
      </div>

      {/* Yield distribution visualizer */}
      <div className="col-span-1 xl:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-[24px] flex flex-col justify-between shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HandCoins className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Total Yield Generated</h3>
            </div>
            <motion.p 
              key={yieldEarned.toString()} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight"
            >
              +{formatMoney(yieldEarned, 6)} <span className="text-sm font-sans font-medium text-emerald-600/60 dark:text-emerald-400/60">USDC</span>
            </motion.p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-slate-500 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Active Capital</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatMoney(currentAllocation, 6)} USDC</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Reserve ({inReservePercent.toFixed(0)}%)
            </span>
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Deployed Yield ({allocationPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="h-3 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden flex gap-0.5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${inReservePercent}%` }} 
              className="bg-emerald-500 h-full" 
              transition={{ duration: 1, ease: "easeOut" }} 
            />
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${allocationPercent}%` }} 
              className="bg-slate-400 dark:bg-slate-600 h-full" 
              transition={{ duration: 1, ease: "easeOut" }} 
            />
          </div>
        </div>
      </div>

    </div>
  );
}