"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Wallet,
  DollarSign,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useInitResolver } from "@/hooks/identity/useInitResolver";
import { flowLog } from "@/lib/utils";

export type StagingRow = {
  id: string;
  identifier: string;
  username: string | null;
  address: string | null;
  salary: string;
};

function StagingRowItem({
  row,
  updateInput,
  updateSalary,
  removeRow,
  onResolveAddress,
  isDuplicate
}: {
  row: StagingRow;
  updateInput: (id: string, value: string) => void;
  updateSalary: (id: string, value: string) => void;
  removeRow: (id: string) => void;
  onResolveAddress: (id: string, address: string) => void;
  isDuplicate: boolean;
}) {
  const { resolvedAddress, isResolving, isError } = useInitResolver(
    row.identifier.trim(),
  );

  const finalResolvedAddress =
    typeof resolvedAddress === "string"
      ? resolvedAddress
      : Array.isArray(resolvedAddress)
        ? resolvedAddress[0]
        : null;

  useEffect(() => {
    if (
      finalResolvedAddress &&
      row.username &&
      row.address !== finalResolvedAddress
    ) {
      onResolveAddress(row.id, finalResolvedAddress);
    }
  }, [
    finalResolvedAddress,
    row.username,
    row.address,
    row.id,
    onResolveAddress,
  ]);

  // Validation Flags
  const isMalformedEthAddress =
    row.identifier.trim().startsWith("0x") &&
    row.identifier.trim().length > 2 &&
    row.identifier.trim().length !== 42;
  const isInvalidAddress = isError || isMalformedEthAddress || isDuplicate;
  const isInvalidSalary =
    row.salary !== "" && (isNaN(Number(row.salary)) || Number(row.salary) <= 0);

  return (
    <div className="grid grid-cols-[1fr_200px_40px] gap-4 items-start group">
      <div className="relative flex flex-col gap-1.5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Wallet
              className={`h-4 w-4 ${isInvalidAddress ? "text-rose-400" : "text-slate-400"}`}
            />
          </div>

          <Input
            value={row.identifier}
            onChange={(e) => updateInput(row.id, e.target.value)}
            placeholder="0x... or name.init"
            className={`pl-9 pr-12 h-12 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus-visible:ring-blue-500 transition-all font-mono text-sm ${
              isInvalidAddress
                ? "border-rose-300 focus-visible:ring-rose-200 bg-rose-50/30"
                : ""
            }`}
          />

          <div className=" absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {isResolving && (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            )}
            {row.address && !isResolving && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            {isInvalidAddress && <XCircle className="h-4 w-4 text-rose-500" />}
          </div>
        </div>

        {row.username && row.address && !isResolving && (
          <div className="flex items-center gap-1.5 px-2 animate-in fade-in slide-in-from-top-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-600">
              Resolved:
            </span>
            <span className="text-xs font-mono text-slate-500">
              {row.address}
            </span>
          </div>
        )}

        {isInvalidAddress && (
         <span className="text-xs font-medium text-rose-500 px-2 animate-in fade-in">
            {isError ? "Name not registered" : isDuplicate ? "Duplicate employee" : "Invalid address format"}
          </span>
        )}
      </div>

      <div className="relative flex flex-col gap-1.5">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <DollarSign
              className={`h-4 w-4 ${isInvalidSalary ? "text-rose-400" : "text-slate-400"}`}
            />
          </div>
          <Input
            value={row.salary}
            onChange={(e) => updateSalary(row.id, e.target.value)}
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            className={`pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus-visible:ring-blue-500 font-montserrat font-medium ${
              isInvalidSalary
                ? "border-rose-300 focus-visible:ring-rose-500 bg-rose-50/30"
                : ""
            }`}
          />
        </div>
        {isInvalidSalary && (
          <span className="text-xs font-medium text-rose-500 px-2 animate-in fade-in">
            Must be greater than 0
          </span>
        )}
      </div>

      <div className="pt-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeRow(row.id)}
          className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

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
    { id: "1", identifier: "", username: null, address: null, salary: "" },
  ]);

  const addRow = () =>
    setRows([
      ...rows,
      {
        id: Math.random().toString(),
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

        const cleanValue = value.trim(); // Protect against trailing spaces
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
      // Only count it if it's an actual, fully-formed address.
      if (row.address && row.address.length === 42) {
        const addr = row.address.toLowerCase();
        addressCounts[addr] = (addressCounts[addr] || 0) + 1;
      }
    });

    const emptyRowsCount = rows.filter(
      (r) => r.identifier.trim() === "" && r.salary.trim() === "",
    ).length;

    // Check for partially filled rows or unresolved addresses
    const hasIncompleteRows = rows.some(
      (r) =>
        (r.identifier !== "" && !r.address) || // Typed something, but no valid address yet
        (r.address && r.salary === "") || // Has address, but no salary
        (r.identifier === "" && r.salary !== ""), // Has salary, but no address
    );

    // Check for invalid numbers (negative or zero)
    const hasInvalidSalaries = rows.some(
      (r) =>
        r.salary !== "" && (isNaN(Number(r.salary)) || Number(r.salary) <= 0),
    );

    const hasDuplicates = Object.values(addressCounts).some(
      (count) => count > 1,
    );
    const isCompletelyEmpty = emptyRowsCount === rows.length;
    const isValid =
      !isCompletelyEmpty &&
      !hasIncompleteRows &&
      !hasInvalidSalaries &&
      !hasDuplicates;

    let errorMessage = null;
    if (hasIncompleteRows)
      errorMessage =
        "Please ensure all employees have a resolved address and salary.";
    else if (hasInvalidSalaries)
      errorMessage =
        "Please ensure all salaries are valid numbers greater than 0.";
    else if (hasDuplicates)
      errorMessage =
        "Duplicate addresses detected. Each employee must be unique.";
    return { isValid, errorMessage, addressCounts };
  }, [rows]);

  const handleConfirm = () => {
    if (!validationState.isValid) return;

    // Filter out completely empty rows, map the valid ones
    const validEmployees = rows
      .filter((row) => row.address !== null && row.salary.trim() !== "")
      .map((row) => ({
        username: row.username ? row.username : row.address,
        address: row.address as string,
        salary: row.salary,
      }));

    flowLog("Sending clean, verified data to Roster:", validEmployees);
    onConfirm(validEmployees);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-3xl bg-white border-slate-200 rounded-[2rem] p-0 overflow-hidden shadow-2xl shadow-slate-900/10"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="bg-slate-50/50 px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <DialogTitle className="font-montserrat text-2xl text-slate-900 tracking-tight">
              Add Team Members
            </DialogTitle>
            <p className="text-slate-500 mt-1.5 text-sm">
              Enter addresses manually or upload a CSV to batch add employees.
            </p>
          </div>

          <Button
            variant="outline"
            className="h-10 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>

        <div className="p-8 max-h-[50vh] overflow-y-auto bg-white flex flex-col min-h-[300px]">
          <div className="grid grid-cols-[1fr_200px_40px] gap-4 mb-3 px-2">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Wallet Address or .init Name
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
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
                    ? validationState.addressCounts[row.address.toLowerCase()] >
                      1
                    : false
                }
              />
            ))}
          </div>

          <div>
            <Button
              variant="ghost"
              onClick={addRow}
              className="mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-semibold rounded-xl px-4 py-2 h-auto"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Another Row
            </Button>
          </div>
        </div>

        {validationState.errorMessage && (
          <div className="bg-amber-50 px-8 py-3 border-t border-amber-100 flex items-center gap-2 text-amber-700 text-sm font-medium animate-in slide-in-from-bottom-2">
            <AlertTriangle className="w-4 h-4" />
            {validationState.errorMessage}
          </div>
        )}

        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Total Valid:{" "}
            <span className="text-slate-900 font-bold">
              {rows.filter((r) => r.address && r.salary).length}
            </span>
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!validationState.isValid}
              className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Stage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { UploadCloud, Plus, Trash2, CheckCircle2, Loader2, Wallet, DollarSign, XCircle } from "lucide-react";
// import { useInitResolver } from "@/hooks/identity/useInitResolver";
// import { flowLog } from "@/lib/utils";

// // 1. Your Explicit Staging Row Type
// export type StagingRow = {
//   id: string;
//   identifier: string; // The raw input text
//   username: string | null; // Populated ONLY if it's an .init name
//   address: string | null;  // Populated by 0x input OR by the resolver
//   salary: string;
// };

// function StagingRowItem({
//   row,
//   updateInput,
//   updateSalary,
//   removeRow,
//   onResolveAddress,
// }: {
//   row: StagingRow;
//   updateInput: (id: string, value: string) => void;
//   updateSalary: (id: string, value: string) => void;
//   removeRow: (id: string) => void;
//   onResolveAddress: (id: string, address: string) => void;
// }) {
//   const { resolvedAddress, isResolving, isError } = useInitResolver(row.identifier);

//   useEffect(() => {
//     if (resolvedAddress && row.username && row.address !== resolvedAddress) {
//       onResolveAddress(row.id, resolvedAddress);
//     }
//   }, [resolvedAddress, row.username, row.address, row.id, onResolveAddress]);

//   return (
//     <div className="grid grid-cols-[1fr_200px_40px] gap-4 items-start group">
//       <div className="relative flex flex-col gap-1.5">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
//             <Wallet className="h-4 w-4 text-slate-400" />
//           </div>

//           <Input
//             value={row.identifier}
//             onChange={(e) => updateInput(row.id, e.target.value)}
//             placeholder="0x... or name.init"
//             className={`pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus-visible:ring-blue-500 transition-all font-mono text-sm ${isError ? "border-rose-300 focus-visible:ring-rose-500" : ""}`}
//           />

//           <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
//             {isResolving && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
//             {row.address && !isResolving && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
//             {isError && <XCircle className="h-4 w-4 text-rose-500" />}
//           </div>
//         </div>

//         {/* Show the resolved pill ONLY if it's an .init name and we successfully got the address */}
//         {row.username && row.address && !isResolving && (
//           <div className="flex items-center gap-1.5 px-2 animate-in fade-in slide-in-from-top-1">
//             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//             <span className="text-xs font-medium text-emerald-600">Resolved:</span>
//             <span className="text-xs font-mono text-slate-500">{row.address}</span>
//           </div>
//         )}

//         {isError && (
//           <span className="text-xs font-medium text-rose-500 px-2 animate-in fade-in">
//             Name not found
//           </span>
//         )}
//       </div>

//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
//           <DollarSign className="h-4 w-4 text-slate-400" />
//         </div>
//         <Input
//           value={row.salary}
//           onChange={(e) => updateSalary(row.id, e.target.value)}
//           type="number"
//           placeholder="0.00"
//           className="pl-10 h-12 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus-visible:ring-blue-500 font-montserrat font-semibold"
//         />
//       </div>

//       <div className="pt-1.5">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => removeRow(row.id)}
//           className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
//         >
//           <Trash2 className="w-4 h-4" />
//         </Button>
//       </div>
//     </div>
//   );
// }

// export function AddEmployeeModal({
//   isOpen,
//   onClose,
//   groupId,
//   onConfirm,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   groupId: bigint;
//   onConfirm: (employees: any[]) => void;
// }) {
//   const [rows, setRows] = useState<StagingRow[]>([
//     { id: "1", identifier: "", username: null, address: null, salary: "" },
//   ]);

//   const addRow = () => {
//     setRows([...rows, { id: Math.random().toString(), identifier: "", username: null, address: null, salary: "" }]);
//   };

//   const removeRow = (id: string) => {
//     if (rows.length > 1) setRows(rows.filter((row) => row.id !== id));
//   };

//   const updateInput = (id: string, value: string) => {
//     setRows(rows.map(row => {
//       if (row.id !== id) return row;

//       const isInit = value.toLowerCase().endsWith(".init");
//       const isEth = value.startsWith("0x") && value.length === 42;

//       return {
//         ...row,
//         identifier: value,
//         username: isInit ? value : null,
//         // If they type a raw 0x address, set it instantly. Otherwise, clear it and wait for resolver.
//         address: isEth ? value : null,
//       };
//     }));
//   };

//   const updateSalary = (id: string, value: string) => {
//     setRows(rows.map((row) => (row.id === id ? { ...row, salary: value } : row)));
//   };

//   const handleResolveAddress = (id: string, address: string) => {
//     setRows(currentRows => currentRows.map(row =>
//       row.id === id ? { ...row, address } : row
//     ));
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <DialogContent
//         className="sm:max-w-3xl bg-white border-slate-200 rounded-[2rem] p-0 overflow-hidden shadow-2xl shadow-slate-900/10"
//         onPointerDownOutside={(e) => e.preventDefault()}
//         onEscapeKeyDown={(e) => e.preventDefault()}
//       >
//         <div className="bg-slate-50/50 px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-start">
//           <div>
//             <DialogTitle className="font-montserrat text-2xl text-slate-900 tracking-tight">
//               Add Team Members
//             </DialogTitle>
//             <p className="text-slate-500 mt-1.5 text-sm">
//               Enter addresses manually or upload a CSV to batch add employees.
//             </p>
//           </div>

//           <Button variant="outline" className="h-10 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl font-medium shadow-sm transition-all">
//             <UploadCloud className="w-4 h-4 mr-2" />
//             Upload CSV
//           </Button>
//         </div>

//         <div className="p-8 max-h-[50vh] overflow-y-auto bg-white">
//           <div className="grid grid-cols-[1fr_200px_40px] gap-4 mb-3 px-2">
//             <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Wallet Address or .init Name</span>
//             <span className="text-xs font-medium uppercase tracking-widest text-slate-500">Salary (USDC)</span>
//             <span></span>
//           </div>

//           <div className="space-y-4">
//             {rows.map((row) => (
//               <StagingRowItem
//                 key={row.id}
//                 row={row}
//                 updateInput={updateInput}
//                 updateSalary={updateSalary}
//                 removeRow={removeRow}
//                 onResolveAddress={handleResolveAddress}
//               />
//             ))}
//           </div>

//           <Button variant="ghost" onClick={addRow} className="mt-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-semibold rounded-xl px-4 py-2 h-auto">
//             <Plus className="w-4 h-4 mr-1.5" />
//             Add Another Row
//           </Button>
//         </div>

//         <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
//           <p className="text-sm font-medium text-slate-500">
//             Total Employees: <span className="text-slate-900 font-bold">{rows.length}</span>
//           </p>
//           <div className="flex gap-3">
//             <Button variant="outline" onClick={onClose} className="h-12 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-white">
//               Cancel
//             </Button>
//             <Button
//               onClick={() => {
//                 const validEmployees = rows
//                   .filter((row) => row.address !== null && row.salary.trim() !== "")
//                   .map((row) => ({
//                     username: row.username ? row.username : row.address,
//                     address: row.address as string, // We know it's not null because of the filter
//                     salary: row.salary,
//                   }));

//                 if (validEmployees.length > 0) {
//                   flowLog("Sending clean, verified data to Roster:", validEmployees);
//                   onConfirm(validEmployees);
//                 } else {
//                   flowLog("No valid rows to confirm.");
//                 }
//               }}
//               className="h-12 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all font-semibold"
//             >
//               Confirm & Stage {rows.filter(r => r.address && r.salary).length} Members
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
