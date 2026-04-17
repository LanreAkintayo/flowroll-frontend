"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
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
} from "lucide-react";
import { formatUnits } from "viem";

import { useAgentStatus } from "@/hooks/router/useRouterQueries";
import { useAddressResolver } from "@/hooks/identity/useAddressResolver";
import type { DisbursementRecord } from "@/types";
import { ActiveEmployee } from "../employer/ActiveEmployeeRoster";




interface ActiveEmployeeRowProps {
  emp: ActiveEmployee;
  disbursementRecord: DisbursementRecord;
}

export function ActiveEmployeeRow({ emp, disbursementRecord }: ActiveEmployeeRowProps) {
  const [copied, setCopied] = useState(false);

  // Protocol and identity synchronization
  const { data: isAgentRunning } = useAgentStatus();
  const { resolvedName } = useAddressResolver(emp.address);

  const handleCopy = () => {
    navigator.clipboard.writeText(emp.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Address formatting utilities
  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Derived UI state
  const displayName = resolvedName || (emp.username?.toLowerCase().endsWith(".init") ? emp.username : truncateAddress(emp.address));
  const formattedSalary = emp.salary ? formatUnits(BigInt(emp.salary), 6) : "0";

  return (
    <TableRow className="border-slate-100 bg-white hover:bg-slate-50/50 transition-colors group">
      <TableCell className="py-5 pl-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                {displayName}
              </span>

              {isAgentRunning && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-[2px] rounded-md flex items-center gap-1.5 shadow-xs">
                  {disbursementRecord.executed ? "Paid" : "Yielding"}
                </span>
              )}
            </div>

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