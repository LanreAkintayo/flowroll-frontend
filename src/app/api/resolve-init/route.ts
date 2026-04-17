import { NextRequest, NextResponse } from "next/server";
import { RESTClient, bcs } from "@initia/initia.js";

// Initia Username Module configuration
const moduleAddress = "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a";

const restClient = new RESTClient("https://rest.testnet.initia.xyz", {
  gasPrices: "0.015uinit",
  gasAdjustment: "1.5",
});

/**
 * Endpoint to resolve an Initia address from a registered username
 */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("name");

  if (!username) {
    return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
  }

  try {
    // Perform a view call to the username registry module
    const result = await restClient.move.view(
      moduleAddress,
      "usernames",
      "get_address_from_name",
      [],
      [bcs.string().serialize(username).toBase64()]
    );

    if (!result.data) {
      return NextResponse.json({ error: "Name not registered" }, { status: 404 });
    }

    // Parse and return the bech32 address
    const resolvedAddress = JSON.parse(result.data);
    return NextResponse.json({ address: resolvedAddress });

  } catch (error) {
    return NextResponse.json({ error: "Resolution failed" }, { status: 404 });
  }
}