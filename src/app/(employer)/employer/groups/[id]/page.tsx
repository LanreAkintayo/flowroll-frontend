"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useGroupDetails,
  useGroupEmployees,
  useGroupEmployeesWithSalaries,
} from "@/hooks/payroll/usePayrollQueries";
import { EmployeeRoster } from "@/components/employer/EmployeeRoster";
// Let's assume we will build this component next:
// import { ActiveEmployeeRoster } from "@/components/employer/ActiveEmployeeRoster";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/shared/PageShell";
import { GroupStats } from "@/components/employer/GroupStats";
import { ChevronLeft, Hash, Loader2, Zap } from "lucide-react";
import { flowLog } from "@/lib/utils";
import { ActiveEmployeeRoster } from "@/components/employer/ActiveEmployeeRoster";
import { AgentCommandCenter } from "@/components/employer/AgentCommandCenter";
import { useState } from "react";
import { useAgentStatus, useAgentSync, usePayrollCycle } from "@/hooks/router/useRouterQueries";
import { useContractClient } from "@/hooks/useContractClient";

export default function GroupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const groupId = BigInt(id as string);
  const { address } = useContractClient();

  const { data: isAgentRunning } = useAgentStatus();
  const {data: payrollCycle} = usePayrollCycle(address, groupId);

  useAgentSync(groupId);


  flowLog("Payroll cycle: ", payrollCycle); 

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const { data: group, isLoading: loadingGroup } = useGroupDetails(address, groupId);
  // We use this to check if they have real employees on chain
  const { data: employeesWithSalary, isLoading: loadingEmployees } =
    useGroupEmployeesWithSalaries(groupId);

  // The ultimate loading state
  const isPageLoading = loadingGroup || loadingEmployees;

  // The logic gate
  const hasActiveEmployees =
    employeesWithSalary && employeesWithSalary.length > 0;

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
    <>
      <PageShell>
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Groups
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold tracking-wider uppercase">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                ID: {id}
              </span>
            </div>

            <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {group?.name || "Unnamed Group"}
            </h1>
          </div>
        </div>

        {/* Stats Cards */}
        <GroupStats
          groupId={groupId}
          showTerminal={isTerminalOpen}
          onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
        />

        {/* --- THE CONDITIONAL RENDERING MAGIC --- */}
        {hasActiveEmployees ? (
          // STATE B: They have active employees. Show the real roster.
          <div className="mt-12 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="font-montserrat text-xl font-bold text-slate-900">
                Active Team
              </h2>
              {isAgentRunning && (
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {employeesWithSalary.length} Yielding
                </span>
              )}
            </div>

            {/* We will build this next to map over employeesWithSalary */}
            <ActiveEmployeeRoster employees={employeesWithSalary} />
          </div>
        ) : (
          // STATE A: No employees yet. Show the Staging/Setup phase.
          <div className="mt-12 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-slate-900">
                  Setup Roster
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Stage employees to kickstart this payroll cycle.
                </p>
              </div>
            </div>

            <EmployeeRoster groupId={groupId} />
          </div>
        )}
      </PageShell>
      {/* --- THE DOCKED CONSOLE --- */}
      {/* Placed at the very end of the component return */}
      {isTerminalOpen && (
        <AgentCommandCenter groupId = {groupId} onClose={() => setIsTerminalOpen(false)} />
      )}

      {/* Padding to ensure the user can scroll past the terminal height */}
      {isTerminalOpen && <div className="h-[40vh] w-full" />}
    </>
  );
}
