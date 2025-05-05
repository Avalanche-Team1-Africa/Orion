"use server"

import smartContract from "@/contract";
import "../../../envConfig";
import { Errors, MyError } from "@/constants/errors";
import { convertKESToHBAR } from "../sell/convertKES_HBAR";

export async function transferHbar(args: { userAddress: string, amount: number}) {
    try {
        // Convert KES to HBAR
        const hbarAmount = await convertKESToHBAR(args.amount);
        await smartContract.transferAVAX({userAddress: args.userAddress, amount: Math.ceil(hbarAmount)});
    } catch(err) {
        console.log("Error transfering hbar", err);
        throw new MyError(Errors.NOT_TRANSFER_HBAR);
    } 
}