import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Wallet, AlertCircle, Copy, Check } from "lucide-react";
import { Employee } from "@/types";
import { flowLog } from "@/lib/utils";

export function DraftEmployeeRow({ 
  emp, 
  onRemove 
}: { 
  emp: Employee; 
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);

//   flowLog("Rendering DraftEmployeeRow for:", emp);

  const handleCopy = () => {
    navigator.clipboard.writeText(emp.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInitName = emp.username && emp.username.toLowerCase().endsWith(".init");
  
  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Extract the Address Pill + Copy into a neat variable so we keep the render clean
  const AddressWithCopy = (
    <div className="flex items-center gap-1.5 mt-0.5">
      <div className="group/tooltip relative flex items-center">
        <span className="font-mono text-slate-500 text-xs bg-white border border-slate-200/60 px-2 py-0.5 rounded-md cursor-default shadow-sm">
          {truncateAddress(emp.address)}
        </span>
        
        {/* Custom CSS Hover Tooltip for Full Address */}
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover/tooltip:block z-50">
          <div className="bg-slate-900 text-white text-[10px] font-mono py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
            {emp.address}
          </div>
        </div>
      </div>

      {/* Inline Copy Button */}
      <button 
        onClick={handleCopy}
        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md hover:bg-white"
        title="Copy full address"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );

  return (
    <TableRow className="border-slate-100 bg-amber-50/30 hover:bg-amber-50/60 transition-colors group">
      
      {/* We use shadow-[inset_4px_0_0_0_#fbbf24] to perfectly simulate the left border without absolute positioning bugs */}
      <TableCell className="py-5 pl-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 border border-white shadow-sm flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              {/* Primary Name */}
              <span className="font-medium text-slate-900 text-sm">
                {isInitName ? emp.username : "Raw Address"}
              </span>
              
              {/* Draft Badge */}
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-[2px] rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Staged
              </span>
            </div>

            {/* Address at the bottom with copy icon right beside it */}
            {AddressWithCopy}
            
          </div>
        </div>
      </TableCell>
      
      <TableCell className="py-5">
        <div className="flex flex-col items-end">
          <span className="font-montserrat font-medium text-slate-700 text-sm">
            {Number(emp.salary).toLocaleString()} 
            <span className="text-xs font-medium text-slate-500 ml-1">USDC</span>
          </span>
        </div>
      </TableCell>
      
      <TableCell className="text-right py-5 pr-8">
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove}
            className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}