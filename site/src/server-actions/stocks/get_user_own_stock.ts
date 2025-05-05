"use server";

import { Errors, MyError } from "@/constants/errors";
import database from "@/db";
import "../../../envConfig";
import axios from "axios";

export async function getIfUserHasOwnedStock(
  address: string,
  tokenID: string,
): Promise<boolean> {
  try {
    // Try checking from hedera
    const associated = await checkHederaForTokenAssociation(address, tokenID);
    return associated;
  } catch (err) {
    console.log("Error", err);
    // If that fails fallback to db
    try {
      // Get stocks owned by user
      const stocks = await database.getStocksOwnedByUser(address);

      if (!stocks || !stocks.stocks) {
        return false;
      }

      for (const s of stocks.stocks) {
        if (s.tokenId === tokenID) {
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error(err);
      console.log("Error getting if user owned stock");
      throw new MyError(Errors.NOT_GET_USER_OWN_STOCK);
    }
  }
}

async function checkHederaForTokenAssociation(account_id: string, token_id: string): Promise<boolean> {
  try {
    const res = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${account_id}`);
    if (res.status === 200) {
      const data = res.data;
      if (data?.balance?.tokens) {
        const tokens = data.balance.tokens;
        for (const t of tokens) {
          if (t.token_id === token_id) {
            return true;
          }
        }

        return false
      } else {
        console.log("Response has no list of tokens");
        throw new MyError(Errors.NOT_GET_ASSOCIATION_HEDERA);
      }
    } else {
      throw new MyError(Errors.NOT_GET_ASSOCIATION_HEDERA);
    }
  } catch (err) {
    console.log("Error checking token balance from hedera", err);
    throw new MyError(Errors.NOT_GET_ASSOCIATION_HEDERA);
  }
}