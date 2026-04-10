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
  CheckCircle2
} from "lucide-react";
import { useTokenBalance } from "@/hooks/token/useTokenQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { flowLog } from "@/lib/utils";
import { useAgentStatus, usePayrollCycle } from "@/hooks/router/useRouterQueries";

interface GroupStatsProps {
  groupId: bigint;
  showTerminal?: boolean;
  onToggleTerminal?: () => void;
}

export function GroupStats({ groupId, showTerminal, onToggleTerminal }: GroupStatsProps) {
  const { contracts } = useContractClient();
  const { data: group, isLoading: loadingGroup } = useGroupDetails(groupId);
  const { data: totalPayroll, isLoading: loadingPayroll } = useTotalPayroll(groupId);
  const { data: cycleData, isLoading: loadingCycle } = usePayrollCycle(groupId);
  const { data: tokenBalance, isLoading: loadingBalance } = useTokenBalance(
    contracts.USDC_ADDRESS as `0x${string}`,
  );

  const { data: isAgentRunning } = useAgentStatus();
  
  // --- REAL-TIME PAYDAY COUNTDOWN STATE ---
  const [timeRemaining, setTimeRemaining] = useState(0);
  const payDay = cycleData?.payDay ? Number(cycleData.payDay) : 0;

  useEffect(() => {
    if (!payDay) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = payDay - now;
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    updateCountdown(); // Call immediately 
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [payDay]);

  if (loadingGroup || loadingPayroll || loadingBalance || loadingCycle) {
    return (
      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8 flex items-center justify-center h-[160px]">
        <div className="flex items-center gap-3 text-slate-400 animate-pulse">
          <Activity className="w-5 h-5" />
          <span className="text-sm font-medium">Syncing on-chain data...</span>
        </div>
      </div>
    );
  }

  // Uses the live timeRemaining instead of the static cycle duration
  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds <= 0) return { value: "0", unit: "Secs" };
    if (totalSeconds >= 86400)
      return {
        value: +(totalSeconds / 86400).toFixed(1),
        unit: totalSeconds >= 172800 ? "Days" : "Day",
      };
    if (totalSeconds >= 3600)
      return {
        value: +(totalSeconds / 3600).toFixed(1),
        unit: totalSeconds >= 7200 ? "Hours" : "Hour",
      };
    if (totalSeconds >= 60)
      return {
        value: +(totalSeconds / 60).toFixed(1),
        unit: totalSeconds >= 120 ? "Mins" : "Min",
      };
    return { value: totalSeconds.toString(), unit: "Secs" };
  };

  const duration = formatDuration(timeRemaining);

  const formatMoney = (amount: bigint | undefined) => {
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

  const hasActiveCycle = group?.activeCycleId !== 0n;
  
  // THE NEW LOGIC: Yielding stops if payday is reached
  const isPaydayReached = hasActiveCycle && timeRemaining <= 0;
  const isEngineActive = hasActiveCycle && isAgentRunning && !isPaydayReached;
  const isEngineOffline = hasActiveCycle && !isAgentRunning && !isPaydayReached; 

  const isInsufficient = Boolean(
    tokenBalance && totalPayroll && tokenBalance < totalPayroll,
  );

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-8 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 lg:divide-x divide-slate-100 h-full">
        
        {/* Wallet Balance */}
        <div className="p-8 transition-colors hover:bg-slate-50/50 relative">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Wallet className={`w-4 h-4 ${isInsufficient ? "text-amber-500" : "text-teal-500"}`} />
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Wallet Balance</span>
          </div>

          <div className="group/num relative inline-flex items-baseline cursor-help">
            <span className={`text-4xl font-montserrat font-bold tracking-tight border-b-2 border-dashed ${isInsufficient ? "text-amber-600 border-amber-200" : "text-slate-900 border-slate-200 group-hover/num:border-slate-400 transition-colors"}`}>
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
            <div className="absolute top-8 right-8 group/alert cursor-help">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
              <div className="absolute top-full right-0 mt-2 hidden group-hover/alert:block z-50 w-48">
                <div className="bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-xl">
                  Insufficient funds for next cycle
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total Payroll */}
        <div className="p-8 transition-colors hover:bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <DollarSign className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Payroll</span>
          </div>
          <div className="group/num relative inline-flex items-baseline cursor-help">
            <span className="text-4xl font-montserrat font-bold text-slate-900 tracking-tight border-b-2 border-dashed border-slate-200 group-hover/num:border-slate-400 transition-colors">
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

        {/* --- THE UPDATED PAYDAY SECTION --- */}
        <div className="p-8 transition-colors hover:bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Clock className={`w-4 h-4 ${isPaydayReached ? "text-amber-500" : "text-blue-500"}`} />
            <span className="text-xs font-bold uppercase tracking-widest">Time to Payday</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-montserrat font-bold tracking-tight ${isPaydayReached ? "text-amber-500" : "text-slate-900"}`}>
              {duration.value}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {isPaydayReached ? "Due" : duration.unit}
            </span>
          </div>
        </div>

        {/* Active Epoch */}
        <div className="p-8 transition-colors hover:bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-500 mb-4">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Active Epoch</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-600 text-xl font-medium">#</span>
            <span className="text-4xl font-montserrat font-bold text-slate-900 tracking-tight">
              {group?.activeCycleId?.toString() || "0"}
            </span>
          </div>
        </div>

        {/* Yield Engine */}
        <div className={`p-8 transition-colors flex flex-col justify-between relative overflow-hidden ${
            isEngineActive 
              ? "bg-emerald-50/30" 
              : isPaydayReached
                ? "bg-amber-50/30"
                : isEngineOffline 
                  ? "bg-rose-50/30" 
                  : "bg-slate-50/30"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5 text-slate-500 mb-4 relative z-10">
              {isEngineActive ? (
                <Sparkles className="w-4 h-4 text-emerald-500" />
              ) : isPaydayReached ? (
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
              ) : isEngineOffline ? (
                <ServerOff className="w-4 h-4 text-rose-500" />
              ) : (
                <Activity className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-bold uppercase tracking-widest">Yield Engine</span>
            </div>

            <div className="relative z-10 flex items-center gap-3 mt-1">
              {isPaydayReached ? (
                <>
                  <div className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </div>
                  <span className="text-amber-700 font-semibold tracking-wide text-sm">Payday Reached</span>
                </>
              ) : isEngineActive ? (
                <>
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-emerald-700 font-semibold tracking-wide text-sm">Active</span>
                </>
              ) : isEngineOffline ? (
                <>
                  <div className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </div>
                  <span className="text-rose-700 font-semibold tracking-wide text-sm">Agent Offline</span>
                </>
              ) : (
                <>
                  <div className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                  </div>
                  <span className="text-slate-600 tracking-wide text-sm">Idle</span>
                </>
              )}
            </div>
          </div>

          {/* Terminal Toggle Button */}
          {onToggleTerminal && (
            <Button
              onClick={onToggleTerminal}
              className={`relative z-10 mt-6 flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border ${
                isEngineActive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"
                  : isPaydayReached
                  ? "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
                  : isEngineOffline
                  ? "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20"
                  : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20"
              }`}
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                {showTerminal ? "Hide Logs" : "View Terminal"}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showTerminal ? "rotate-180" : ""}`} />
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


// "use client";

// import {
//   useGroupDetails,
//   useTotalPayroll,
// } from "@/hooks/payroll/usePayrollQueries";
// import { formatUnits } from "viem";
// import {
//   Activity,
//   Clock,
//   DollarSign,
//   Layers,
//   Sparkles,
//   Wallet,
//   AlertTriangle,
//   ServerOff,
//   Terminal,
//   ChevronDown,
// } from "lucide-react";
// import { useTokenBalance } from "@/hooks/token/useTokenQueries";
// import { useContractClient } from "@/hooks/useContractClient";
// import { useQuery } from "@tanstack/react-query";
// import { Button } from "../ui/button";
// import { flowLog } from "@/lib/utils";
// import { useAgentStatus } from "@/hooks/router/useRouterQueries";

// interface GroupStatsProps {
//   groupId: bigint;
//   showTerminal?: boolean;
//   onToggleTerminal?: () => void;
// }

// export function GroupStats({ groupId, showTerminal, onToggleTerminal }: GroupStatsProps) {
//   const { contracts } = useContractClient();
//   const { data: group, isLoading: loadingGroup } = useGroupDetails(groupId);
//   const { data: totalPayroll, isLoading: loadingPayroll } = useTotalPayroll(groupId);
//   const { data: tokenBalance, isLoading: loadingBalance } = useTokenBalance(
//     contracts.USDC_ADDRESS as `0x${string}`,
//   );

//   const {data: isAgentRunning} = useAgentStatus();

//   // flowLog("isAgentRunning:", isAgentRunning);

//   if (loadingGroup || loadingPayroll || loadingBalance) {
//     return (
//       <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8 flex items-center justify-center h-[160px]">
//         <div className="flex items-center gap-3 text-slate-400 animate-pulse">
//           <Activity className="w-5 h-5" />
//           <span className="text-sm font-medium">Syncing on-chain data...</span>
//         </div>
//       </div>
//     );
//   }

//   const formatDuration = (totalSeconds: number) => {
//     if (!totalSeconds) return { value: "0", unit: "Days" };
//     if (totalSeconds >= 86400)
//       return {
//         value: +(totalSeconds / 86400).toFixed(1),
//         unit: totalSeconds >= 172800 ? "Days" : "Day",
//       };
//     if (totalSeconds >= 3600)
//       return {
//         value: +(totalSeconds / 3600).toFixed(1),
//         unit: totalSeconds >= 7200 ? "Hours" : "Hour",
//       };
//     if (totalSeconds >= 60)
//       return {
//         value: +(totalSeconds / 60).toFixed(1),
//         unit: totalSeconds >= 120 ? "Mins" : "Min",
//       };
//     return { value: totalSeconds.toString(), unit: "Secs" };
//   };

//   const duration = formatDuration(group ? Number(group.cycleDuration) : 0);

//   const formatMoney = (amount: bigint | undefined) => {
//     const rawValue = amount ? Number(formatUnits(amount, 6)) : 0;
//     const exact = rawValue.toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });
//     const compact = new Intl.NumberFormat("en-US", {
//       notation: "compact",
//       maximumFractionDigits: 2,
//     }).format(rawValue);

//     return { exact, compact };
//   };

//   const payroll = formatMoney(totalPayroll);
//   const balance = formatMoney(tokenBalance);

//   const hasActiveCycle = group?.activeCycleId !== 0n;
//   const isEngineActive = hasActiveCycle && isAgentRunning;
//   const isEngineOffline = hasActiveCycle && !isAgentRunning; 

//   const isInsufficient = Boolean(
//     tokenBalance && totalPayroll && tokenBalance < totalPayroll,
//   );

//   return (
//     <div className="w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-8 overflow-hidden">
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 lg:divide-x divide-slate-100 h-full">
        
//         {/* Wallet Balance */}
//         <div className="p-8 transition-colors hover:bg-slate-50/50 relative">
//           <div className="flex items-center gap-2.5 text-slate-500 mb-4">
//             <Wallet className={`w-4 h-4 ${isInsufficient ? "text-amber-500" : "text-teal-500"}`} />
//             <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Wallet Balance</span>
//           </div>

//           <div className="group/num relative inline-flex items-baseline cursor-help">
//             <span className={`text-4xl font-montserrat font-bold tracking-tight border-b-2 border-dashed ${isInsufficient ? "text-amber-600 border-amber-200" : "text-slate-900 border-slate-200 group-hover/num:border-slate-400 transition-colors"}`}>
//               {balance.compact}
//             </span>
//             <span className={`${isInsufficient ? "text-amber-400" : "text-slate-600"} text-sm font-medium ml-1`}>USDC</span>
//             <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
//               <div className="bg-slate-900 text-white text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
//                 {balance.exact} USDC
//               </div>
//             </div>
//           </div>
//           {isInsufficient && (
//             <div className="absolute top-8 right-8 group/alert cursor-help">
//               <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
//               <div className="absolute top-full right-0 mt-2 hidden group-hover/alert:block z-50 w-48">
//                 <div className="bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-xl">
//                   Insufficient funds for next cycle
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Total Payroll */}
//         <div className="p-8 transition-colors hover:bg-slate-50/50">
//           <div className="flex items-center gap-2.5 text-slate-500 mb-4">
//             <DollarSign className="w-4 h-4 text-violet-500" />
//             <span className="text-xs font-bold uppercase tracking-widest">Total Payroll</span>
//           </div>
//           <div className="group/num relative inline-flex items-baseline cursor-help">
//             <span className="text-4xl font-montserrat font-bold text-slate-900 tracking-tight border-b-2 border-dashed border-slate-200 group-hover/num:border-slate-400 transition-colors">
//               {payroll.compact}
//             </span>
//             <span className="text-slate-600 text-sm font-medium ml-1">USDC</span>
//             <div className="absolute top-full left-0 mt-2 hidden group-hover/num:block z-50">
//               <div className="bg-slate-900 text-white text-xs font-mono font-medium py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
//                 {payroll.exact} USDC
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Payment Cycle */}
//         <div className="p-8 transition-colors hover:bg-slate-50/50">
//           <div className="flex items-center gap-2.5 text-slate-500 mb-4">
//             <Clock className="w-4 h-4 text-blue-500" />
//             <span className="text-xs font-bold uppercase tracking-widest">Payment Cycle</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-4xl font-montserrat font-bold text-slate-900 tracking-tight">{duration.value}</span>
//             <span className="text-sm font-medium text-slate-600">{duration.unit}</span>
//           </div>
//         </div>

//         {/* Active Epoch */}
//         <div className="p-8 transition-colors hover:bg-slate-50/50">
//           <div className="flex items-center gap-2.5 text-slate-500 mb-4">
//             <Layers className="w-4 h-4 text-indigo-500" />
//             <span className="text-xs font-bold uppercase tracking-widest">Active Epoch</span>
//           </div>
//           <div className="flex items-baseline gap-1.5">
//             <span className="text-slate-600 text-xl font-medium">#</span>
//             <span className="text-4xl font-montserrat font-bold text-slate-900 tracking-tight">
//               {group?.activeCycleId?.toString() || "0"}
//             </span>
//           </div>
//         </div>

//         {/* Yield Engine */}
//         <div className={`p-8 transition-colors flex flex-col justify-between relative overflow-hidden ${
//             isEngineActive 
//               ? "bg-emerald-50/30" 
//               : isEngineOffline 
//                 ? "bg-rose-50/30" 
//                 : "bg-slate-50/30"
//           }`}
//         >
//           <div>
//             <div className="flex items-center gap-2.5 text-slate-500 mb-4 relative z-10">
//               {isEngineActive ? (
//                 <Sparkles className="w-4 h-4 text-emerald-500" />
//               ) : isEngineOffline ? (
//                 <ServerOff className="w-4 h-4 text-rose-500" />
//               ) : (
//                 <Activity className="w-4 h-4 text-slate-400" />
//               )}
//               <span className="text-xs font-bold uppercase tracking-widest">Yield Engine</span>
//             </div>

//             <div className="relative z-10 flex items-center gap-3 mt-1">
//               {isEngineActive ? (
//                 <>
//                   <div className="relative flex h-3 w-3">
//                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
//                   </div>
//                   <span className="text-emerald-700 font-semibold tracking-wide text-sm">Active</span>
//                 </>
//               ) : isEngineOffline ? (
//                 <>
//                   <div className="relative flex h-3 w-3">
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
//                   </div>
//                   <span className="text-rose-700 font-semibold tracking-wide text-sm">Agent Offline</span>
//                 </>
//               ) : (
//                 <>
//                   <div className="relative flex h-3 w-3">
//                     <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
//                   </div>
//                   <span className="text-slate-600 tracking-wide text-lg">Idle</span>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* New Toggle Button */}
//           {onToggleTerminal && (
//             <Button
//               onClick={onToggleTerminal}
//               className={`relative z-10 mt-6 flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all border ${
//                 isEngineActive
//                   ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"
//                   : isEngineOffline
//                   ? "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/20"
//                   : "bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20"
//               }`}
//             >
//               <span className="flex items-center gap-2">
//                 <Terminal className="w-4 h-4" />
//                 {showTerminal ? "Hide Logs" : "View Terminal"}
//               </span>
//               <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showTerminal ? "rotate-180" : ""}`} />
//             </Button>
//           )}

//           {isEngineActive && <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />}
//           {isEngineOffline && <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />}
//         </div>
//       </div>
//     </div>
//   );
// }