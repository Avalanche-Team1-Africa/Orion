"use server";
import { Errors, MyError } from "@/constants/errors";
import smartContract from "@/contract";
import database from "@/db";
import { CreateStockTokenArgs } from "@/types/stocks";

export async function createStock(args: CreateStockTokenArgs) {
  try {
    //Check if the stock with the symbol exists
    const stockExists = await database.checkIfStockExists(args.symbol);
    if (stockExists) {
      return stockExists;
    }
    //Call the function to create the token onchain
    const tokenId = await smartContract.createStock({
      symbol: args.symbol,
      name: args.name,
      totalShares: args.totalShares,
    });
    //Save the stock token to the database
    await database.createStockInDB({
      tokenID: tokenId,
      symbol: args.symbol,
      name: args.name,
      totalShares: args.totalShares,
      todayPrice: args.sharePrice,
    });
  } catch (err) {
    console.log("Error creating stock", err);
    throw new MyError(Errors.NOT_CREATE_STOCK);
  }
}
