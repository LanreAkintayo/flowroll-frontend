"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Activity } from "lucide-react";
import { formatUnits } from "viem";
import { PayrollGroup } from "@/types"; // Update path if your types are elsewhere

export function GroupCard({ group }: { group: PayrollGroup }) {
  const [isHovered, setIsHovered] = useState(false);
  const groupIdStr = group.groupId.toString();
  const isEngineActive = group.activeCycleId !== 0n;

  // Format Total Payroll (USDC 6 decimals)
  const rawTotal = Number(formatUnits(group.totalPayroll, 6));
  const formattedTotal = rawTotal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Format cycle duration
  const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds) return "Not set";
    if (totalSeconds >= 86400)
      return `${+(totalSeconds / 86400).toFixed(1)} Days`;
    if (totalSeconds >= 3600)
      return `${+(totalSeconds / 3600).toFixed(1)} Hours`;
    if (totalSeconds >= 60) return `${+(totalSeconds / 60).toFixed(1)} Mins`;
    return `${totalSeconds} Secs`;
  };

  return (
    <Link
      href={`/employer/groups/${groupIdStr}`}
      className="block outline-none"
    >
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative bg-white border border-slate-200/80 rounded-[2rem] p-1 transition-all duration-300 hover:border-violet-200 hover:shadow-sm hover:shadow-violet-900/5"
      >
        <div className=" rounded-[1.75rem] p-6 h-full border border-transparent group-hover:bg-white transition-colors flex flex-col justify-between">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-2xl font-medium text-slate-900 mb-3 tracking-tight capitalize">
                {group.name}
              </h4>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest flex items-center gap-1.5 ${
                    isEngineActive
                      ? "bg-emerald-100/80 text-emerald-700"
                      : "bg-amber-100/80 text-amber-700"
                  }`}
                >
                  {isEngineActive ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Active
                    </>
                  ) : (
                    "Setup Required"
                  )}
                </span>

                {group.activeCycleId !== 0n && (
                  <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Activity className="w-4 h-4" /> Epoch #
                    {group.activeCycleId.toString()}
                  </span>
                )}
              </div>
            </div>

            {/* Hover Arrow Toggle */}
            <div
              className={`p-3 rounded-2xl transition-all duration-300 ${
                isHovered
                  ? "bg-slate-900 text-white shadow-sm shadow-slate-900/20 translate-x-1"
                  : "bg-white text-slate-400 border border-slate-200 shadow-sm"
              }`}
            >
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <p className="text-xs font-medium tracking-wider text-slate-600 uppercase mb-1">
                Cycle Duration
              </p>
              <p className="text-slate-900  flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500" />
                {formatDuration(Number(group.cycleDuration))}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <p className="text-xs font-medium tracking-wider text-slate-600 uppercase mb-1">
                Total Payroll
              </p>
              <p className="text-slate-900 tracking-tight">
                {formattedTotal}{" "}
                <span className="text-sm text-slate-600">
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
