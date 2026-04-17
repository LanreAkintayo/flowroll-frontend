"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { DisbursementRecord } from "@/types";
import { ActiveEmployeeRow } from "../employee/ActiveEmployeeRow";

export interface ActiveEmployee {
  address: string;
  username?: string | null;
  salary: bigint;
}

interface ActiveEmployeeRosterProps {
  employees: ActiveEmployee[];
  disbursementRecord: DisbursementRecord;
}

export function ActiveEmployeeRoster({
  employees,
  disbursementRecord
}: ActiveEmployeeRosterProps) {
  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <Table>
          
          {/* Roster Header */}
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

          {/* Roster Body */}
          <TableBody>
            {employees.map((emp) => (
              <ActiveEmployeeRow 
                key={emp.address} 
                emp={emp} 
                disbursementRecord={disbursementRecord} 
              />
            ))}
          </TableBody>
          
        </Table>
      </div>
    </div>
  );
}