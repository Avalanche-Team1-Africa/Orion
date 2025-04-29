"use server"

import { Errors, MyError } from "@/constants/errors";
import { PaymentStatus } from "@/constants/status";
import smartContract from "@/contract";
import database from "@/db";
import "../../../envConfig";
import updateUserStockHoldings from "../stocks/update_stock_holdings";

export default async function markRequestAsPaid(mpesa_id: string) {
    try {
        // Get payment request with id
        const request = await database.getRequestFromID(mpesa_id);
        if (request) {
            // Update payment status
            await database.updateSalePurchaseStatus(request._id, PaymentStatus.PAID);

            // Get token id
            const stock = await database.getTokenDetails(request.stock_symbol);
            if (!stock) {
                console.log("No stock exists with symbol", request.stock_symbol);
                throw new MyError(Errors.STOCK_NOT_EXIST);
            }

            // Move coins to user
            await smartContract.buyStock({
                tokenId: stock.tokenID,
                userWalletAddress: request.user_wallet,
                amount: request.amount_shares
            });

            // Update stock holdings
            await updateUserStockHoldings({
                tokenId: stock.tokenID,
                stock_symbol: request.stock_symbol,
                stock_name: request.name,
                number_stock: request.amount_shares,
                user_address: request.user_wallet,
                operation: "buy",
            });
        } else {
            console.log("Payment with that mpesa id does not exist", mpesa_id);
        }
    } catch (err) {
        console.log("Could not mark request as paid");
        if (err instanceof MyError) {
            throw err;
        }

        throw new MyError(Errors.UNKNOWN);
    }
}