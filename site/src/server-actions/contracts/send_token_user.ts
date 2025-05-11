"use server"

import { transact } from "@/cardano/transact";
import { Errors, MyError } from "@/constants/errors";
import smartContract from "@/contract";
import { BuyTokenArgs } from "@/types/stocks";

export async function sendTokensToUserAvalanche(args: BuyTokenArgs) {
    try {
        await smartContract.buyStockAvalanche(args);
    } catch(err) {
        console.log("Error sending tokens to user", err);
        throw new MyError(Errors.NOT_SEND_TOKENS_USER);
    }
}

export async function sendTokensToUserCardano(args:  { tokenId: string, amount: number, receiverAddress: string }) {
    try {
        await transact.sendToken(args);
    } catch(err) {
        console.error("Error sending tokens", err);
        throw new MyError("Could not send tokens to user");
    }
}