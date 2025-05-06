"use server";
import { Errors, MyError } from "@/constants/errors";
import { Chains } from "@/constants/status";
import smartContract from "@/contract";
import database from "@/db";
import { CreateStockTokenArgs } from "@/types/stocks";

export async function createStockOnCardano(args: CreateStockTokenArgs) {
  try {
    //Check if the stock with the symbol exists
    const stockExists = await database.checkIfStockExists(args.symbol, Chains.CARDANO);
    if (stockExists) {
      return;
    }
    
    //Call the function to create the token onchain
    const tokenId = await smartContract.createStockOnCardano({
      assetName: args.name,
      supply: args.totalShares
    });

    //Save the stock token to the database
    await database.createStockInDB({
      tokenID: tokenId,
      symbol: args.symbol,
      name: args.name,
      totalShares: args.totalShares,
      chain: Chains.CARDANO,
    });
  } catch (err) {
    console.log("Error creating stock", err);
    throw new MyError(Errors.NOT_CREATE_STOCK);
  }
}
