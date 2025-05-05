import { mintAsset } from "@/cardano/serializer";
import { TokenSchema } from "@/types/token";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TokenSchema.safeParse(body);
    if (!parsed.success) throw new Error("Invalid data");
    const { assetName, supply } = parsed.data;
    const tokenId = await mintAsset(assetName, supply);
    //linting fix
    console.log("token id=>", tokenId);
    //save tokenId to database
    return Response.json({ message: "Token minted" }, { status: 200 });
  } catch {
    return Response.json({ message: "Error minting token" }, { status: 500 });
  }
}
