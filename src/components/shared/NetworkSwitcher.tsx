"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APPCHAIN_EVM, TESTNET_EVM } from "@/lib/interwoven";

interface NetworkSwitcherProps {
  className?: string;
}

export function NetworkSwitcher({ className = "" }: NetworkSwitcherProps) {
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isTestnet = currentChainId === TESTNET_EVM.id;
  const currentLabel = isTestnet ? "evm-1" : "flowroll-4";

  const handleSwitch = (targetChainId: number, name: string) => {
    if (currentChainId === targetChainId) return;

    switchChain(
      { chainId: targetChainId },
      {
        onSuccess: () => {
          toast.success(`Switched to ${name}`);
        },
        onError: (error) => {
          toast.error(`Failed to switch network: ${error.message}`);
        },
      }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`rounded-full px-3 sm:px-4 gap-1.5 sm:gap-2 bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800 shadow-none w-fit ${className}`}
        >
          <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 tracking-tight font-medium text-left">
            {currentLabel}
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 sm:w-52 rounded-xl z-[200] border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a]"
      >
        <DropdownMenuItem
          disabled
          className="flex items-center justify-between cursor-not-allowed opacity-50 py-3 sm:py-2.5 px-3 rounded-lg data-[disabled]:pointer-events-none"
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-medium text-xs text-slate-900 dark:text-white break-words whitespace-normal">
              flowroll-4
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">
              Requires Local Appchain
            </span>
          </div>
          {!isTestnet && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSwitch(TESTNET_EVM.id, "evm-1")}
          className="flex items-center justify-between cursor-pointer py-3 sm:py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-900 rounded-lg"
        >
          <span className="font-medium text-xs text-slate-900 dark:text-white break-words whitespace-normal">
            evm-1
          </span>
          {isTestnet && <Check className="w-4 h-4 text-blue-500 shrink-0 ml-2" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}




// "use client";

// import { useChainId, useSwitchChain } from "wagmi";
// import { ChevronDown, Check } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { APPCHAIN_EVM, TESTNET_EVM } from "@/lib/interwoven";

// interface NetworkSwitcherProps {
//     className?: string;
// }

// export function NetworkSwitcher({ className = "" }: NetworkSwitcherProps) {
//     const currentChainId = useChainId();
//     const { switchChain } = useSwitchChain();

//     const isTestnet = currentChainId === TESTNET_EVM.id;
//     const currentLabel = isTestnet ? "evm-1" : "flowroll-4";


//     const handleSwitch = (targetChainId: number, name: string) => {
//         if (currentChainId === targetChainId) return;

//         switchChain(
//             { chainId: targetChainId },
//             {
//                 onSuccess: () => { toast.success(`Switched to ${name}`) },
//                 onError: (error) => { toast.error(`Failed to switch network: ${error.message}`) },
//             }
//         );
//     };

//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button
//                     variant="outline"
//                     className={`rounded-full px-3 sm:px-4 gap-1.5 sm:gap-2 bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800 shadow-none w-fit ${className}`}
//                 >
//                     <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 tracking-tight font-medium text-left">
//                         {currentLabel}
//                     </span>
//                     <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
//                 </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent 
//                 align="end" 
//                 className="w-48 sm:w-52 rounded-xl z-[200] border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a]"
//             >
//                 <DropdownMenuItem
//                     onClick={() => handleSwitch(APPCHAIN_EVM.id, "flowroll-4")}
//                     className="flex items-center justify-between cursor-pointer py-3 sm:py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-900 rounded-lg"
//                 >
//                     <span className="font-medium text-xs text-slate-900 dark:text-white break-words whitespace-normal">
//                         flowroll-4
//                     </span>
//                     {!isTestnet && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
//                 </DropdownMenuItem>

//                 <DropdownMenuItem
//                     onClick={() => handleSwitch(TESTNET_EVM.id, "evm-1")}
//                     className="flex items-center justify-between cursor-pointer py-3 sm:py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-900 rounded-lg"
//                 >
//                     <span className="font-medium text-xs text-slate-900 dark:text-white break-words whitespace-normal">
//                         evm-1
//                     </span>
//                     {isTestnet && <Check className="w-4 h-4 text-blue-500 shrink-0 ml-2" />}
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }