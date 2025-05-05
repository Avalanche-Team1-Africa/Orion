"use server"
import { Errors, MyError } from "@/constants/errors";
import { STOCK_PRICES_V2_COLLECTION } from "@/db/collections";

interface Prices {
    time: Date,
    price: number
}

export default async function getPriceChartData(symbol: string): Promise<Prices[]> {
    try {
        const prices: Prices[] = [];
        const cursor = STOCK_PRICES_V2_COLLECTION.find();
        for await (const doc of cursor) {
            prices.push({
                time: doc.time,
                price: doc.details.find((d) => d.symbol === symbol)?.price ?? 0,
            });
        }

        return prices;
    } catch(err) {
        console.log("Could not get prices", err);
        throw new MyError(Errors.NOT_GET_PRICES);
    }
}