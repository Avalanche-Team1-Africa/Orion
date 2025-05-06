import client from "./connection";

const dbName = "orion";
const stocksCollection = "stocks";
const stockPricesCollection = "stockPrices";
const stockPricesCollectionv2 = "stockPricesv2";
const stockPurchases = "stockPurchases";
const userStocks = "userStocks";
const database = client.db(dbName);

// Types
export interface STOCKS {
  symbol: string;
  name: string;
  totalShares: number;
  tokenID: string;
  chain: string;
}

export interface STOCKPRICES {
  symbol: string,
  price: number,
  change: number
}

export interface STOCKPRICESV2 {
  time: Date,
  details: {
    symbol: string,
    price: number,
    change: number
  }[]
}

export interface STOCKPURCHASES {
  mpesa_request_id?: string,
  txHash?: string,
  user_wallet: string,
  stock_symbol: string,
  name: string,
  amount_shares: number,
  buy_price: number,
  purchase_date: Date,
  status: string,
  transaction_type: string,
  paystack_id?: string
}

export interface userstock {
  symbol: string,
  name: string,
  number_stocks: number,
  tokenId: string
}

export interface USERSTOCKS {
  user_address: string,
  stocks: userstock[]
}

// Collections
export const STOCKS_COLLECTION = database.collection<STOCKS>(stocksCollection);
export const STOCK_PRICES_COLLECTIONS = database.collection<STOCKPRICES>(stockPricesCollection);
export const STOCK_PRICES_V2_COLLECTION = database.collection<STOCKPRICESV2>(stockPricesCollectionv2)
export const STOCK_PURCHASES_COLLECTION = database.collection<STOCKPURCHASES>(stockPurchases);
export const USER_STOCKS_COLLECTION = database.collection<USERSTOCKS>(userStocks);
