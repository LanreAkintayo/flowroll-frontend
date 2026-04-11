"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import WalletConnectButton from "./WalletConnectButton";
import UsernameDisplay from "./UsernameDisplay";
import { AutoSignToggle } from "./AutoSignToggle";
import { Building2, User } from "lucide-react";

export default function Navbar() {
  const { role } = useAuthStore();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.03)]"
    >
      <div className=" px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-900 shadow-sm transition-transform group-hover:scale-105 group-active:scale-95">
              <FlowrollLogo />
            </div>
            <span className="font-montserrat font-extrabold text-xl tracking-tight text-slate-900">
              Flowroll
            </span>
          </Link>

          {role && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 transition-colors hover:bg-slate-100"
            >
              {role === "employer" ? (
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                {role}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-100">
            <AutoSignToggle variant="compact" />
          </div>
          
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block mx-1" />
          
          <WalletConnectButton variant="compact" />
        </div>

      </div>
    </motion.header>
  );
}

function FlowrollLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="text-white"
    >
      <circle
        cx="14"
        cy="14"
        r="13"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-90"
      />
      <path
        d="M9 14 C9 10 12 8 14 8 C16 8 19 10 19 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M9 14 C9 18 12 20 14 20 C16 20 19 18 19 14"
        stroke="#34d399" 
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="14" r="2.5" fill="#34d399" />
    </svg>
  );
}