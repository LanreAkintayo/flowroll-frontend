"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Hash, Zap, CheckCircle2 } from "lucide-react";

import { useContractClient } from "@/hooks/useContractClient";
import { 
    useGroupDetails, 
    useGroupEmployeesWithSalaries 
} from "@/hooks/payroll/usePayrollQueries";
import { 
    useAgentStatus, 
    useAgentSync, 
    usePayrollCycle 
} from "@/hooks/router/useRouterQueries";
import { useDisbursementRecord } from "@/hooks/dispatcher/useDispatcherQueries";

import PageShell from "@/components/shared/PageShell";
import { GroupStats } from "@/components/employer/GroupStats";
import { EmployeeRoster } from "@/components/employer/EmployeeRoster";
import { ActiveEmployeeRoster } from "@/components/employer/ActiveEmployeeRoster";
import { AgentCommandCenter } from "@/components/employer/AgentCommandCenter";
import { flowLog } from "@/lib/utils";

export default function GroupDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const groupId = BigInt(id as string);
    const { address } = useContractClient();

    // System state and agent synchronization
    const { data: isAgentRunning } = useAgentStatus();
    const { data: payrollCycle } = usePayrollCycle(address, groupId);
    useAgentSync(groupId);

    // Local UI state
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    // Data fetching: Group registry and on-chain records
    const { data: group, isLoading: loadingGroup } = useGroupDetails(address, groupId);
    const { data: employeesWithSalary, isLoading: loadingEmployees } = useGroupEmployeesWithSalaries(groupId);
    const { data: disbursementRecord } = useDisbursementRecord(address, group?.activeCycleId);

    // Derived logic for conditional rendering
    const isPageLoading = loadingGroup || loadingEmployees;
    const hasActiveEmployees = employeesWithSalary && employeesWithSalary.length > 0;

    flowLog("Payroll cycle record:", payrollCycle);

    if (isPageLoading) {
        return (
            <PageShell>
                <div className="animate-pulse space-y-8">
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-slate-200 rounded-md" />
                        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="h-[120px] bg-slate-100 rounded-2xl" />
                </div>
            </PageShell>
        );
    }

    return (
        <div className="min-h-screen">
            <PageShell>
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Groups
                </button>

                {/* Identity and Status Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold tracking-wider uppercase">
                                <Hash className="w-3.5 h-3.5 text-slate-400" />
                                ID: {id}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight font-montserrat">
                            {group?.name || "Unnamed Group"}
                        </h1>
                    </div>

                    {disbursementRecord?.executed ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Disbursed
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Active
                        </div>
                    )}
                </div>

                {/* Protocol Metrics */}
                <GroupStats
                    groupId={groupId}
                    showTerminal={isTerminalOpen}
                    onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
                />

                {/* Conditional Roster Management */}
                {hasActiveEmployees ? (
                    <div className="mt-12 space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 font-montserrat">
                                Active Team
                            </h2>
                            {isAgentRunning && !disbursementRecord?.executed && (
                                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {employeesWithSalary.length} Yielding
                                </span>
                            )}
                        </div>
                        {disbursementRecord && (
                            <ActiveEmployeeRoster 
                                employees={employeesWithSalary} 
                                disbursementRecord={disbursementRecord} 
                            />
                        )}
                    </div>
                ) : (
                    <div className="mt-12 space-y-6 animate-in fade-in duration-500">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 font-montserrat">
                                Setup Roster
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Stage employees to initialize the next payroll cycle.
                            </p>
                        </div>
                        <EmployeeRoster groupId={groupId} />
                    </div>
                )}
            </PageShell>

            {/* Global Command Center */}
            {isTerminalOpen && (
                <AgentCommandCenter 
                    groupId={groupId} 
                    onClose={() => setIsTerminalOpen(false)} 
                />
            )}

            {/* Layout spacer for docked terminal */}
            {isTerminalOpen && <div className="h-[40vh] w-full" />}
        </div>
    );
}