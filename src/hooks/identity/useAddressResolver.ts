"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface ResolutionResponse {
  username: string | null;
  error?: string;
}

export function useAddressResolver(address: string) {
  const [debouncedAddress, setDebouncedAddress] = useState(address);

  // Input debounce lifecycle
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 500);
    return () => clearTimeout(timer);
  }, [address]);

  // Basic EVM validation
  const isValidAddress = debouncedAddress?.startsWith("0x") && debouncedAddress?.length === 42;

  const query = useQuery({
    queryKey: ["resolve-address", debouncedAddress],
    queryFn: async (): Promise<string | null> => {
      if (!isValidAddress) return null;

      const res = await fetch(`/api/resolve-address?address=${encodeURIComponent(debouncedAddress)}`);

      // Handle non-registered identifiers
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Resolution request failed");

      const data: ResolutionResponse = await res.json();
      
      // Mapping API response to internal naming
      return data.username || null;
    },
    enabled: isValidAddress && !!debouncedAddress,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  return {
    resolvedName: query.data ?? null,
    isResolving: query.isLoading && isValidAddress,
    isError: query.isError,
  };
}