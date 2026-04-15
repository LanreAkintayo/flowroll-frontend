"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Sprout,
  Activity,
  Banknote,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Building2,
  User,
  ChevronDown,
  Check,
  Menu,
  X
} from "lucide-react";

import WalletConnectButton from "./WalletConnectButton";
import { AutoSignToggle } from "./AutoSignToggle";

import { flowLog } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import FlowrollLogo from "./FlowrollLogo";
import SmartHomeCTA from "./SmartHomeCTA";

export default function Navbar() {
  const pathname = usePathname() || '/';
  const router = useRouter();

  const { role, setRole } = useAuthStore();

  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  flowLog("The current role is : ", role);

  const isHome = pathname === "/";
  const isEmployee = pathname.startsWith("/employee") || (role === "employee" && !isHome);
  const isEmployer = pathname.startsWith("/employer") || (role === "employer" && !isHome);
  const isOnboarding = pathname.startsWith("/onboarding");
  const isApp = isEmployer || isEmployee || isOnboarding;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const handleSwitchWorkspace = (newRole: "employer" | "employee") => {
    setRole(newRole);
    setIsWorkspaceOpen(false);
    setIsMobileMenuOpen(false);
    router.push(`/${newRole}`);
  };

  const employerLinks = [
    { name: "Dashboard", href: "/employer", icon: LayoutDashboard },
    { name: "Groups", href: "/employer/my-groups", icon: Users },
    { name: "Vault", href: "/vault", icon: Wallet },
    { name: "Autosave", href: "/claim", icon: Sprout },
  ];

  const employeeLinks = [
    { name: "Dashboard", href: "/employee", icon: Activity },
    { name: "Salaries", href: "/employee/my-salaries", icon: Banknote },
    { name: "Vault", href: "/vault", icon: Wallet },
    { name: "Autosave", href: "/claim", icon: Sprout },
  ];

  const homeLinks = [
    { name: "Features", href: "#features", icon: Sparkles },
    { name: "Security", href: "#security", icon: ShieldCheck },
    { name: "Docs", href: "#docs", icon: BookOpen },
  ];

  const activeLinks = isEmployer ? employerLinks : isEmployee ? employeeLinks : homeLinks;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-[50] w-full bg-white/80 dark:bg-[#05070a]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">

        {/* --- LEFT SIDE: LOGO & WORKSPACE SWITCHER --- */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center group shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
              <FlowrollLogo />
            </div>
          </Link>

          {!isApp ? (
            <span className="font-mono text-xl text-slate-900 dark:text-white font-black tracking-tighter uppercase hidden sm:block">
              Flowroll
            </span>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
              <div className="hidden sm:block w-[1.5px] h-6 bg-slate-300 dark:bg-slate-700 shrink-0 rounded-full" />
              <div className="relative">
                <button
                  onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors duration-200 group"
                >
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-teal-500/30 transition-colors">
                    {role === 'employer' ? (
                      <Building2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:hidden">
                    {role === 'employer' ? 'Employer' : 'Employee'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                </button>

                <AnimatePresence>
                  {isWorkspaceOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-[200]"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 mb-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Switch Workspace</p>
                      </div>

                      <button
                        onClick={() => handleSwitchWorkspace('employer')}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className={`w-4 h-4 ${role === 'employer' ? 'text-teal-500' : 'text-slate-400'}`} />
                          <span className={`font-medium ${role === 'employer' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            Employer
                          </span>
                        </div>
                        {role === 'employer' && <Check className="w-4 h-4 text-teal-500" />}
                      </button>

                      <button
                        onClick={() => handleSwitchWorkspace('employee')}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <User className={`w-4 h-4 ${role === 'employee' ? 'text-teal-500' : 'text-slate-400'}`} />
                          <span className={`font-medium ${role === 'employee' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            Employee
                          </span>
                        </div>
                        {role === 'employee' && <Check className="w-4 h-4 text-teal-500" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* --- CENTER: DESKTOP NAV --- */}
        {!isOnboarding && !pathname.startsWith('/portal') && (
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-1 min-w-0">
            {activeLinks.map((link) => {
              if (!link.href || link.href.trim() === "") return null;

              const isActive = link.href.startsWith('#')
                ? false
                : link.href === '/' || link.href === '/employer' || link.href === '/employee'
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3 xl:px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors duration-300 whitespace-nowrap ${isActive
                    ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900/50"
                    : "text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/30"
                    }`}
                >
                  <link.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-500' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* --- RIGHT SIDE: ACTIONS & HAMBURGER --- */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-0">
          {isApp && (
            <div className="hidden sm:block">
              <AutoSignToggle variant="compact" />
            </div>
          )}

          {isApp && <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />}

          <div className="hidden sm:block">
            {isHome ? <SmartHomeCTA /> : <WalletConnectButton />}
          </div>

          {!isOnboarding && !pathname.startsWith('/portal') && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {/* --- MOBILE DROPDOWN MENU (Solid Version) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            // Removed backdrop-blur and /95 transparency. Now fully solid.
            className="lg:hidden absolute top-[72px] left-0 w-full h-[calc(100dvh-72px)] bg-white dark:bg-[#05070a] overflow-y-auto border-t border-slate-200 dark:border-slate-800"
          >
            <div className="px-4 py-8 flex flex-col gap-6 min-h-full">

              {/* --- NAVIGATION CARD --- */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 pl-4">
                  Menu
                </p>
                {/* Made the card background solid slate-50 (light) and #0a0c10 (dark) */}
                <div className="flex flex-col gap-1 bg-slate-100/70 dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-2 shadow-xs">
                  {activeLinks.map((link, i) => {
                    if (!link.href || link.href.trim() === "") return null;

                    const isActive = link.href.startsWith('#')
                      ? false
                      : link.href === '/' || link.href === '/employer' || link.href === '/employee'
                        ? pathname === link.href
                        : pathname.startsWith(link.href);

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={link.name}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive
                              ? "bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80"
                            }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-teal-50 dark:bg-teal-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <link.icon className={`w-4 h-4 ${isActive ? 'text-teal-500' : 'text-slate-500'}`} />
                          </div>
                          {link.name}
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* --- ACTIONS CARD --- */}
              <div className="mt-auto pt-6">
                <div className="bg-slate-100/70 dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 flex flex-col gap-4 shadow-xs">
                  {isApp && (
                    <>
                      <div className="flex items-center justify-between px-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Auto-Sign Tx</p>
                          <p className="text-xs font-medium text-slate-500">1-Click Protocol</p>
                        </div>
                        <AutoSignToggle variant="compact" />
                      </div>
                      <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />
                    </>
                  )}
                  <div className="w-full flex justify-center">
                    {isHome ? <SmartHomeCTA /> : <WalletConnectButton />}
                  </div>
                </div>
              </div>

              {/* Safe area padding for mobile browsers */}
              <div className="h-6 shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}