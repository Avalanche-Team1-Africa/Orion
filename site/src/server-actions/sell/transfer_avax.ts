"use server"

import { MyError } from "@/constants/errors";
import smartContract from "@/contract";

export default async function transferAVAX(args: {address: string, amount: number}) {
    try {
        await smartContract.transferAVAX({userAddress: args.address, amount: args.amount});
    } catch(err) {
        console.error("Error transfering AVAX", err);
        throw new MyError("Could not transfer AVAX");
    }
}