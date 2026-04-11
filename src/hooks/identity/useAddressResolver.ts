import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { flowLog } from "@/lib/utils";

export function useAddressResolver(address: string) {
  const [debouncedAddress, setDebouncedAddress] = useState(address);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(address);
    }, 500);
    return () => clearTimeout(timer);
  }, [address]);

  // Standard EVM address check
  const isValidAddress = debouncedAddress?.startsWith("0x") && debouncedAddress?.length === 42;

  const query = useQuery({
    queryKey: ["resolve-address", debouncedAddress],
    queryFn: async () => {
      if (!isValidAddress) return null;

      const res = await fetch(`/api/resolve-address?address=${encodeURIComponent(debouncedAddress)}`);

      // Handle cases where address isn't registered
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Resolution failed");

      const data = await res.json();

      // flowLog("Data received:", data);
      // Returns the name (e.g., "larry.init") or null
      return data.address as string | null;
    },
    enabled: isValidAddress && !!debouncedAddress,
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });

  return {
    resolvedName: query.data ?? null,
    isResolving: query.isLoading && isValidAddress,
    isError: query.isError,
  };
}