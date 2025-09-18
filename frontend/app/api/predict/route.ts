import { HttpJsonRpcConnector, LotusClient } from "filecoin.js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log(file);

    const httpConnector = new HttpJsonRpcConnector({
      url: process.env.LOTUS_HTTP_RPC_ENDPOINT || "",
      token: process.env.LOTUS_AUTH_TOKEN,
    });

    const lotusClient = new LotusClient(httpConnector);
    const version = await lotusClient.common.version();
    console.log("Lotus Node version: ", version);
    await lotusClient.client.import({
      Path: "/path/to/file",
      IsCAR: false,
    });
    await lotusClient.client.startDeal({
      Data: {
        TransferType: "graphsync",
        Root: {
          "/": "bafyreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
        },
      },
      Wallet: "",
      Miner: "",
      EpochPrice: "",
      MinBlocksDuration: 0,
    });
    return new Response(JSON.stringify({ version }), { status: 200 });
  } catch (error) {
    console.error("Error fetching Lotus Node version: ", error);
    return NextResponse.json(
      { error: "Failed to fetch Lotus Node version" },
      { status: 500 }
    );
  }
}
