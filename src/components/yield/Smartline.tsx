"use client";

import {
    Zap,
    ArrowRightLeft,
    Droplets,
    CheckCircle2,
    Loader2,
    Lock,
    Activity
} from "lucide-react";

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
}

interface SmartTimelineProps {
    logs: LogEntry[];
}

export function SmartTimeline({ logs }: SmartTimelineProps) {
    const hasPayday = logs.some(log => log.message.includes("[PAYDAY]"));

    return (
        <div className="flex flex-col relative ml-4 lg:ml-8 border-l-2 border-slate-200 dark:border-slate-800/50 pb-8">
            {logs.map((log, index) => {
                const isInit = log.message.includes("[INIT]");
                const isRebalance = log.message.includes("[REBALANCE]");
                const isLiquidity = log.message.includes("[LIQUIDITY]");
                const isPayday = log.message.includes("[PAYDAY]");

                // Configuration based on log signature
                let Icon = Zap;
                let iconColor = "text-slate-500 dark:text-slate-400";
                let bg = "bg-white dark:bg-slate-900";
                let border = "border-slate-300 dark:border-slate-700";

                if (isInit) {
                    Icon = Activity;
                    iconColor = "text-blue-500 dark:text-blue-400";
                    bg = "bg-blue-50 dark:bg-blue-500/10";
                    border = "border-blue-200 dark:border-blue-500/30";
                } else if (isRebalance) {
                    Icon = ArrowRightLeft;
                    iconColor = "text-emerald-500 dark:text-emerald-400";
                    bg = "bg-emerald-50 dark:bg-emerald-500/10";
                    border = "border-emerald-200 dark:border-emerald-500/30";
                } else if (isLiquidity) {
                    Icon = Droplets;
                    iconColor = "text-amber-500 dark:text-amber-400";
                    bg = "bg-amber-50 dark:bg-amber-500/10";
                    border = "border-amber-200 dark:border-amber-500/30";
                } else if (isPayday) {
                    Icon = CheckCircle2;
                    iconColor = "text-yellow-600 dark:text-yellow-400";
                    bg = "bg-yellow-50 dark:bg-yellow-500/10";
                    border = "border-yellow-300 dark:border-yellow-500/50";
                }

                const isLatest = index === logs.length - 1;

                return (
                    <div
                        key={log.id}
                        className={`relative pl-8 pb-8 lg:pb-10 transition-opacity duration-300 ${!isLatest ? "opacity-70" : "opacity-100"}`}
                    >
                        {/* Timeline node */}
                        <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${bg} ${border} shadow-sm dark:shadow-none`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>

                        {/* Log content card */}
                        <div className="flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm dark:shadow-none">
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-tight">
                                {log.timestamp}
                            </span>
                            <p className={`text-[15px] leading-relaxed ${isLatest ? "text-slate-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"}`}>
                                {log.message.replace(/\[.*?\]\s*/, "")}
                            </p>
                        </div>
                    </div>
                );
            })}

            {/* Terminal status indicators */}
            <div className="relative pl-8 pt-2">
                {hasPayday ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="absolute -left-[13px] top-3 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-500/20 border-2 border-yellow-400 dark:border-yellow-500 flex items-center justify-center shadow-sm">
                            <Lock className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <p className="text-yellow-600 dark:text-yellow-500 font-medium text-sm mt-3">
                            Cycle Complete. Waiting for next funding round.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="absolute -left-1 top-4 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <div className="absolute -left-[3px] top-[14px] w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2 mt-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Agent continuously monitoring yields...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}