'use client'

import { useState } from 'react'
import { ArrowRightLeft, Globe, CheckCircle2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatUnits } from 'viem'

interface OmnichainBridgeProps {
  walletBalance: bigint
}

export function OmnichainBridge({ walletBalance }: OmnichainBridgeProps) {
  const [bridgeInput, setBridgeInput] = useState<string>("")
  const [targetChain, setTargetChain] = useState<string>("arbitrum")
  const [isBridging, setIsBridging] = useState(false)

  const formatBigInt = (amount: bigint) => Number(formatUnits(amount, 6)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formattedMax = Number(formatUnits(walletBalance, 6)).toString()

  const handleBridge = () => {
    setIsBridging(true)
    setTimeout(() => setIsBridging(false), 2000)
  }

  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      <div className="bg-white dark:bg-[#0f172a] rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Omnichain Bridge</h2>
        </div>

        <div className="bg-slate-50 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 mb-8 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Initia Wallet Balance
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatBigInt(walletBalance)} <span className="text-sm font-bold text-slate-500">USDC</span>
          </p>
        </div>

        <div className="mb-6 relative z-10 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Destination Chain</label>
          <div className="grid grid-cols-2 gap-3">
            {['arbitrum', 'optimism', 'base', 'ethereum'].map((chain) => (
              <button
                key={chain}
                onClick={() => setTargetChain(chain)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold capitalize transition-all ${targetChain === chain
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                {targetChain === chain ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current opacity-50" />}
                {chain}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Amount to Bridge</label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-lg font-bold text-slate-400">$</span>
            <input
              type="number"
              value={bridgeInput}
              onChange={(e) => setBridgeInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-8 pr-16 text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 tabular-nums"
              placeholder="0.00"
            />
            <button
              onClick={() => setBridgeInput(formattedMax)}
              className="absolute right-3 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded cursor-pointer"
            >
              Max
            </button>
          </div>
        </div>

        <div className="mt-auto relative z-10">
          <Button
            onClick={handleBridge}
            disabled={!bridgeInput || Number(bridgeInput) <= 0 || isBridging}
            variant="outline"
            className="w-full h-12 rounded-xl font-bold border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer"
          >
            {isBridging ? "Bridging..." : `Bridge to ${targetChain.charAt(0).toUpperCase() + targetChain.slice(1)}`}
            {!isBridging && <Zap className="w-4 h-4 ml-2" />}
          </Button>
          <p className="text-center text-[10px] font-medium text-slate-400 mt-3">Estimated time: ~3 mins via LayerZero</p>
        </div>
      </div>
    </div>
  )
}