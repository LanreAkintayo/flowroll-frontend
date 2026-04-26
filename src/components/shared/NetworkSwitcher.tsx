"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { Network, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APPCHAIN_EVM, TESTNET_EVM } from "@/lib/interwoven";

export function NetworkSwitcher() {
    const currentChainId = useChainId();
    const { switchChain } = useSwitchChain();

    const isTestnet = currentChainId === TESTNET_EVM.id;
    const currentLabel = isTestnet ? "Testnet" : "Appchain";

    const handleSwitch = (targetChainId: number, name: string) => {
        if (currentChainId === targetChainId) return;

        switchChain(
            { chainId: targetChainId },
            {
                onSuccess: () => { toast.success(`Switched to ${name}`) },
                onError: (error) => { toast.error(`Failed to switch network: ${error.message}`) },
            }
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-full h-10 px-4 gap-2 bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800"
                >
                    <div className={`w-2 h-2 rounded-full ${isTestnet ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    <span className="text-sm font-bold tracking-tight">{currentLabel}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 rounded-xl z-[200]">
                <DropdownMenuItem
                    onClick={() => handleSwitch(APPCHAIN_EVM.id, "Flowroll Appchain")}
                    className="flex items-center justify-between cursor-pointer py-2.5"
                >
                    <span className="font-medium text-sm">Flowroll Appchain</span>
                    {!isTestnet && <Check className="w-4 h-4 text-emerald-500" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleSwitch(TESTNET_EVM.id, "Initia Testnet")}
                    className="flex items-center justify-between cursor-pointer py-2.5"
                >
                    <span className="font-medium text-sm">Initia Testnet</span>
                    {isTestnet && <Check className="w-4 h-4 text-blue-500" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}