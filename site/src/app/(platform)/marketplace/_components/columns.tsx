import { StockData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  CircleMinus,
} from "lucide-react";
import { BuyStocksPopup } from "./buy-stocks-popup";
import { ViewButton } from "./view-button";
export const columns: ColumnDef<StockData>[] = [
  {
    accessorKey: "symbol",
    header: ({ column }) => {
      return (
        <div
          className="cursor-pointer flex justify-start items-center "
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Symbol
          <ArrowUpDown className=" ml-1 h-4 w-4" />
        </div>
      );
    },
    cell: ({ row }) => <div className="text-left">{row.original.symbol}</div>,
  },

  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KSH",
      })
        .format(price)
        .replace("KSH", "Ksh") // Change to title case
        .replace(/^(Ksh\s*)(\d)/, "$1 $2"); // Add space after currency;

      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "change",
    header: "Change",
    cell: ({ row }) => {
      const change = row.original.change;
      const isPositive = change > 0;
      const isZero = change === 0;

      return (
        <div
          className={`flex items-center gap-1 ${isZero
              ? "text-gray-500"
              : isPositive
                ? "text-green-600"
                : "text-red-600"
            }`}
        >
          {isZero ? (
            <CircleMinus className="w-4 h-4 text-inherit" strokeWidth={1.25} />
          ) : isPositive ? (
            <TrendingUp className="w-4 h-4 text-inherit" strokeWidth={1.25} />
          ) : (
            <TrendingDown className="w-4 h-4 text-inherit" strokeWidth={1.25} />
          )}
          {Math.abs(change).toFixed(1)}
        </div>
      );
    },
  },
  {
    accessorKey: "tokenID",
    header: "Token ID",
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => <ViewButton symbol={row.original.symbol} />,
  },
  {
    id: "buy",
    header: "Buy",

    cell: ({ row }) => <BuyStocksPopup entry={row.original} />,
  },
];
