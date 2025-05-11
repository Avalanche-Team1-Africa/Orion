"use server"
import { loadLucid } from "@/cardano/serializer"
export async function transferADA(amount: number, address: string) {
    const BLOCKFROST_API = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREPROD
    const OWNER_KEY = process.env.OWNER_KEY
    if (!BLOCKFROST_API || !OWNER_KEY) {
        throw new Error("Missing environment variables")
    }
    const lucid = await loadLucid(OWNER_KEY, BLOCKFROST_API)
    const tx = await lucid
        .newTx()
        .payToAddress(address, { ["lovelace"]: BigInt(Math.floor(amount * 1_000_000)) })
        .complete();
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    return txHash;

}
