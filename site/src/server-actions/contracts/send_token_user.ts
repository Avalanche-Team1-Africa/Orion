"use server"

import { Errors, MyError } from "@/constants/errors";
import smartContract from "@/contract";
import { BuyTokenArgs } from "@/types/stocks";

export default async function sendTokensToUser(args: BuyTokenArgs) {
    try {
        await smartContract.buyStock(args);
    } catch(err) {
        console.log("Error sending tokens to user", err);
        throw new MyError(Errors.NOT_SEND_TOKENS_USER);
    }
}