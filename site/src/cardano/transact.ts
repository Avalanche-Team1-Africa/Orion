import { loadLucid } from "./serializer";
import { sendTokenSchema } from "@/types/token";
class Transact {
    static SEED = process.env.MINTER_SEED;
    static BLOCKFROST_APIKEY = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREPROD;

    static async initialize() {
        if (!Transact.SEED || !Transact.BLOCKFROST_APIKEY) {
            throw new Error("Environment variables MINTER_SEED or BLOCKFROST_APIKEY are not set.");
        }
        const lucid = await loadLucid(Transact.SEED, Transact.BLOCKFROST_APIKEY);
        if (!lucid) {
            throw new Error("Failed to initialize Lucid");
        }
        return lucid;
    }
    async sendToken(data: { tokenId: string, amount: number, receiverAddress: string }) {
        try {
            const parsed = sendTokenSchema.safeParse(data)
            if (!parsed.success) {
                throw new Error("Invalid data while sending a token");
            }
            const args = parsed.data;
            const lucid = await Transact.initialize();
            const tx = await lucid
                .newTx()
                .payToAddress(args.receiverAddress, { [args.tokenId]: BigInt(args.amount), lovelace: BigInt(1000000) })
                .complete();
            const signedTx = await tx.sign().complete();
            const txHash = await signedTx.submit();
            return txHash;
        } catch (error) {
            console.error("Error sending token", error);
            throw error;
        }
    }
}
export const transact = new Transact();
