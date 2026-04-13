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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Copy,
  Check,
  MoreHorizontal,
  UserMinus,
  PencilLine,
  Activity,
} from "lucide-react";
import { formatUnits } from "viem";
import { useAgentStatus } from "@/hooks/router/useRouterQueries";
import { flowLog } from "@/lib/utils";
import { useGroupDetails } from "@/hooks/payroll/usePayrollQueries";
import { DisbursementRecord } from "@/types";

// --- TYPES ---
export type ActiveEmployee = {
  address: string;
  username?: string | null;
  salary: bigint;
};

// --- SINGLE ROW COMPONENT ---
function ActiveEmployeeRow({ emp, disbursementRecord }: { emp: ActiveEmployee, disbursementRecord: DisbursementRecord }) {
  const [copied, setCopied] = useState(false);
  const { data: isAgentRunning } = useAgentStatus();
  // const { data: group, isLoading: loadingGroup } = useGroupDetails(address, groupId);

  // const { data: disbursementRecord } = useDisbursementRecord(address, group?.activeCycleId);


  //   flowLog("Rendering ActiveEmployeeRow for:", isAgentRunning);

  const handleCopy = () => {
    navigator.clipboard.writeText(emp.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInitName =
    emp.username && emp.username.toLowerCase().endsWith(".init");
  const formattedSalary = emp.salary && formatUnits(BigInt(emp.salary), 6);

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <TableRow className="border-slate-100 bg-white hover:bg-slate-50/50 transition-colors group">
      <TableCell className="py-5 pl-8">
        <div className="flex items-center gap-4">
          {/* Trustworthy Blue Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                {isInitName ? emp.username : truncateAddress(emp.address)}
              </span>

              {/* The "Live" Pulse Badge */}
              {isAgentRunning && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-[2px] rounded-md flex items-center gap-1.5 shadow-xs">

                  {disbursementRecord.executed ? "Paid" : "Yielding"}
                </span>
              )}
            </div>

            {/* Address Pill & Copy */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="group/tooltip relative flex items-center">
                <span className="font-mono text-slate-500 text-xs bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md cursor-default">
                  {truncateAddress(emp.address)}
                </span>

                <div className="absolute bottom-full left-0 mb-1 hidden group-hover/tooltip:block z-50">
                  <div className="bg-slate-900 text-white text-[10px] font-mono py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                    {emp.address}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-slate-200/50"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right py-5">
        <div className="flex flex-col items-end">
          <span className="font-montserrat font-medium text-slate-900 text-sm">
            {Number(formattedSalary)?.toLocaleString()}
            <span className="text-xs font-medium text-slate-600 ml-1">
              USDC
            </span>
          </span>
          {/* <span className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500" /> Active Cycle
          </span> */}
        </div>
      </TableCell>

      <TableCell className="text-right py-5 pr-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 rounded-lg"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl shadow-xl border-slate-100"
          >
            <DropdownMenuItem className="gap-2 text-slate-700 font-medium cursor-pointer py-2.5">
              <PencilLine className="w-4 h-4 text-blue-500" />
              Modify Salary
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem className="gap-2 text-rose-600 font-medium cursor-pointer py-2.5 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700">
              <UserMinus className="w-4 h-4" />
              Remove Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// --- MAIN ROSTER COMPONENT ---
export function ActiveEmployeeRoster({
  employees,
  disbursementRecord
}: {
  employees: ActiveEmployee[];
  disbursementRecord: DisbursementRecord;
}) {
  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 backdrop-blur-sm">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 pl-8">
                Employee
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 text-right">
                Base Salary
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500 py-5 text-right pr-8">
                Manage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp, idx) => (
              <ActiveEmployeeRow key={`active-${idx}`} emp={emp} disbursementRecord={disbursementRecord} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
