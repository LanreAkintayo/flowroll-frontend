"use client";

import { useState, useEffect } from "react";
import {
  useGroupDetails,
  useTotalPayroll,
} from "@/hooks/payroll/usePayrollQueries";
import { formatUnits } from "viem";
import {
  Activity,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  Wallet,
  AlertTriangle,
  ServerOff,
  Terminal,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useTokenBalance } from "@/hooks/token/useTokenQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { Button } from "../ui/button";
import { flowLog, formatDuration, formatTimestamp } from "@/lib/utils";
import { useAgentStatus, useLiveYield, usePayrollCycle } from "@/hooks/router/useRouterQueries";

interface GroupStatsProps {
  groupId: bigint;
  showTerminal?: boolean;
  onToggleTerminal?: () => void;
}

export function GroupStats({ groupId, showTerminal, onToggleTerminal }: GroupStatsProps) {
  const { contracts, address } = useContractClient();
  const { data: group, isLoading: loadingGroup } = useGroupDetails(address, groupId);
  const { data: totalPayroll, isLoading: loadingPayroll } = useTotalPayroll(groupId);
  const { data: cycleData, isLoading: loadingCycle } = usePayrollCycle(address, group?.activeCycleId);
  const { data: tokenBalance, isLoading: loadingBalance } = useTokenBalance(
    contracts.USDC_ADDRESS as `0x${string}`,
  );

  // New Yield Data Hook
  const { data: yieldData } = useLiveYield(address, group?.activeCycleId);
  const { data: isAgentRunning } = useAgentStatus();

  // --- REAL-TIME PAYDAY COUNTDOWN STATE ---
  const [timeRemaining, setTimeRemaining] = useState(0);
  const payDay = cycleData?.payDay ? Number(cycleData.payDay) : 0;

  flowLog(`Group ${group?.name} has a group id of ${groupId}, active id of ${group?.activeCycleId}, and a payday of ${cycleData?.cycleDuration ? formatDuration(cycleData?.cycleDuration) : "0"}`);

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

  if (loadingGroup || loadingPayroll || loadingBalance || loadingCycle) {
    return (
      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-xs p-8 mb-8 flex items-center justify-center h-[160px]">
        <div className="flex items-center gap-3 text-slate-400 animate-pulse">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Syncing on-chain data...</span>
        </div>
      </div>
    );
  }

  const duration = formatDuration(timeRemaining);

  const formatMoney = (amount: bigint | undefined, decimal: number = 6) => {
    const rawValue = amount ? Number(formatUnits(amount, 6)) : 0;
    const exact = rawValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const compact = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(rawValue);

    return { exact, compact };
  };

  const payroll = formatMoney(totalPayroll);
  const balance = formatMoney(tokenBalance);

  // Yield Formatting
  const yieldAmount = formatMoney(yieldData?.netYield);
  const isLoss = yieldData?.isLoss ?? false;

  const hasActiveCycle = group?.activeCycleId !== 0n;
  const isPaydayReached = hasActiveCycle && timeRemaining <= 0;
  const isEngineActive = hasActiveCycle && isAgentRunning && !isPaydayReached;
  const isEngineOffline = hasActiveCycle && !isAgentRunning && !isPaydayReached;

  const isInsufficient = Boolean(
    tokenBalance && totalPayroll && tokenBalance < totalPayroll,
  );

  return (
    <div className="w-full bg-slate-100 rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-8 overflow-hidden">
      {/* THE RESPONSIVE 6-GRID WITH PERFECT 1PX GAPS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-px">

        {/* 1. Wallet Balance */}
        <div className="bg-white p-6 xl:p-8 transition-colors hover:bg-slate-50/80 relative">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Wallet className={`w-4 h-4 ${isInsufficient ? "text-amber-500" : "text-teal-500"}`} />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Wallet Balance</span>
          </div>

          <div className="group/num relative inline-flex items-baseline cursor-help">
            <span className={`text-3xl xl:text-4xl font-montserrat font-bold tracking-tight border-b-2 border-dashed ${isInsufficient ? "text-amber-600 border-amber-200" : "text-slate-900 border-slate-200 group-hover/num:border-slate-400 transition-colors"}`}>
              {balance.compact}
            </span>
            <span className={`${isInsufficient ? "text-amber-400" : "text-slate-600"} text-sm font-medium ml-1`}>USDC</span>
            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
              <div className="bg-slate-900 text-white text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                {balance.exact} USDC
              </div>
            </div>
          </div>
          {isInsufficient && (
            <div className="absolute top-6 right-6 xl:top-8 xl:right-8 group/alert cursor-help">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover/alert:block z-50 w-48">
                <div className="bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-xl">
                  Insufficient funds for next cycle
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Total Payroll */}
        <div className="bg-white p-6 xl:p-8 transition-colors hover:bg-slate-50/80">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <DollarSign className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Total Payroll</span>
          </div>
          <div className="group/num relative inline-flex items-baseline cursor-help">
            <span className="text-3xl xl:text-4xl font-montserrat font-bold text-slate-900 tracking-tight border-b-2 border-dashed border-slate-200 group-hover/num:border-slate-400 transition-colors">
              {payroll.compact}
            </span>
            <span className="text-slate-600 text-sm font-medium ml-1">USDC</span>
            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
              <div className="bg-slate-900 text-white text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                {payroll.exact} USDC
              </div>
            </div>
          </div>
        </div>

        {/* 3. NEW: Net Yield */}
        <div className="bg-white p-6 xl:p-8 transition-colors hover:bg-slate-50/80">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            {isLoss ? (
              <TrendingDown className="w-4 h-4 text-rose-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Yield Earned</span>
          </div>
          <div className="group/num relative inline-flex items-baseline cursor-help">
            <span className={`text-3xl xl:text-4xl font-montserrat font-bold tracking-tight border-b-2 border-dashed transition-colors ${isLoss ? "text-rose-600 border-rose-200 group-hover/num:border-rose-400" : "text-emerald-600 border-emerald-200 group-hover/num:border-emerald-400"}`}>
              {isLoss ? "-" : "+"}{yieldAmount.compact}
            </span>
            <span className={`text-sm font-medium ml-1 ${isLoss ? "text-rose-400" : "text-emerald-600"}`}>USDC</span>
            <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
              <div className="bg-slate-900 text-white text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                {isLoss ? "-" : "+"}{yieldAmount.exact} USDC
              </div>
            </div>
          </div>
        </div>

        {/* 4. Time to Payday */}
        <div className="bg-white p-6 xl:p-8 transition-colors hover:bg-slate-50/80">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Clock className={`w-4 h-4 ${isPaydayReached ? "text-amber-500" : "text-blue-500"}`} />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Time to Payday</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl xl:text-4xl font-montserrat font-bold tracking-tight text-slate-900">
              {duration}
            </span>
          </div>
        </div>

        {/* 5. Active Epoch */}
        <div className="bg-white p-6 xl:p-8 transition-colors hover:bg-slate-50/80">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Active Epoch</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-600 text-xl font-medium">#</span>
            <span className="text-3xl xl:text-4xl font-montserrat font-bold text-slate-900 tracking-tight">
              {group?.activeCycleId?.toString() || "0"}
            </span>
          </div>
        </div>

        {/* 6. Yield Engine */}
        {/* 6. Yield Engine */}
        <div className={`p-5 sm:p-6 xl:p-8 transition-colors flex flex-col justify-between relative overflow-hidden h-full ${isEngineActive
          ? "bg-emerald-50/60 hover:bg-emerald-50"
          : isPaydayReached
            ? "bg-amber-50/60 hover:bg-amber-50"
            : isEngineOffline
              ? "bg-rose-50/60 hover:bg-rose-50"
              : "bg-slate-50/60 hover:bg-slate-50"
          }`}
        >
          <div className="flex flex-col flex-1">
            {/* Added min-w-0 to allow text truncation on tiny screens */}
            <div className="flex items-center gap-2 text-slate-500 mb-3 sm:mb-4 relative z-10 min-w-0">
              {isEngineActive ? (
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : isPaydayReached ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
              ) : isEngineOffline ? (
                <ServerOff className="w-4 h-4 shrink-0 text-rose-500" />
              ) : (
                <Activity className="w-4 h-4 shrink-0 text-slate-400" />
              )}
              {/* Swapped whitespace-nowrap for truncate */}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest truncate">Yield Engine</span>
            </div>

            <div className="relative z-10 flex items-center gap-2.5 mt-1 min-w-0">
              {isPaydayReached ? (
                <>

                  <span className="text-amber-700 font-semibold tracking-wide text-[11px] sm:text-sm truncate">Payday Reached</span>
                </>
              ) : isEngineActive ? (
                <>

                  <span className="text-emerald-700 font-semibold tracking-wide text-[11px] sm:text-sm truncate">Active</span>
                </>
              ) : isEngineOffline ? (
                <>

                  <span className="text-rose-700 font-semibold tracking-wide text-[11px] sm:text-sm truncate">Agent Offline</span>
                </>
              ) : (
                <>
                  <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                    <span className="relative inline-flex rounded-full h-full w-full bg-slate-400"></span>
                  </div>
                  <span className="text-slate-600 tracking-wide text-[11px] sm:text-sm truncate">Idle</span>
                </>
              )}
            </div>
          </div>

          {/* Terminal Toggle Button */}
          {onToggleTerminal && (
            <Button
              onClick={onToggleTerminal}
              className={`relative z-10 mt-5 sm:mt-6 flex items-center justify-between w-full px-3 py-2 sm:px-4 sm:py-2.5 text-[10px] sm:text-xs font-semibold rounded-xl transition-all border ${isEngineActive
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"
                : isPaydayReached
                  ? "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
                  : isEngineOffline
                    ? "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20"
                    : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20"
                }`}
            >
              <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                {/* Truncate ensures the button doesn't blow out the grid width */}
                <span className="truncate">{showTerminal ? "Hide Logs" : "View Engine"}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-300 ${showTerminal ? "rotate-180" : ""}`} />
            </Button>
          )}

          {isEngineActive && <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />}
          {isPaydayReached && <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />}
          {isEngineOffline && <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />}
        </div>
      </div>
    </div>
  );
}