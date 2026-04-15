"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, Plus, AlertTriangle, Download } from "lucide-react";
import { flowLog } from "@/lib/utils";
import { StagingRow } from "@/types";
import StagingRowItem from "./StagingRowItem";
import { toast } from "sonner"; // Using Sonner for sleek notifications

export function AddEmployeeModal({
  isOpen,
  onClose,
  groupId,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  groupId: bigint;
  onConfirm: (employees: any[]) => void;
}) {
  const [rows, setRows] = useState<StagingRow[]>([
    { id: crypto.randomUUID(), identifier: "", username: null, address: null, salary: "" },
  ]);

  // --- CSV UPLOAD LOGIC ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    // const csvContent = "Wallet Address or .init Name,Salary (USDC)\n0x71C7656EC7ab88b098defB751B7401B5f6d8976F,1500\nlarrymosh.init,2500.50";
    const csvContent = "Wallet Address or .init Name,Salary (USDC)\n0xc3235B99Bdf0F12e793BcA9B83A8BAD88E06C8B3,500\nlanre.init,400.50\n0x1d011983F10E491662dd1eA8Af0D6d6213B76A85,100\n0x8EA11de1130aA63aD0CD553B580fe0ca16C6fE06,350\nstonydriller.init,550";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "flowroll_team_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template downloaded!");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid .csv file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);

      const parsedRows: StagingRow[] = [];
      let skippedCount = 0;

      lines.forEach((line) => {
        // Skip completely empty lines or the header row
        if (!line.trim() || line.toLowerCase().includes("address") || line.toLowerCase().includes("salary")) return;

        // Split by comma
        const [identifier, salary] = line.split(',');

        if (identifier && salary) {
          const cleanId = identifier.trim();
          const cleanSalary = salary.trim();

          const isInit = cleanId.toLowerCase().endsWith(".init");
          const isEth = cleanId.startsWith("0x") && cleanId.length === 42;

          parsedRows.push({
            id: crypto.randomUUID(), // Safe React Key
            identifier: cleanId,
            username: isInit ? cleanId : null,
            address: isEth ? cleanId : null,
            salary: cleanSalary,
          });
        } else {
          skippedCount++;
        }
      });

      if (parsedRows.length > 0) {
        setRows((prev) => {
          // If the modal only has the default empty row, replace it. Otherwise, append.
          const isFirstRowEmpty = prev.length === 1 && prev[0].identifier === "" && prev[0].salary === "";
          return isFirstRowEmpty ? parsedRows : [...prev, ...parsedRows];
        });
        toast.success(`Extracted ${parsedRows.length} employees from CSV`);
      } else {
        toast.error("No valid data found in CSV");
      }

      if (skippedCount > 0) {
        toast.warning(`Skipped ${skippedCount} malformed rows`);
      }

      // Reset the input so they can upload the exact same file again if they make a mistake
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  // --- ROW MANAGEMENT LOGIC ---
  const addRow = () =>
    setRows([
      ...rows,
      {
        id: crypto.randomUUID(), // Changed from Math.random()
        identifier: "",
        username: null,
        address: null,
        salary: "",
      },
    ]);

  const removeRow = (id: string) => {
    if (rows.length > 1) setRows(rows.filter((row) => row.id !== id));
  };

  const updateInput = (id: string, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row;

        const cleanValue = value.trim();
        const isInit = cleanValue.toLowerCase().endsWith(".init");
        const isEth = cleanValue.startsWith("0x") && cleanValue.length === 42;

        return {
          ...row,
          identifier: value,
          username: isInit ? cleanValue : null,
          address: isEth ? cleanValue : null,
        };
      }),
    );
  };

  const updateSalary = (id: string, value: string) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, salary: value } : row)),
    );
  };

  const handleResolveAddress = useCallback((id: string, address: string) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, address } : row)),
    );
  }, []);

  const validationState = useMemo(() => {
    const addressCounts: Record<string, number> = {};

    rows.forEach((row) => {
      if (row.address && row.address.length === 42) {
        const addr = row.address.toLowerCase();
        addressCounts[addr] = (addressCounts[addr] || 0) + 1;
      }
    });

    const emptyRowsCount = rows.filter(
      (r) => r.identifier.trim() === "" && r.salary.trim() === "",
    ).length;

    const hasIncompleteRows = rows.some(
      (r) =>
        (r.identifier !== "" && !r.address) ||
        (r.address && r.salary === "") ||
        (r.identifier === "" && r.salary !== ""),
    );

    const hasInvalidSalaries = rows.some(
      (r) =>
        r.salary !== "" && (isNaN(Number(r.salary)) || Number(r.salary) <= 0),
    );

    const hasDuplicates = Object.values(addressCounts).some((count) => count > 1);
    const isCompletelyEmpty = emptyRowsCount === rows.length;

    const isValid = !isCompletelyEmpty && !hasIncompleteRows && !hasInvalidSalaries && !hasDuplicates;

    let errorMessage = null;
    if (hasIncompleteRows) errorMessage = "Please ensure all employees have a resolved address and salary.";
    else if (hasInvalidSalaries) errorMessage = "Please ensure all salaries are valid numbers greater than 0.";
    else if (hasDuplicates) errorMessage = "Duplicate addresses detected. Each employee must be unique.";

    return { isValid, errorMessage, addressCounts };
  }, [rows]);

  const handleConfirm = () => {
    if (!validationState.isValid) return;

    const validEmployees = rows
      .filter((row) => row.address !== null && row.salary.trim() !== "")
      .map((row) => ({
        username: row.username ? row.username : row.address,
        address: row.address as string,
        salary: row.salary,
      }));

    flowLog("Sending to Roster:", validEmployees);
    onConfirm(validEmployees);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-4xl p-4 bg-white dark:bg-[#0a0c10] border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-slate-50/50 dark:bg-slate-900/20 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <DialogTitle className="text-2xl text-slate-900 dark:text-white font-black tracking-tight">
              Add Team Members
            </DialogTitle>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Enter addresses manually or upload a CSV to batch add employees.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* HIDDEN INPUT */}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <Button
              variant="outline"
              onClick={handleUploadClick}
              className="h-10 bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl font-medium  transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload CSV File
            </Button>

            <Button
              onClick={handleDownloadTemplate}
              className=" bg-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-200 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" /> Get Template
            </Button>
          </div>
        </div>

        {/* Changed max-h to use dynamic viewport height for better scaling */}
        <div className="p-8 max-h-[60vh] overflow-y-auto bg-white dark:bg-[#0a0c10] flex flex-col min-h-[300px]">
          <div className="grid grid-cols-[1fr_200px_40px] gap-4 mb-3 px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Wallet Address or .init Name
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Salary (USDC)
            </span>
            <span></span>
          </div>

          <div className="space-y-4 flex-1">
            {rows.map((row) => (
              <StagingRowItem
                key={row.id}
                row={row}
                updateInput={updateInput}
                updateSalary={updateSalary}
                removeRow={removeRow}
                onResolveAddress={handleResolveAddress}
                isDuplicate={
                  row.address && row.address.length === 42
                    ? validationState.addressCounts[row.address.toLowerCase()] > 1
                    : false
                }
              />
            ))}
          </div>

          <div className="mt-4 px-2">
            <button
              onClick={addRow}
              className="group mx-auto mt-4 px-4 py-2  flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-transparent hover:bg-teal-50/50 dark:hover:bg-teal-500/10 hover:border-teal-200 dark:hover:border-teal-500/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors duration-300">
                <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:rotate-90 transition-all duration-300" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                Add Another Employee
              </span>
            </button>
          </div>
        </div>

        {validationState.errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-500/10 px-8 py-3 border-t border-rose-100 dark:border-rose-500/20 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-sm font-medium animate-in slide-in-from-bottom-2">
            <AlertTriangle className="w-4 h-4" />
            {validationState.errorMessage}
          </div>
        )}

        <div className="bg-slate-50/50 dark:bg-slate-900/20 p-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Total Valid
            </span>
            <div className="flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {rows.filter((r) => r.address && r.salary).length}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!validationState.isValid}
              className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg shadow-slate-900/10 transition-all font-black disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              Confirm & Stage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}