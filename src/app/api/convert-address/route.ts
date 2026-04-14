import { NextResponse } from 'next/server'
import { AccAddress } from '@initia/initia.js'

export async function POST(req: Request) {
    try {
        const { address, targetFormat } = await req.json()

        if (!address || !targetFormat) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
        }

        if (targetFormat === 'evm') {
            const hex = AccAddress.toHex(address)
            const evmAddress = hex.startsWith('0x') ? hex : `0x${hex}`
            return NextResponse.json({ convertedAddress: evmAddress })
        } 
        
        if (targetFormat === 'initia') {
            const cleanHex = address.replace('0x', '')
            const initiaAddress = AccAddress.fromHex(cleanHex)
            return NextResponse.json({ convertedAddress: initiaAddress })
        }

        return NextResponse.json({ error: 'Invalid target format' }, { status: 400 })

    } catch (error: any) {
        console.error("Address conversion error:", error)
        return NextResponse.json({ error: 'Conversion failed' }, { status: 500 })
    }
}