import { sendTokenSchema } from "@/types/token";
import { transact } from "@/cardano/transact";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendTokenSchema.safeParse(body);
    if (!parsed.success) throw new Error("Invalid data");
    const { receiverAddress, tokenId, amount } = parsed.data;
    const txHash = await transact.sendToken({
      receiverAddress,
      tokenId,
      amount,
    });
    //linting fix
    console.log(txHash);
    //save txHash to database
    return Response.json(
      { message: "Bought tokens successfully" },
      { status: 200 },
    );
  } catch {
    return Response.json({ message: "Error buying shares" }, { status: 500 });
  }
}
