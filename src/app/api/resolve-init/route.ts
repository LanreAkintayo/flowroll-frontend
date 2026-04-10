import { NextRequest, NextResponse } from "next/server";
// import { moduleAddress, restClient } from "@/lib/interwoven";

import { RESTClient, bcs } from "@initia/initia.js";



 const moduleAddress =
  "0x42cd8467b1c86e59bf319e5664a09b6b5840bb3fac64f5ce690b5041c530565a";

 const restClient = new RESTClient("https://rest.testnet.initia.xyz", {
  gasPrices: "0.015uinit",
  gasAdjustment: "1.5",
});


export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing name param" }, { status: 400 });
  }

  try {
    const result = await restClient.move.view(
      moduleAddress,
      "usernames",
      "get_address_from_name",
      [],
      [bcs.string().serialize(name).toBase64()]
    );

    if (!result.data) {
      return NextResponse.json({ error: "Name not registered" }, { status: 404 });
    }

    const address = JSON.parse(result.data);
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "Name not registered" }, { status: 404 });
  }
}