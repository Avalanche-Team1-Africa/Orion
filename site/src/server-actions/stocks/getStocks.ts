"use server";

import { Errors, MyError } from "@/constants/errors";
import database from "@/db";
import axios from "axios";
import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import { StockData } from "@/types";
import { STOCKPRICES } from "@/db/collections";
// list of user agent strings to rotate
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  // ...
];
export async function getStocks(): Promise<StockData[]> {
  try {
    // Get stocks listed in database
    // const stocks: StockData[] = [];
    // const dbStocks = await database.getStocks();

    // const stockPrices = await getStockPrices();
    //fetch from the db and scrape in parallel
    const [dbStocks, stockPrices] = await Promise.all([
      database.getStocks().catch((err) => {
        console.error("DB error:", err);
        return [];
      }),
      getStockPricesWithCache(),
    ]);
    // Get price and change of each
    return dbStocks.map((s) => {
      const entry = stockPrices.find((sy) => sy.symbol === s.symbol);

      // stocks.push({
      //   id: s.id,
      //   symbol: s.symbol,
      //   name: s.name,
      //   price: entry?.price ?? 0.0,
      //   change: entry?.change ?? 0.0,
      // });
      return {
        id: s.id,
        symbol: s.symbol,
        name: s.name,
        price: entry?.price ?? 0.0,
        change: entry?.change ?? 0.0,
        tokenID: s.tokenID,
        chain: s.chain
      };
    });
    // return stocks;
  } catch (err) {
    console.error("Error getting stock data", err);
    throw new MyError(Errors.NOT_GET_STOCKS);
  }
}
//Function to get stock by symbol. uses getstocks fun
export async function getStockBySymbol(symbol: string): Promise<StockData | undefined> {
  const allStocks = await getStocks(); // Reuse existing logic
  return allStocks.find((a) => a.symbol === symbol);
}


const getStockPricesWithCache = unstable_cache(
  async () => {
    console.log("...using cache");
    return await getStockPrices();
  },
  ["stock-prices"],
  { revalidate: 50 }, // 50 seconds
);

export async function getStockPrices(): Promise<STOCKPRICES[]> {
  try {
    // Load the site
    const stockPrices: STOCKPRICES[] = [];

    console.log("...attempting to scrape with a 7 second timeout");
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const { data } = await axios.get("https://afx.kwayisi.org/nse/", {
      timeout: 7000,
      headers: {
        "User-Agent": userAgent,
      },
    });

    // Extract data from site
    const $ = cheerio.load(data);

    $("div.t > table > tbody > tr").each((_idx, el) => {
      const data = $(el).extract({
        symbol: {
          selector: "td:first",
        },
        price: {
          selector: "td:eq(3)",
        },
        change: {
          selector: "td:eq(4)",
        },
      });
      stockPrices.push({
        symbol: data.symbol ?? "",
        price: data.price ? Number.parseFloat(data.price) : 0.0,
        change: data.change ? Number.parseFloat(data.change) : 0.0,
      });
    });

    // Update database with stock prices
    console.log("...updating prices in db");
    await database.updateStockPricesInDB({
      time: new Date(),
      details: stockPrices,
    });

    return stockPrices;
  } catch (err) {
    console.error("...web scraping failed , using fallback values", err);
    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.error(`Axios error: HTTP ${err.response.status}`);
      } else if (err.request) {
        console.error("Axios error: No response received");
      } else {
        console.error("Axios error: Request setup failed");
      }
    }
    //throw new MyError(Errors.NOT_GET_STOCK_PRICES);
    //TODO: FIND A WAY OF GETTING FALLBACK DATA
    try {
      const stocks = await database.getStockPricesFromDB();
      return stocks;
    } catch (err) {
      console.log("...error getting stocks from db", err);
      return [];
    }
  }
}