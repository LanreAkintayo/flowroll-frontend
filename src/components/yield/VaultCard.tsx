'use client'

import { usePoolDetails, usePoolData } from '@/hooks/router/useRouterQueries';
import { formatMoney } from '@/lib/utils';
import { motion } from 'framer-motion'
import { ShieldCheck, Activity, Loader2, Flame } from 'lucide-react'


export interface PoolEntry {
  pool: `0x${string}`;
  isActive: boolean;
  isStablePair: boolean;
}

interface VaultCardProps {
  cycleId: bigint | undefined;
  poolIndex: bigint;
  poolEntry: PoolEntry;
}

export function VaultCard({ cycleId, poolIndex, poolEntry }: VaultCardProps) {
  // --- Data Fetching ---
  const { data: details, isLoading: loadingDetails } = usePoolDetails(poolEntry.pool);
  const { data: allocation, isLoading: loadingAllocation } = usePoolData(cycleId, poolIndex, poolEntry.pool);

  const isLoading = loadingDetails || loadingAllocation;
  
  // --- Formatting ---
  const formattedIndex = poolIndex?.toString().padStart(2, '0') || "00";
  const apy = details?.apyBps ? (Number(details.apyBps) / 100).toFixed(1) : "0.0";
  const balanceUsdc = allocation?.valueUsdc ? formatMoney(allocation.valueUsdc, 6) : "0.00";
  const sharesAmount = allocation?.shares ? formatMoney(allocation.shares, 6) : "0.00";

  // --- Theme Logic ---
  const isStable = details?.isStablePair ?? poolEntry.isStablePair;
  const Icon = isStable ? ShieldCheck : Activity;
  
  const iconBg = isStable ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-blue-50 dark:bg-blue-500/10";
  const iconColor = isStable ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400";
  const iconBorder = isStable ? "border-emerald-200 dark:border-emerald-500/20" : "border-blue-200 dark:border-blue-500/20";

  const isActive = poolEntry.isActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden"
    >
      {/* Optional: Subtle top-edge glow if active */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50" />
      )}

      {/* --- TOP SECTION: MAIN BALANCE --- */}
      <div className="py-6 px-4 pb-8">
        <div className="flex justify-between items-start mb-8">

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconBorder} ${iconBg}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                ) : (
                  details?.poolName || "Flowroll Vault"
                )}
              </h4>
              <p className="text-slate-500 text-[10px] font-bold mt-0.5 uppercase tracking-widest">
                {details?.symbol || "VAULT SHARES"}
              </p>
            </div>
          </div>

          {/* Right-aligned meta info (PID + Monitoring Pill) */}
          <div className="flex flex-col items-end gap-2">
            {/* THE STRATEGIC POOL INDEX BADGE (Top Right) */}
            {!isLoading && (
              <span className="text-slate-600 dark:text-slate-500 text-[10px] font-mono font-medium tracking-widest">
                PID-{formattedIndex}
              </span>
            )}

            {/* Sleek Live Indicator */}
            {/* <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${isActive
              ? "bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              : "bg-slate-50 dark:bg-[#0f0f0f] text-slate-400 border-transparent"
              }`}>
              {isActive && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {isActive ? "Monitoring" : "Inactive"}
            </div> */}
          </div>
          
        </div>

        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Live Allocation
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {balanceUsdc}
            </span>
            <span className="text-sm font-bold text-slate-400">USDC</span>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: THE METRICS FOOTER --- */}
      <div className="bg-slate-50 dark:bg-[#0f0f0f] border-t border-slate-200 dark:border-slate-800/80 p-5 mt-auto">
        <div className="flex justify-between items-center">

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yield Rate</p>
            <div className="flex items-center gap-1.5">
              {apy !== "0.0" && <Flame className="w-3 h-3 text-emerald-500" />}
              <p className={`text-sm font-bold tabular-nums ${apy === "0.0" ? "text-slate-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                {apy === "0.0" ? "NO YIELD" : `${apy}% APY`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Asset Shares</p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {sharesAmount}
            </p>
          </div>

        </div>
      </div>

    </motion.div>
  );
}