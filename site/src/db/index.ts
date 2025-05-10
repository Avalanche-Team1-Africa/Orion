import { Errors, MyError } from "@/constants/errors";
import {
  // STOCK_PRICES_COLLECTIONS,
  STOCK_PRICES_V2_COLLECTION,
  STOCK_PURCHASES_COLLECTION,
  // STOCKPRICES,
  STOCKPRICESV2,
  STOCKPURCHASES,
  STOCKS,
  STOCKS_COLLECTION,
  USER_STOCKS_COLLECTION,
  USERSTOCKS,
} from "./collections";
import { ObjectId } from "mongodb";
import { PaymentStatus } from "@/constants/status";

interface GetStocks {
  id: string;
  name: string;
  tokenID: string;
  symbol: string;
  chain: string;
}

export interface GetStocksArgs {
  chain?: string,
  symbol?: string
}

interface UpdateStockAmount {
  user_address: string;
  stock_symbol: string;
  stock_name: string;
  number_stock: number;
  operation: "buy" | "sell";
  tokenId: string;
}

interface USERSTOCKSWITHID extends USERSTOCKS {
  _id: ObjectId;
}

interface STOCKPURCHASESWITHID extends STOCKPURCHASES {
  _id: ObjectId;
}

interface StockPrices {
  symbol: string;
  price: number;
  change: number;
}

export class MyDatabase {
  async createStockInDB(args: STOCKS) {
    try {
      await STOCKS_COLLECTION.insertOne(args);
    } catch (err) {
      console.log("Error creating stock", err);
      throw new MyError(Errors.NOT_CREATE_STOCK_DB);
    }
  }
  async checkIfStockExists(symbol: string, chain: string): Promise<string | null> {
    try {
      const stock = await STOCKS_COLLECTION.findOne({ symbol, chain });
      if (stock) {
        return stock.tokenID;
      } else {
        return null;
      }
    } catch (err) {
      console.log("Error checking if stock exists", err);
      throw new MyError("Error checking if stock exists");
    }
  }

  async getStocks(): Promise<GetStocks[]> {
    try {
      const stocks: GetStocks[] = [];
      const cursor = STOCKS_COLLECTION.find(
        {},
        { projection: { id: 1, name: 1, symbol: 1, tokenID: 1, chain: 1 } },
      );
      for await (const doc of cursor) {
        stocks.push({
          id: doc._id.toString(),
          name: doc.name,
          tokenID: doc.tokenID,
          symbol: doc.symbol,
          chain: doc.chain
        });
      }
      return stocks;
    } catch (err) {
      console.log("Error getting stocks from DB", err);
      throw new MyError(Errors.NOT_GET_STOCKS_DB);
    }
  }

  async getStockPricesFromDB(): Promise<StockPrices[]> {
    try {
      const stocks: StockPrices[] = [];
      const cursor = STOCK_PRICES_V2_COLLECTION.find()
        .sort({ time: -1 })
        .limit(1);
      for await (const doc of cursor) {
        for (const stock of doc.details) {
          stocks.push(stock);
        }
      }

      return stocks;
    } catch (err) {
      console.log("Error getting stock prices from db", err);
      throw new MyError(Errors.NOT_GET_STOCK_PRICES_DB);
    }
  }

  async updateStockPricesInDB(args: STOCKPRICESV2) {
    try {
      // Insert new records
      await STOCK_PRICES_V2_COLLECTION.insertOne(args);
    } catch (err) {
      console.log("Could not update stock prices in db", err);
      throw new MyError(Errors.NOT_UPDATE_STOCK_PRICES_DB);
    }
  }

  async storeStockPurchase(args: STOCKPURCHASES) {
    try {
      await STOCK_PURCHASES_COLLECTION.insertOne(args);
    } catch (err) {
      console.log("Could not store stock purchase", err);
      throw new MyError(Errors.NOT_STORE_STOCK_PURCHASE_DB);
    }
  }

  private async _userHasStockOwnRecord(
    user_address: string,
  ): Promise<USERSTOCKSWITHID | null> {
    try {
      const document = await USER_STOCKS_COLLECTION.findOne({
        user_address: user_address,
      });
      if (document) {
        return document;
      } else {
        return null;
      }
    } catch (err) {
      console.log(err);
      throw new MyError(Errors.NOT_CHECK_USER_STOCKS_DB);
    }
  }

  private async _createNewUserStockRecord(args: UpdateStockAmount) {
    try {
      await USER_STOCKS_COLLECTION.insertOne({
        user_address: args.user_address,
        stocks: [
          {
            symbol: args.stock_symbol,
            name: args.stock_name,
            number_stocks: args.number_stock,
            tokenId: args.tokenId,
          },
        ],
      });
    } catch (err) {
      console.log(err);
      throw new MyError(Errors.NOT_CREATE_NEW_USER_STOCKS_DB);
    }
  }

  private async _replaceUserStocksRecord(args: USERSTOCKSWITHID) {
    try {
      await USER_STOCKS_COLLECTION.replaceOne({ _id: args._id }, args);
    } catch (err) {
      console.log("Could not replace document", err);
      throw new MyError(Errors.NOT_REPLACE_USER_STOCK);
    }
  }

  async updateNumberStocksOwnedByUser(args: UpdateStockAmount) {
    try {
      // Check if user already has a record
      const userRecord = await this._userHasStockOwnRecord(args.user_address);

      // If so update users record
      if (userRecord) {
        // Check if user has record of the stock
        let doesUserOwnStock = false;
        let stockIndex = 0;
        while (stockIndex < userRecord.stocks.length) {
          if (userRecord.stocks[stockIndex].symbol === args.stock_symbol) {
            doesUserOwnStock = true;
            break;
          }
          stockIndex++;
        }

        // If user owns update the value
        if (doesUserOwnStock) {
          // If buy increment
          if (args.operation == "buy") {
            userRecord.stocks[stockIndex].number_stocks += args.number_stock;
          } else {
            // Minus but make sure its positive
            if (
              userRecord.stocks[stockIndex].number_stocks < args.number_stock
            ) {
              throw new MyError(Errors.CANNOT_SELL_MORE_THAN_OWNED);
            } else {
              userRecord.stocks[stockIndex].number_stocks -= args.number_stock;
            }
          }
        } else {
          // Create new value
          if (args.operation === "buy") {
            userRecord.stocks.push({
              symbol: args.stock_symbol,
              name: args.stock_name,
              number_stocks: args.number_stock,
              tokenId: args.tokenId,
            });
          } else {
            // Throw error cause cannot create new sell record
            throw new MyError(Errors.NOT_CREATE_NEW_STOCK_RECORD_SELL);
          }
        }

        // Update db
        await this._replaceUserStocksRecord(userRecord);
      }
      // Otherwise create new record
      else {
        if (args.operation == "buy") {
          await this._createNewUserStockRecord(args);
        } else {
          throw new MyError(Errors.NOT_CREATE_NEW_RECORD_SELL);
        }
      }
    } catch (err) {
      console.log("Error updating record", err);
      if (err instanceof MyError) {
        if (
          err.message === Errors.NOT_CREATE_NEW_RECORD_SELL ||
          err.message === Errors.NOT_CREATE_NEW_STOCK_RECORD_SELL ||
          err.message === Errors.CANNOT_SELL_MORE_THAN_OWNED
        ) {
          throw err;
        } else {
          throw new MyError(Errors.UNKNOWN);
        }
      }

      throw new MyError(Errors.UNKNOWN);
    }
  }

  async getStocksOwnedByUser(user_address: string): Promise<USERSTOCKS | null> {
    try {
      const stocks = await USER_STOCKS_COLLECTION.findOne({ user_address });
      return stocks;
    } catch (err) {
      console.log("Error getting stocks owned by user", err);
      throw new MyError(Errors.NOT_GET_USER_STOCKS);
    }
  }

  async getStockPurchases(
    user_address: string,
    status: PaymentStatus,
  ): Promise<STOCKPURCHASES[]> {
    try {
      const stockPurchases: STOCKPURCHASES[] = [];
      const cursor = STOCK_PURCHASES_COLLECTION.find({
        user_wallet: user_address,
        status,
      }).sort({ purchase_date: 1 });

      for await (const doc of cursor) {
        stockPurchases.push(doc);
      }

      return stockPurchases;
    } catch (err) {
      console.log("Error getting stock purchases", err);
      throw new MyError(Errors.NOT_GET_USER_TRANSACTIONS);
    }
  }

  async updateSalePurchaseStatus(id: ObjectId, status: PaymentStatus) {
    try {
      await STOCK_PURCHASES_COLLECTION.updateOne(
        { _id: id },
        { $set: { status } },
      );
    } catch (err) {
      console.log("Error upeating stock purchase status", err);
      throw new MyError(Errors.NOT_UPDATE_PURCHASE_STATUS_DB);
    }
  }

  async getRequestFromID(
    mpesa_id: string,
  ): Promise<STOCKPURCHASESWITHID | null> {
    try {
      const doc = await STOCK_PURCHASES_COLLECTION.findOne({
        mpesa_request_id: mpesa_id,
      });
      return doc ?? null;
    } catch (err) {
      console.log("Could not get purchase from mpesa id", mpesa_id, err);
      throw new MyError(Errors.NOT_GET_MPESA_PAYMENT);
    }
  }

  async getTokenDetails(symbol: string): Promise<STOCKS | null> {
    try {
      const doc = await STOCKS_COLLECTION.findOne({ symbol });
      return doc ?? null;
    } catch (err) {
      console.log("Could not get token details of", symbol, err);
      throw new MyError(Errors.NOT_GET_STOCK_DB);
    }
  }

  async updateStockPurchaseStatus(paystack_id: string, status: PaymentStatus) {
    try {
      console.log(paystack_id, status);
      await STOCK_PURCHASES_COLLECTION.updateOne(
        { paystack_id: paystack_id },
        { $set: { status } },
      );
    } catch (err) {
      console.log("Could not update stock purchase status", err);
      throw new MyError(Errors.NOT_UPDATE_PURCHASE_STATUS_DB);
    }
  }
}

const database = new MyDatabase();
export default database;

// (async () => {
//   const tokens: STOCKS[] = [
//     {
//       tokenID: "0",
//       "symbol": "SCOM",
//       "name": "Safaricom Plc",
//       totalShares: 9457500,
//       chain: Chains.AVALANCHE,
//     },
//     {
//       tokenID: "1",
//       "symbol": "EQTY",
//       "name": "Equity Group Holdings Limited",
//       totalShares: 1087700,
//       chain: Chains.AVALANCHE,
//     },
//     {
//       tokenID: "2",
//       chain: Chains.AVALANCHE,
//       "symbol": "EABL",
//       totalShares: 64300,
//       "name": "East African Breweries Limited",
//     },
//     {
//       tokenID: "3",
//       "symbol": "KCB",
//       totalShares: 497200,
//       chain: Chains.AVALANCHE,
//       "name": "KCB Group",
//     },
//     {
//       tokenID: "4",
//       totalShares: 17200,
//       chain: Chains.AVALANCHE,
//       "symbol": "SCBK",
//       "name": "Standard Chartered Bank Limited",
//     },
//     {
//       tokenID: "5",
//       "symbol": "ABSA",
//       totalShares: 248200,
//       "name": "Absa Bank Kenya Plc",
//       chain: Chains.AVALANCHE
//     },
//     {
//       tokenID: "6",
//       chain: Chains.AVALANCHE,
//       "symbol": "COOP",
//       totalShares: 261300,
//       "name": "Co-operative Bank of Kenya Limited",
//     },
//     {
//       tokenID: "7",
//       totalShares: 163800,
//       chain: Chains.AVALANCHE,
//       "symbol": "NCBA",
//       "name": "NCBA Group Plc",
//     },
//     {
//       tokenID: "8",
//       "symbol": "SBIC",
//       "name": "Stanbic Holdings Limited",
//       totalShares: 9500,
//       chain: Chains.AVALANCHE,
//     },
//     {
//       tokenID: "9",
//       "symbol": "IMH",
//       totalShares: 165100,
//       chain: Chains.AVALANCHE,
//       "name": "I&M Holdings Plc",
//     },
//     {
//       tokenID: "10",
//       "symbol": "BAT",
//       totalShares: 700,
//       chain: Chains.AVALANCHE,
//       "name": "British American Tobacco Kenya",
//     },
//     {
//       tokenID: "11",
//       "symbol": "KEGN",
//       totalShares: 1694600,
//       chain: Chains.AVALANCHE,
//       "name": "KenGen Plc",
//     },
//     {
//       tokenID: "12",
//       "symbol": "BKG",
//       totalShares: 52900,
//       chain: Chains.AVALANCHE,
//       "name": "BK Group Plc",
//     },
//     {
//       tokenID: "13",
//       "symbol": "KQ",
//       totalShares: 230400,
//       chain: Chains.AVALANCHE,
//       "name": "Kenya Airways Limited",
//     },
//     {
//       tokenID: "14",
//       chain: Chains.AVALANCHE,
//       totalShares: 93400,
//       "symbol": "UMME",
//       "name": "Umeme Limited",
//     },
//     {
//       tokenID: "15",
//       chain: Chains.AVALANCHE,
//       "symbol": "DTK",
//       totalShares: 3500,
//       "name": "Diamond Trust Bank Kenya Limited",
//     },
//     {
//       tokenID: "16",
//       "symbol": "BAMB",
//       totalShares: 248200,
//       chain: Chains.AVALANCHE,
//       "name": "Bamburi Cement Limited",
//     },
//     {
//       tokenID: "17",
//       chain: Chains.AVALANCHE,
//       "symbol": "BRIT",
//       totalShares: 405900,
//       "name": "Britam Holdings Limited",
//     },
//     {
//       tokenID: "18",
//       "symbol": "JUB",
//       totalShares: 7600,
//       chain: Chains.AVALANCHE,
//       "name": "Jubilee Holdings Limited",
//     },
//     {
//       tokenID: "19",
//       totalShares: 3700,
//       chain: Chains.AVALANCHE,
//       "symbol": "TOTL",
//       "name": "Total Kenya Limited",
//     },
//     {
//       tokenID: "20",
//       "symbol": "KPLC",
//       totalShares: 921600,
//       chain: Chains.AVALANCHE,
//       "name": "Kenya Power & Lighting Company",
//     },
//     {
//       tokenID: "21",
//       "symbol": "KNRE",
//       totalShares: 13777900,
//       chain: Chains.AVALANCHE,
//       "name": "Kenya Re-Insurance Corporation Ltd",
//     },
//     {
//       tokenID: "22",
//       "symbol": "KUKZ",
//       totalShares: 7600,
//       chain: Chains.AVALANCHE,
//       "name": "Kakuzi Limited",
//     },
//     {
//       tokenID: "23",
//       chain: Chains.AVALANCHE,
//       "symbol": "CIC",
//       totalShares: 68200,
//       "name": "CIC Insurance Group Limited",
//     },
//     {
//       tokenID: "24",
//       chain: Chains.AVALANCHE,
//       "symbol": "CTUM",
//       totalShares: 4900,
//       "name": "Centum Investment Company",
//     },
//     {
//       tokenID: "25",
//       totalShares: 19600,
//       chain: Chains.AVALANCHE,
//       "symbol": "LBTY",
//       "name": "Liberty Kenya Holdings Limited",
//     },
//     {
//       tokenID: "26",
//       chain: Chains.AVALANCHE,
//       "symbol": "CARB",
//       totalShares: 49400,
//       "name": "Carbacid Investments Limited",
//     },
//     {
//       tokenID: "27",
//       chain: Chains.AVALANCHE,
//       "symbol": "CRWN",
//       totalShares: 248200,
//       "name": "Crown Paints Kenya Limited",
//     },
//     {
//       tokenID: "28",
//       totalShares: 300,
//       chain: Chains.AVALANCHE,
//       "symbol": "TPSE",
//       "name": "TPS Eastern Africa Serena Limited",
//     },
//     {
//       tokenID: "29",
//       "symbol": "WTK",
//       totalShares: 10300,
//       chain: Chains.AVALANCHE,
//       "name": "Williamson Tea Kenya Limited",
//     },
//     {
//       tokenID: "30",
//       chain: Chains.AVALANCHE,
//       totalShares: 1700,
//       "symbol": "SASN",
//       "name": "Sasini Tea and Coffee Limited",
//     },
//     {
//       tokenID: "31",
//       "symbol": "PORT",
//       totalShares: 800,
//       chain: Chains.AVALANCHE,
//       "name": "East African Portland Cement Co. Ltd",
//     },
//     {
//       tokenID: "32",
//       totalShares: 12400,
//       chain: Chains.AVALANCHE,
//       "symbol": "NBV",
//       "name": "Nairobi Business Ventures Ltd",
//     },
//     {
//       tokenID: "33",
//       "symbol": "HFCK",
//       totalShares: 23300,
//       chain: Chains.AVALANCHE,
//       "name": "HF Group Limited",
//     },
//     {
//       tokenID: "34",
//       "symbol": "NMG",
//       totalShares: 12800,
//       chain: Chains.AVALANCHE,
//       "name": "Nation Media Group",
//     },
//     {
//       tokenID: "35",
//       "symbol": "NSE",
//       totalShares: 305700,
//       chain: Chains.AVALANCHE,
//       "name": "Nairobi Securities Exchange Limited",
//     },
//     {
//       tokenID: "36",
//       chain: Chains.AVALANCHE,
//       "symbol": "UNGA",
//       totalShares: 200,
//       "name": "Unga Group Limited",
//     },
//     {
//       tokenID: "37",
//       "symbol": "KAPC",
//       totalShares: 165100,
//       chain: Chains.AVALANCHE,
//       "name": "Kapchorua Tea Company Limited",
//     },
//     {
//       tokenID: "38",
//       chain: Chains.AVALANCHE,
//       "symbol": "CGEN",
//       totalShares: 12500,
//       "name": "Car and General Kenya Limited",
//     },
//     {
//       tokenID: "39",
//       "symbol": "BOC",
//       chain: Chains.AVALANCHE,
//       totalShares: 200,
//       "name": "BOC Kenya Limited",
//     },
//     {
//       tokenID: "40",
//       chain: Chains.AVALANCHE,
//       totalShares: 122800,
//       "symbol": "TCL",
//       "name": "Trans Century Limited",
//     },
//     {
//       tokenID: "41",
//       chain: Chains.AVALANCHE,
//       "symbol": "SLAM",
//       "name": "Sanlam Kenya Plc",
//       totalShares: 4200,
//     },
//     {
//       tokenID: "42",
//       chain: Chains.AVALANCHE,
//       "symbol": "SCAN",
//       "name": "ScanGroup Limited",
//       totalShares: 1100,
//     },
//     {
//       tokenID: "43",
//       chain: Chains.AVALANCHE,
//       totalShares: 500,
//       "symbol": "SMER",
//       "name": "Sameer Africa Plc",
//     },
//     {
//       tokenID: "44",
//       totalShares: 7500,
//       chain: Chains.AVALANCHE,
//       "symbol": "LIMT",
//       "name": "Limuru Tea Company Limited",
//     },
//     {
//       tokenID: "45",
//       totalShares: 5200,
//       chain: Chains.AVALANCHE,
//       "symbol": "LKL",
//       "name": "Longhorn Publishers Limited",
//     },
//     {
//       tokenID: "46",
//       chain: Chains.AVALANCHE,
//       "symbol": "AMAC",
//       "name": "Africa Mega Agricorp",
//       totalShares: 248200,
//     },
//     {
//       tokenID: "47",
//       "symbol": "CABL",
//       totalShares: 87600,
//       chain: Chains.AVALANCHE,
//       "name": "East African Cables Limited",
//     },
//     {
//       tokenID: "48",
//       chain: Chains.AVALANCHE,
//       "symbol": "SGL",
//       "name": "Standard Group Limited",
//       totalShares: 100,
//     },
//     {
//       tokenID: "49",
//       totalShares: 2100,
//       chain: Chains.AVALANCHE,
//       "symbol": "EGAD",
//       "name": "Eaagads Limited",
//     },
//     {
//       tokenID: "50",
//       "symbol": "HAFR",
//       totalShares: 38700,
//       chain: Chains.AVALANCHE,
//       "name": "Home Afrika Limited",
//     },
//     {
//       tokenID: "51",
//       "symbol": "EVRD",
//       totalShares: 8300,
//       chain: Chains.AVALANCHE,
//       "name": "Eveready East Africa Limited",
//     },
//     {
//       tokenID: "52",
//       chain: Chains.AVALANCHE,
//       "symbol": "FTGH",
//       totalShares: 23900,
//       "name": "Flame Tree Group Holdings Limited",
//     },
//     {
//       tokenID: "53",
//       "symbol": "XPRS",
//       totalShares: 5000,
//       chain: Chains.AVALANCHE,
//       "name": "Express Kenya Limited",
//     },
//     {
//       tokenID: "54",
//       totalShares: 157200,
//       chain: Chains.AVALANCHE,
//       "symbol": "UCHM",
//       "name": "Uchumi Supermarket Limited",
//     },
//     {
//       tokenID: "55",
//       chain: Chains.AVALANCHE,
//       "symbol": "OCH",
//       totalShares: 13600,
//       "name": "Olympia Capital Holdings Limited",
//     },
//     {
//       tokenID: "56",
//       chain: Chains.AVALANCHE,
//       totalShares: 7600,
//       "symbol": "KURV",
//       "name": "Kurwitu Ventures Limited",
//     },
//     {
//       tokenID: "57",
//       "symbol": "GLD",
//       totalShares: 248200,
//       chain: Chains.AVALANCHE,
//       "name": "Absa NewGold ETF",
//     }
//   ];  

//   for (const t of tokens) {
//     await database.createStockInDB(t);
//     console.log("done", t);
//   }
//   process.exit(0);
// })();