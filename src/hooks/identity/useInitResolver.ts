import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { flowLog } from "@/lib/utils";
import { RESTClient, bcs } from "@initia/initia.js";



 const moduleAddress =
  "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a";

 const restClient = new RESTClient("https://rest.testnet.initia.xyz", {
  gasPrices: "0.015uinit",
  gasAdjustment: "1.5",
});

export function useInitResolver(input: string) {
  const [debouncedInput, setDebouncedInput] = useState(input);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);

  const isValidInitName = debouncedInput.toLowerCase().endsWith(".init");

  const query = useQuery({
    queryKey: ["resolve-init", debouncedInput],
    queryFn: async () => {
      if (!isValidInitName) return null;

      const nameWithoutSuffix = debouncedInput.replace(/\.init$/, "");

      const res = await fetch(`/api/resolve-init?name=${encodeURIComponent(nameWithoutSuffix)}`);

      flowLog("Resolving name:", debouncedInput, "with API response status:", res.status); 

      if (!res.ok) throw new Error("Name not registered");

      const data = await res.json();
      return data.address as string;
    },
    enabled: isValidInitName,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    resolvedAddress: query.data as string | null,
    isResolving: query.isLoading && isValidInitName,
    isError: query.isError,
  };
}