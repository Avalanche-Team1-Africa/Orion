//I MADE THIS PAGE A SERVER COMPONENT
//CHECK StockChartControls and
//StockTradingForm for the code I extracted
//-ANTHONY
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import { StockChart } from "../_components/StockChart";
import { StockTrades } from "../_components/StockTrades";
import StockChartControls from "../_components/StockChartControls";
import getPriceChartData from "@/server-actions/stocks/get_price_chart_data";
import { getStockBySymbol } from "@/server-actions/stocks/getStocks";
import { BuyStocksForm } from "../_components/buy-stocks-form";

//interface for data returned by getStockBySymbol
// interface stockSymbolData {
//   id: number,
//   symbol: string,
//   name: string,
//   price: number,
//   change: number,
//   tokenID: number,
// };

export default async function StockDetail({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  if (!symbol) {
    return (
      <div className="h-screen flex justify-center items-center">
        Stock not found
      </div>
    );
  } // In a real app, you would fetch this based on symbol

  const data = await getPriceChartData(symbol); //Fetching the price chart data

  const stockSymbol = await getStockBySymbol(symbol);
  const stock = {
    ...stockSymbol,
    description: `${stockSymbol?.name} is a revolutionary company`,
    exchange: `${stockSymbol?.symbol}-NSE`,
    supply: 100000,
    borrow: 50000,
    utilizationRate: 10,
  };

  if (!stockSymbol) {
    return (
      <div className="h-screen flex justify-center items-center">
        Stock not found
      </div>
    );
  }
  return (
    <div className="container px-4 md:px-8 lg:px-16 mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{stockSymbol.name}</h1>
              <span className="text-gray-500">({stockSymbol.symbol})</span>
              <span className="text-xs text-gray-400">{stock.exchange}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-2xl font-semibold mr-2">
                KES {stockSymbol.price.toFixed(2)}
              </span>
              <div
                className={`flex items-center ${stockSymbol.change >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {stockSymbol.change >= 0 ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                <span>
                  {stockSymbol.change >= 0 ? "+" : ""}
                  {stockSymbol.change.toFixed(2)} (
                  {stockSymbol.change.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About {stockSymbol.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{stock.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <div className="text-xs text-muted-foreground flex items-center">
                <span>TOTAL SUPPLY</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">
                {stock.supply.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {stock.exchange}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <div className="text-xs text-muted-foreground flex items-center">
                <span>TOTAL BORROW</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">
                {stock.borrow.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {stock.exchange}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <div className="text-xs text-muted-foreground flex items-center">
                <span>SUPPLY APY</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold text-primary">
                {stockSymbol.change}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <div className="text-xs text-muted-foreground flex items-center">
                <span>UTILIZATION RATE</span>
                <Info className="h-3 w-3 ml-1" />
              </div>
            </CardHeader>
            <CardContent className="py-0">
              <div className="text-2xl font-bold">{stock.utilizationRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Chart</CardTitle>
                <StockChartControls />
              </CardHeader>
              <CardContent>
                <StockChart timeframe="1D" chartdata={data} />
              </CardContent>
            </Card>

            <Card className="mt-6 hidden">
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <StockTrades symbol={stockSymbol.symbol} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-20">
              <CardContent>
                <BuyStocksForm entry={stockSymbol} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
