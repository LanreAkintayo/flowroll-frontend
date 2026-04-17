"use client";

import { useEffect } from "react";
import { Wallet, Loader2, CheckCircle2, XCircle, DollarSign, Trash2 } from "lucide-react";
import { useInitResolver } from "@/hooks/identity/useInitResolver";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { StagingRow } from "@/types";

interface StagingRowItemProps {
  row: StagingRow;
  updateInput: (id: string, value: string) => void;
  updateSalary: (id: string, value: string) => void;
  removeRow: (id: string) => void;
  onResolveAddress: (id: string, address: string) => void;
  isDuplicate: boolean;
}

export default function StagingRowItem({
  row,
  updateInput,
  updateSalary,
  removeRow,
  onResolveAddress,
  isDuplicate
}: StagingRowItemProps) {
  const identifier = row.identifier.trim();
  const salaryNum = Number(row.salary);

  // Identity Resolution
  const { resolvedAddress, isResolving, isError } = useInitResolver(identifier);

  const finalResolvedAddress = typeof resolvedAddress === "string"
    ? resolvedAddress
    : Array.isArray(resolvedAddress)
      ? resolvedAddress[0]
      : null;

  useEffect(() => {
    if (finalResolvedAddress && row.username && row.address !== finalResolvedAddress) {
      onResolveAddress(row.id, finalResolvedAddress);
    }
  }, [finalResolvedAddress, row.username, row.address, row.id, onResolveAddress]);

  // Validation State
  const isMalformedEthAddress = identifier.startsWith("0x") && identifier.length > 2 && identifier.length !== 42;
  const isInvalidAddress = isError || isMalformedEthAddress || isDuplicate;
  const isInvalidSalary = row.salary !== "" && (isNaN(salaryNum) || salaryNum <= 0);

  return (
    <div className="grid grid-cols-[1fr_200px_40px] gap-4 items-start group">
      
      {/* Identity Input */}
      <div className="relative flex flex-col gap-1.5 min-w-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Wallet className={`h-4 w-4 ${isInvalidAddress ? "text-rose-400 dark:text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
          </div>

          <Input
            value={row.identifier}
            onChange={(e) => updateInput(row.id, e.target.value)}
            placeholder="0x... or name.init"
            className={`pl-9 pr-12 h-12 bg-slate-50 dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus-visible:ring-blue-500 transition-all font-mono text-sm ${
              isInvalidAddress
                ? "border-rose-300 dark:border-rose-500/50 focus-visible:ring-rose-200 dark:focus-visible:ring-rose-500/30 bg-rose-50/30 dark:bg-rose-500/5"
                : ""
            }`}
          />

          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {isResolving && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
            {row.address && !isResolving && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            {isInvalidAddress && <XCircle className="h-4 w-4 text-rose-500 dark:text-rose-400" />}
          </div>
        </div>

        {row.username && row.address && !isResolving && (
          <div className="flex items-center gap-1.5 px-2 animate-in fade-in slide-in-from-top-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved:</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">{row.address}</span>
          </div>
        )}

        {isInvalidAddress && (
          <span className="text-xs font-medium text-rose-500 dark:text-rose-400 px-2 animate-in fade-in">
            {isError ? "Name not registered" : isDuplicate ? "Duplicate employee" : "Invalid address format"}
          </span>
        )}
      </div>

      {/* Salary Input */}
      <div className="relative flex flex-col gap-1.5 min-w-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <DollarSign className={`h-4 w-4 ${isInvalidSalary ? "text-rose-400 dark:text-rose-500" : "text-slate-400 dark:text-slate-500"}`} />
          </div>
          
          <Input
            value={row.salary}
            onChange={(e) => updateSalary(row.id, e.target.value)}
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            className={`pl-10 h-12 bg-slate-50 dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus-visible:ring-blue-500 font-montserrat font-medium ${
              isInvalidSalary
                ? "border-rose-300 dark:border-rose-500/50 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-500/30 bg-rose-50/30 dark:bg-rose-500/5"
                : ""
            }`}
          />
        </div>
        
        {isInvalidSalary && (
          <span className="text-xs font-medium text-rose-500 dark:text-rose-400 px-2 animate-in fade-in">
            Must be greater than 0
          </span>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeRow(row.id)}
          className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
    </div>
  );
}