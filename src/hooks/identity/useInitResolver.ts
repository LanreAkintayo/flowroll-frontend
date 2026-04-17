"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface InitResolutionResponse {
  address: string | null;
  error?: string;
}

export function useInitResolver(input: string) {
  const [debouncedInput, setDebouncedInput] = useState(input);

  // Input debounce lifecycle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);

  // Suffix validation
  const isValidInitName = debouncedInput.toLowerCase().endsWith(".init");

  const query = useQuery({
    queryKey: ["resolve-init", debouncedInput],
    queryFn: async (): Promise<string | null> => {
      if (!isValidInitName) return null;

      const nameWithoutSuffix = debouncedInput.replace(/\.init$/, "");

      const res = await fetch(
        `/api/resolve-init?name=${encodeURIComponent(nameWithoutSuffix)}`
      );

      // Handle unregistered names
      if (!res.ok) return null;

      const data: InitResolutionResponse = await res.json();
      return data.address || null;
    },
    enabled: isValidInitName,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  return {
    resolvedAddress: query.data ?? null,
    isResolving: query.isLoading && isValidInitName,
    isError: query.isError,
  };
}