"use client";

import { useIdentity, useWalletActions } from '@/hooks/identity/useIdentity';
import { Wallet, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WalletConnectButtonProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function WalletConnectButton({ 
  variant = 'full', 
  className = '' 
}: WalletConnectButtonProps) {
  const { isConnected, displayName, isLoading } = useIdentity();
  const { openConnect, openWallet } = useWalletActions();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        // Loading State
        <motion.button
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          disabled
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 cursor-wait ${className}`}
        >
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
            Syncing...
          </span>
        </motion.button>
      ) : !isConnected ? (
        // Disconnected State
        <motion.button
          key="connect"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openConnect}
          className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all border border-slate-700/50 dark:border-none ${variant === 'compact' ? 'px-4' : ''} ${className} cursor-pointer`}
        >
          <Wallet className="w-4 h-4 text-slate-300 dark:text-slate-500" />
          <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
            Connect Wallet
          </span>
        </motion.button>
      ) : (
        // Connected State
        <motion.button
          key="connected"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          layout
          onClick={openWallet}
          className={`group inline-flex items-center gap-3 p-1.5 pr-4 rounded-full text-sm font-medium bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-200 dark:hover:border-slate-500/30 hover:shadow-md hover:shadow-slate-500/5 transition-all duration-300 ${className} cursor-pointer`}
        >
          {/* Visual Avatar with Status Indicator */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <span className="text-[11px] text-slate-900 dark:text-white font-black">
                  {displayName?.charAt(0).toUpperCase() || 'W'}
                </span>
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0a0c10] rounded-full shadow-xs" />
          </div>
          
          <div className="flex flex-col items-start leading-none">
            <span className="text-slate-900 dark:text-white tracking-tight mb-0.5">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              Connected
            </span>
          </div>
          
          <ChevronDown className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors ml-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}