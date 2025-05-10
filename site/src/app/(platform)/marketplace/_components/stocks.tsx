"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getStocks } from "@/server-actions/stocks/getStocks";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useWalletConnection } from "@/context/wallet-connection-manager";
import { Chains } from "@/constants/status";
import { StockData } from "@/types";
import { toast } from "sonner";
// import { usePolling } from "@/hooks/usePolling";
interface Stocks {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
}
export function Stocks(/*{ stocks }: { stocks: Stocks[] }*/) {
  const { data: stocks, isLoading } = useQuery({
    queryKey: ["stocks"],
    queryFn: getStocks,
    // enable polling
    refetchInterval: 20000,
  });
  const {activeWallet} = useWalletConnection();


  if (isLoading) {
    return (
      <div className="w-full grid gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-8 bg-gray-200" />
        ))}
      </div>
    );
  }
  // usePolling(10000);

  let chainSpecificStocks: StockData[];
  if (!stocks) {
    chainSpecificStocks = [];
  } else {
    if (activeWallet === "cardano") {
      chainSpecificStocks = stocks.filter((s) => s.chain === Chains.CARDANO);
    } else if (activeWallet === "avalanche") {
      chainSpecificStocks = stocks.filter((s) => s.chain === Chains.AVALANCHE);
    } else {
      toast.warning("Connect to a wallet to view stocks");
      chainSpecificStocks = [];
    }
  }


  return (
    <div className="">
      {stocks && <DataTable columns={columns} data={chainSpecificStocks} />}
    </div>
  );
}
