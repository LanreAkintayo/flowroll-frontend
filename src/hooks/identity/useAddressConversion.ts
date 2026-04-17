import { useState, useCallback } from 'react';

interface ConversionResponse {
    convertedAddress: string;
    error?: string;
}

export function useAddressConversion() {
    const [isConverting, setIsConverting] = useState(false);

    // Core conversion logic
    const convertAddress = useCallback(async (
        address: string, 
        targetFormat: 'evm' | 'initia'
    ): Promise<string> => {
        setIsConverting(true);
        
        try {
            const response = await fetch('/api/convert-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, targetFormat }),
            });
            
            const data: ConversionResponse = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Address conversion failed');
            }
            
            return data.convertedAddress;
        } catch (error) {
            console.error("Address conversion internal error:", error);
            throw error;
        } finally {
            setIsConverting(false);
        }
    }, []);

    // Explicit format handlers
    const toEvm = useCallback((initiaAddress: string) => {
        return convertAddress(initiaAddress, 'evm');
    }, [convertAddress]);

    const toInitia = useCallback((evmAddress: string) => {
        return convertAddress(evmAddress, 'initia');
    }, [convertAddress]);

    return { toEvm, toInitia, isConverting };
}