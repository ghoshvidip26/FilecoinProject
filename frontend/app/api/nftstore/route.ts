import { File } from "nft.storage";
import lighthouse from "@lighthouse-web3/sdk";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  console.log("Received file:", file);
  console.log("Formdata: ", formData);
  console.log("File Name: ", file.name);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log("File Buffer:", buffer);

  const tempPath = path.join("/tmp", file.name);
  fs.writeFileSync(tempPath, buffer);
  const uploadResponse = await lighthouse.upload(
    tempPath,
    process.env.LIGHTHOUSE_API!
  );
  console.log("Upload Response:", uploadResponse);
  return new Response(
    "File uploaded successfully: " + JSON.stringify(uploadResponse)
  );
}
