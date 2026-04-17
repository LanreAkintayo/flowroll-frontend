"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Activity, CheckCircle2, CalendarDays } from "lucide-react";

import type { PayrollGroup } from "@/types"; 
import { formatDuration, formatMoney, formatTimestamp } from "@/lib/utils";
import { useContractClient } from "@/hooks/useContractClient";
import { useDisbursementRecord } from "@/hooks/dispatcher/useDispatcherQueries";
import { usePayrollCycle } from "@/hooks/router/useRouterQueries";

interface GroupCardProps {
  group: PayrollGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const { address } = useContractClient();
  const { data: disbursementRecord } = useDisbursementRecord(address, group.activeCycleId);
  const { data: cycleData } = usePayrollCycle(address, group.activeCycleId);
  
  const [isHovered, setIsHovered] = useState(false);
  const groupIdStr = group.groupId.toString();
  
  const isEngineActive = group.activeCycleId !== 0n;
  const isExecuted = disbursementRecord?.executed ?? false;
  const formattedTotal = formatMoney(group.totalPayroll, 6);

  // Dynamic Badge Configuration
  let badgeColor = "bg-amber-100/80 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30";
  let badgeContent = "Setup Required";

  if (isEngineActive) {
    if (isExecuted) {
      badgeColor = "bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30";
      badgeContent = "Disbursed";
    } else {
      badgeColor = "bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30";
      badgeContent = "Active";
    }
  }

  return (
    <Link
      href={`/employer/groups/${groupIdStr}`}
      className="block outline-none"
    >
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-white dark:bg-[#0a0c10] border border-slate-200/80 dark:border-slate-800 rounded-[2rem] p-1 transition-all duration-300 hover:border-violet-200 dark:hover:border-violet-500/30 hover:shadow-sm hover:shadow-violet-900/5 dark:hover:shadow-violet-500/5"
      >
        <div className="rounded-[1.75rem] p-6 h-full border border-transparent group-hover:bg-white dark:group-hover:bg-[#0d1117] transition-colors flex flex-col justify-between">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-2xl font-medium text-slate-900 dark:text-white mb-3 tracking-tight capitalize">
                {group.name}
              </h4>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${badgeColor}`}>
                  {isEngineActive && !isExecuted && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-blue-400" />
                    </span>
                  )}
                  {isEngineActive && isExecuted && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {badgeContent}
                </span>

                {isEngineActive && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-3 py-1.5 rounded-lg shadow-sm">
                    <Activity className="w-3.5 h-3.5" /> Epoch #
                    {group.activeCycleId.toString()}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isHovered
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm shadow-slate-900/20 translate-x-1"
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 shadow-sm"
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-1">
                {isEngineActive ? "Payday" : "Cycle Duration"}
              </p>
              <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2 text-sm sm:text-base">
                {isEngineActive ? (
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Clock className="w-4 h-4 text-violet-500" />
                )}
                {isEngineActive 
                  ? cycleData?.payDay ? formatTimestamp(cycleData.payDay) : "Loading..."
                  : formatDuration(Number(group.cycleDuration))
                }
              </p>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-1">
                Total Payroll
              </p>
              <p className="text-slate-900 dark:text-white font-medium tracking-tight text-sm sm:text-base">
                {formattedTotal}{" "}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  USDC
                </span>
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </Link>
  );
}