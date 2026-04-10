import { NextRequest, NextResponse } from "next/server";
// import { moduleAddress, restClient } from "@/lib/interwoven";
import { convertEvmToInitia, flowLog } from "@/lib/utils";
import { RESTClient, bcs } from "@initia/initia.js";



const moduleAddress =
    "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a";

const restClient = new RESTClient("https://rest.testnet.initia.xyz", {
    gasPrices: "0.015uinit",
    gasAdjustment: "1.5",
});


export async function GET(req: NextRequest) {
    const address = req.nextUrl.searchParams.get("address");

    flowLog("Inside api call : ", address)

    if (!address) return NextResponse.json({ error: "No address" }, { status: 400 });

    const initiaAddress = convertEvmToInitia(address);

    flowLog("Initia address: ", initiaAddress)

    try {
        const result = await restClient.move.view(
            moduleAddress,
            "usernames",
            "get_name_from_address",
            [],
            [bcs.address().serialize(initiaAddress).toBase64()]
        );

        flowLog("Result: ", result)

        if (!result.data) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        const address = JSON.parse(result.data);
        return NextResponse.json({ address });
    } catch {
        return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }
}