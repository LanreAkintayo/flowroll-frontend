"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useGroupDetails,
  useGroupEmployees,
} from "@/hooks/payroll/usePayrollQueries";
import {
  UserPlus,
  Trash2,
  Edit2,
  Users,
  Wallet,
  ChevronRight,
  Save,
  AlertCircle,
  Zap,
  Loader2,
} from "lucide-react";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { Employee } from "@/types";
import { DraftEmployeeRow } from "./DraftEmployeeRow";
import { flowLog } from "@/lib/utils";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { useTokenActions } from "@/hooks/token/useTokenActions";
import { useContractClient } from "@/hooks/useContractClient";
import { usePayrollActions } from "@/hooks/payroll/usePayrollActions";
import { useAllowance } from "@/hooks/token/useTokenQueries";

export function EmployeeRoster({ groupId }: { groupId: bigint }) {
  const { address } = useContractClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stagedEmployees, setStagedEmployees] = useState<Employee[]>([]);
  const { data: group } = useGroupDetails(address, groupId);
  const { data: employees, isLoading: loadingEmployees } =
    useGroupEmployees(groupId);

    // flowLog("Group employees:", employees);

  const { contracts } = useContractClient();

  const { approveToken } = useTokenActions(
    contracts.USDC_ADDRESS as `0x${string}`,
  );
  const { setupPayroll } = usePayrollActions();
  const { data: allowance } = useAllowance(
    contracts.USDC_ADDRESS as `0x${string}`,
    contracts.PAYROLL_MANAGER_ADDRESS as `0x${string}`,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // flowLog("Staged Employees:", stagedEmployees);
  // flowLog("Group details: ", group);

  const handleConfirmAdd = (newEmployees: Employee[]) => {
    setStagedEmployees([...newEmployees]);
    setIsAddModalOpen(false);
  };

  const removeStagedEmployee = (indexToRemove: number) => {
    setStagedEmployees(
      stagedEmployees.filter((_, idx) => idx !== indexToRemove),
    );
  };

  const handleKickstartPayroll = async () => {
    if (!group || stagedEmployees.length === 0) return;

    setIsSubmitting(true);

    try {
      const totalRaw = stagedEmployees.reduce(
        (sum, emp) => sum + Number(emp.salary),
        0,
      );
      const totalUSDC = parseUnits(totalRaw.toString(), 6);

      const employeeAddresses = stagedEmployees.map(
        (emp) => emp.address as `0x${string}`,
      );
      const employeeSalaries = stagedEmployees.map((emp) =>
        parseUnits(emp.salary.toString(), 6),
      );

      flowLog("Allowance: ", allowance);
      flowLog("Total USDC needed:", totalUSDC.toString());

      if (allowance! == 0n || allowance! < totalUSDC) {
        toast.loading("Approving USDC spend...", { id: "payroll-tx" });

        await approveToken.mutateAsync({
          spender: contracts.PAYROLL_MANAGER_ADDRESS as `0x${string}`,
          amount: totalUSDC,
        });
      }

      toast.loading("Setting up the payroll engine...", { id: "payroll-tx" });

      const hash = await setupPayroll.mutateAsync({
        groupId,
        employees: employeeAddresses,
        salaries: employeeSalaries,
      });

      flowLog("Payroll setup successfully. Hash:", hash);
      toast.success("Payroll engine kickstarted!", { id: "payroll-tx" });

      setStagedEmployees([]);
    } catch (err: any) {
      flowLog("Caught error in kickstart payroll:", err);

      if (err.message?.includes("User rejected") || err.code === 4001) {
        toast.error("Transaction cancelled by user", { id: "payroll-tx" });
      } else {
        toast.error(
          err.shortMessage || err.message || "An unexpected error occurred",
          { id: "payroll-tx" },
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEmployees) {
    return (
      <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-48 bg-slate-100 rounded-lg mb-8" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-4 border-b border-slate-50"
            >
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-full" />
                <div className="h-10 w-32 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-10 w-24 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasStaged = stagedEmployees.length > 0;
  const isEmpty = (!employees || employees.length === 0) && !hasStaged;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm border border-blue-100/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-montserrat text-xl font-bold text-slate-900 tracking-tight">
              Team Roster
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Manage employees and compensation
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all rounded-xl h-11 px-5 flex items-center gap-2 font-medium cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {isEmpty ? (
        /* --- PREMIUM EMPTY STATE --- */
        <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-12 md:p-20 flex flex-col items-center justify-center text-center transition-all">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full scale-150 opacity-50" />
            <div className="relative w-20 h-20 bg-white border border-slate-100 shadow-sm rounded-3xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform duration-500">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h3 className="font-montserrat text-2xl font-bold text-slate-900 tracking-tight">
            No team members yet
          </h3>
          <p className="text-slate-500 text-base mt-2 mb-8 max-w-[400px] leading-relaxed">
            Your payroll engine is ready. Add your first employee to start
            automating their yield and salary streams.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold group"
          >
            Add First Employee
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      ) : (
        /* --- HIGH-END TABLE STATE --- */
        <div className="w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden transition-all">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 pl-8">
                  Employee
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 text-right">
                  Base Salary
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 text-right pr-8">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stagedEmployees.map((emp, idx) => (
                <DraftEmployeeRow
                  key={`staged-${idx}`}
                  emp={emp}
                  onRemove={() => removeStagedEmployee(idx)}
                />
              ))}

              {/* Map your actual 'employees' array here... */}
            </TableBody>
          </Table>
        </div>
      )}
      {hasStaged && (
        <div className="border-t border-slate-200 bg-white backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden rounded-b-[2rem]">
          <div className="flex items-start gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-6 h-6 text-emerald-600 fill-emerald-600/20" />
            </div>

            <div>
              <h3 className="font-montserrat font-medium text-slate-900 text-lg tracking-tight">
                Ready to Kickstart Payroll
              </h3>
              <p className="text-sm text-slate-700 mt-2 max-w-lg leading-relaxed">
                Staging{" "}
                <span className="font-medium text-slate-700">
                  {stagedEmployees.length} new employee(s)
                </span>
                . This requires a smart contract signature and will allocate
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mx-1.5 shadow-sm">
                  {stagedEmployees
                    .reduce((sum, emp) => sum + Number(emp.salary), 0)
                    .toLocaleString()}{" "}
                  USDC
                </span>
                for the upcoming cycle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto z-10 pt-4 md:pt-0 border-t md:border-0 border-slate-200/60 mt-2 md:mt-0">
            <Button
              onClick={handleKickstartPayroll}
              disabled={isSubmitting}
              className="h-12 px-6 lg:px-8 border bg-white text-slate-900 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl font-semibold flex items-center justify-center gap-2 w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Kickstart Payroll
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groupId={groupId}
        onConfirm={handleConfirmAdd}
      />
    </div>
  );
}
