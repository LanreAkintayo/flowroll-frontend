"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouting, setIsRouting] = useState(false);

  // Automatically switch off the loader layout the exact millisecond the URL changes
  useEffect(() => {
    setIsRouting(false);
  }, [pathname, searchParams]);

  // Intercept all document click interactions globally to catch Link triggers
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Look up the DOM tree to see if the clicked element is inside a valid Next link
      const anchor = target.closest("a");

      if (
        anchor && 
        anchor.href && 
        anchor.host === window.location.host && // Only track internal app transitions
        !anchor.getAttribute("download") && 
        anchor.target !== "_blank"
      ) {
        // Skip triggering if they clicked the exact same page they are already on
        const currentUrl = window.location.pathname + window.location.search;
        const targetUrl = anchor.pathname + anchor.search;
        
        if (currentUrl !== targetUrl) {
          setIsRouting(true);
        }
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  if (!isRouting) return null;

  return (
    <div className="fixed top-4 right-4 z-[99999] bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
      <Loader2 className="w-4 h-4 text-emerald-500 animate-spin stroke-[2.5]" />
      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
        Routing Split...
      </span>
    </div>
  );
}