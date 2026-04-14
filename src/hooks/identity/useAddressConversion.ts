import { useState, useCallback } from 'react'

export function useAddressConversion() {
    const [isConverting, setIsConverting] = useState(false)

    const convertAddress = async (address: string, targetFormat: 'evm' | 'initia'): Promise<string> => {
        setIsConverting(true)
        try {
            const response = await fetch('/api/convert-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, targetFormat }),
            })
            
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            
            return data.convertedAddress
        } catch (error) {
            console.error("Conversion hook error:", error)
            throw error
        } finally {
            setIsConverting(false)
        }
    }

    const toEvm = useCallback((initiaAddress: string) => {
        return convertAddress(initiaAddress, 'evm')
    }, [])

    const toInitia = useCallback((evmAddress: string) => {
        return convertAddress(evmAddress, 'initia')
    }, [])

    return { toEvm, toInitia, isConverting }
}