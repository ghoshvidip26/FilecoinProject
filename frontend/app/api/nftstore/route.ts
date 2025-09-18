import { NFTStorage, File } from "nft.storage";
import fs from "fs";

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_API_KEY || "";
console.log("NFT_STORAGE_KEY:", NFT_STORAGE_KEY);

export async function POST(req: Request) {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const metadata = await client.store({
    name: "My first NFT",
    description: "This is my first NFT",
    image: new File(
      [new Uint8Array(await fs.promises.readFile("assets/Gemini.png"))],
      "Gemini.png",
      { type: "image/png" }
    ),
  });
  console.log("Metadata stored on Filecoin and IPFS with URL:", metadata.url);
  return new Response(JSON.stringify({ url: metadata.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
