"use client";

import { useIdentity, useWalletActions } from '@/hooks/identity/useIdentity';
import { Wallet, Loader2, ChevronDown, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function WalletConnectButton({ variant = 'full', className = '' }: Props) {
  const { isConnected, displayName, isLoading } = useIdentity();
  const { openConnect, openWallet } = useWalletActions();

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.button
          key="loading"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          disabled
          className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-slate-50 border border-slate-100 text-slate-400 cursor-wait ${className}`}
        >
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
            Syncing...
          </span>
        </motion.button>
      ) : !isConnected ? (
        <motion.button
          key="connect"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openConnect}
          className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-sm font-bold bg-slate-900 text-white shadow-sm shadow-slate-900/10 hover:bg-slate-800 transition-all border border-slate-700/50 ${variant === 'compact' ? 'px-4' : ''} ${className} cursor-pointer`}
        >
          <Wallet className="w-4 h-4 text-slate-300" />
          <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
            Connect Wallet
          </span>
        </motion.button>
      ) : (
        <motion.button
          key="connected"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          layout
          onClick={openWallet}
          className={`group inline-flex items-center gap-3 p-1.5 pr-4 rounded-full text-sm font-medium bg-white border border-slate-200 shadow-xs hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300 ${className} cursor-pointer`}
        >
          {/* Status-Integrated Avatar */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <span className="text-[11px] text-slate-900 font-black">
                  {displayName?.charAt(0).toUpperCase() || 'W'}
                </span>
              </div>
            </div>
            {/* Live Connection Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>
          
          <div className="flex flex-col items-start leading-none">
            <span className="text-slate-900 tracking-tight mb-0.5">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Connected
            </span>
          </div>
          
          <ChevronDown className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors ml-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}


// "use client";

// import { useIdentity, useWalletActions } from '@/hooks/identity/useIdentity';
// import { Wallet, Loader2, ChevronDown } from "lucide-react";

// interface Props {
//   variant?: 'full' | 'compact';
//   className?: string;
// }

// export default function WalletConnectButton({ variant = 'full', className = '' }: Props) {
//   const { isConnected, displayName, isLoading } = useIdentity();
//   const { openConnect, openWallet } = useWalletActions();

//   if (isLoading) {
//     return (
//       <button 
//         disabled 
//         className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-50 border border-slate-100 text-slate-400 cursor-wait transition-all ${className}`}
//       >
//         <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
//         <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
//           Connecting...
//         </span>
//       </button>
//     );
//   }

//   if (!isConnected) {
//     return (
//       <button
//         onClick={openConnect}
//         className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${variant === 'compact' ? 'px-4 py-2' : ''} ${className}`}
//       >
//         <Wallet className="w-4 h-4" />
//         <span className={variant === 'compact' ? 'hidden sm:inline-block' : ''}>
//           Connect Wallet
//         </span>
//       </button>
//     );
//   }

//   return (
//     <button
//       onClick={openWallet}
//       className={`group inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-full text-sm font-semibold bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${className}`}
//     >
//       {/* Micro-Avatar Generator */}
//       <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 shadow-inner flex items-center justify-center border-2 border-white group-hover:scale-105 transition-transform">
//         <span className="text-[10px] text-white font-bold tracking-tighter">
//           {displayName?.charAt(0).toUpperCase() || 'W'}
//         </span>
//       </div>
      
//       <span className="text-slate-700 group-hover:text-slate-900 transition-colors tracking-tight">
//         {displayName}
//       </span>
      
//       <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors ml-0.5" />
//     </button>
//   );
// } 