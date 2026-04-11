'use client'

import { useState } from 'react'
import { ArrowDown, Globe, Zap, Search, Check, ChevronDown, Activity, Info, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { formatUnits, parseUnits } from 'viem'
import { TransactionModal, TxState } from '@/components/shared/TransactionModal'
import { useContractClient } from '@/hooks/useContractClient'
import { CUSTOM_APP_CHAIN } from '@/lib/interwoven'
import { useTokenBalance } from '@/hooks/token/useTokenQueries'

const SUPPORTED_CHAINS = [
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵' },
  { id: 'optimism', name: 'Optimism', icon: '🔴' },
  { id: 'base', name: 'Base', icon: '🔵' },
  { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
  { id: 'polygon', name: 'Polygon', icon: '🟣' },
  { id: 'bsc', name: 'BNB Chain', icon: '🟡' },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺' },
  { id: 'solana', name: 'Solana', icon: '🟣' },
  { id: 'celo', name: 'Celo', icon: '🟢' },
  { id: 'fantom', name: 'Fantom', icon: '👻' },
]

export function OmnichainBridge() {
  const { contracts, address } = useContractClient()
  const { data: walletBalance } = useTokenBalance(contracts.USDC_ADDRESS)
  const [bridgeInput, setBridgeInput] = useState<string>("")
  const [targetChain, setTargetChain] = useState(SUPPORTED_CHAINS[0])
  const [isChainSelectorOpen, setIsChainSelectorOpen] = useState(false)
  const currentChainName = CUSTOM_APP_CHAIN.chain_name

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [txState, setTxState] = useState<TxState>("idle")
  const [txHash, setTxHash] = useState<string>("")
  const [txError, setTxError] = useState<string>("")

  const formattedMax = walletBalance ? Number(formatUnits(walletBalance, 6)).toString() : "0"

  const handleInitiateBridge = () => {
    setTxState("review")
    setIsModalOpen(true)
  }

  const executeBridge = async () => {
    setTxState("processing")
    setTxError("")

    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setTxHash("0xabc123mockhash456789")
      setTxState("success")
    } catch (error: any) {
      setTxError("Bridge transaction failed at the relayer level.")
      setTxState("error")
    }
  }

  return (
    <div className="lg:col-span-5 flex flex-col">
      <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col h-full relative overflow-hidden">

        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 flex flex-col h-full relative z-10">
          
          {/* 1. THE HEADER BADGE */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-500/10 border border-slate-100 dark:border-slate-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Flowroll Bridge</h2>
                <span className="bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col relative mb-8">

            <div className="bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 pb-8 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">From</span>
                <span className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-1.5 bg-white dark:bg-[#0f172a] px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                  {currentChainName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={bridgeInput}
                  onChange={(e) => setBridgeInput(e.target.value)}
                  className="bg-transparent text-4xl font-black text-slate-900 dark:text-white outline-none w-full tabular-nums tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  placeholder="0.00"
                />
                <span className="text-xl font-medium text-slate-600">USDC</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setBridgeInput(formattedMax)}
                  className="text-[10px] font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Max
                </button>
                <p className="text-xs font-medium text-slate-500">
                  Balance: {formattedMax}
                </p>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-10 h-10 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <ArrowDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800/80 rounded-b-2xl p-5 pt-8 -mt-4 relative">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">To</span>
              </div>

              <Popover open={isChainSelectorOpen} onOpenChange={setIsChainSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isChainSelectorOpen}
                    className="w-full h-14 justify-between bg-slate-50 dark:bg-[#0b1120] border-slate-200 dark:border-slate-800 text-lg font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{targetChain.icon}</span>
                      {targetChain.name}
                    </div>
                    <ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                  <Command className="bg-transparent">
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <CommandInput placeholder="Search networks..." className="h-11 border-0 focus:ring-0 text-sm font-medium" />
                    </div>
                    <CommandList className="max-h-[200px] overflow-y-auto p-1">
                      <CommandEmpty className="py-6 text-center text-sm">No network found.</CommandEmpty>
                      <CommandGroup>
                        {SUPPORTED_CHAINS.map((chain) => (
                          <CommandItem
                            key={chain.id}
                            value={chain.name}
                            onSelect={() => {
                              setTargetChain(chain)
                              setIsChainSelectorOpen(false)
                            }}
                            className="flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800"
                          >
                            <div className="flex items-center gap-3 font-medium text-slate-900 dark:text-white">
                              <span className="text-xl">{chain.icon}</span>
                              {chain.name}
                            </div>
                            {targetChain.id === chain.id && (
                              <Check className="h-4 w-4 text-slate-500" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            {/* 2. THE INFO BANNER */}
            <div className="bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Omnichain routing will be unlocked as soon as the Flowroll Appchain completes deployment.
              </p>
            </div>

            {/* 3. THE LOCKED CTA BUTTON */}
            <Button
              disabled={true}
              className="w-full h-14 rounded-2xl font-medium text-base bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed shadow-none"
            >
              <Lock className="w-4 h-4 mr-2" />
              Appchain Deployment Pending
            </Button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        status={txState}
        title="Confirm Bridge"
        summaryLabel="Amount to Bridge"
        summaryAmount={`$${Number(bridgeInput || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`}
        details={[
          { label: "From Network", value: "Initia" },
          { label: "To Network", value: targetChain.name },
          { label: "Estimated Time", value: "~3 Minutes" },
          { label: "Powered By", value: "LayerZero" }
        ]}
        hash={txHash}
        errorMessage={txError}
        onConfirm={executeBridge}
        onClose={() => setTxState("idle")}
      />
    </div>
  )
}