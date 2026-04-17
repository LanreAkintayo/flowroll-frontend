import { NextRequest, NextResponse } from "next/server";
import { convertEvmToInitia } from "@/lib/utils";
import { RESTClient, bcs } from "@initia/initia.js";

// Initia Username Module configuration
const moduleAddress = "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a";

const restClient = new RESTClient("https://rest.testnet.initia.xyz", {
    gasPrices: "0.015uinit",
    gasAdjustment: "1.5",
});

/**
 * Endpoint to resolve an Initia username from an EVM address
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const evmAddress = searchParams.get("address");

    if (!evmAddress) {
        return NextResponse.json({ error: "No address provided" }, { status: 400 });
    }

    // Convert address to bech32 for Initia RPC compatibility
    const initiaAddress = convertEvmToInitia(evmAddress);

    try {
        const result = await restClient.move.view(
            moduleAddress,
            "usernames",
            "get_name_from_address",
            [],
            [bcs.address().serialize(initiaAddress).toBase64()]
        );

        if (!result.data) {
            return NextResponse.json({ error: "Username not found" }, { status: 404 });
        }

        const resolvedName = JSON.parse(result.data);
        return NextResponse.json({ name: resolvedName });
    } catch (error) {
        return NextResponse.json({ error: "Resolution failed" }, { status: 404 });
    }
}