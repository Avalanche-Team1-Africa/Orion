"use client";
import React, { useState } from "react";
import { StockHoldings } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAccountId, useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { TransferTransaction } from "@hashgraph/sdk";
import { transferHbar } from "@/server-actions/contracts/transfer_hbar";
import updateUserStockHoldings from "@/server-actions/stocks/update_stock_holdings";
import { sendNotification } from "@/server-actions/sell/notify";
import {
  HWBridgeSigner,
  HederaSignerType,
} from "@buidlerlabs/hashgraph-react-wallets";
interface AssetHoldingsProps {
  portfolio: StockHoldings[];
  userAddress: string;
  onUpdate: () => Promise<void>;
}

export const AssetHoldings = ({ portfolio, userAddress, onUpdate }: AssetHoldingsProps) => {
  const { signer } = useWallet();
  const { data: accountId } = useAccountId();
  const [selectedStock, setSelectedStock] = useState<StockHoldings | null>(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSelling, setIsSelling] = useState(false);

  function isHederaSigner(signer: HWBridgeSigner): signer is HederaSignerType {
    // Check based on properties that are unique to HederaSignerType
    return (signer as HederaSignerType).topic !== undefined;
  }

  const sellToken = async (amount: number, tokenId: string) => {
    if (!signer) {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }
    if (!accountId) {
      toast.error("Account ID not found");
      throw new Error("Account ID not found");
    }
    if (!isHederaSigner(signer)) {
      toast.error("Invalid signer");
      throw new Error("Invalid signer");
    }

    const transferTokenTx = new TransferTransaction()
      .addTokenTransfer(tokenId, accountId, -amount)
      .addTokenTransfer(tokenId, "0.0.5785413", amount);

    const signedTx = await transferTokenTx.freezeWithSigner(signer);
    const transactionID = await signedTx.executeWithSigner(signer);
    await transactionID.getReceiptWithSigner(signer);
  };

  const handleSell = async () => {
    if (!selectedStock || !userAddress) {
      toast.warning("No stock selected or wallet disconnected");
      return;
    }
    setIsSelling(true);

    try {
      const currentPricePerShare = selectedStock.current_price / selectedStock.shares;
      const saleAmount = currentPricePerShare * sellQuantity;
      
      await sellToken(sellQuantity, selectedStock.tokenId);

      if (paymentMethod === "mobile") {
        await sendNotification({
          customer_phone_number: phoneNumber,
          amount: saleAmount,
        });
      } else {
        await transferHbar({
          userAddress: userAddress,
          amount: saleAmount,
        });
      }

      await updateUserStockHoldings({
        user_address: userAddress,
        stock_symbol: selectedStock.symbol,
        stock_name: selectedStock.name,
        number_stock: sellQuantity,
        tokenId: selectedStock.tokenId,
        operation: "sell",
      });

      toast.success(
        `Sold ${sellQuantity} shares of ${selectedStock.symbol} for KSH ${saleAmount.toLocaleString(
          "en-KE",
          { minimumFractionDigits: 2 },
        )}`,
      );

      await onUpdate();
    } catch (err) {
      toast.error("Failed to complete sale");
      console.error("Sale error:", err);
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Asset Holdings</CardTitle>
        <CardDescription>
          Manage your portfolio and sell assets when ready
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Buy Price</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Profit/Loss</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolio.map((stock) => {
              const buyPricePerShare = stock.buy_price / stock.shares;
              const currentPricePerShare = stock.current_price / stock.shares;
              const profitPercent = (stock.profit / stock.buy_price) * 100;

              return (
                <TableRow key={stock.symbol}>
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>{stock.name}</TableCell>
                  <TableCell className="text-right">{stock.shares}</TableCell>
                  <TableCell className="text-right">
                    {buyPricePerShare.toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {currentPricePerShare.toLocaleString("en-KE", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell
                    className={`text-right ${stock.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {stock.profit >= 0 ? (
                      <ArrowUp className="inline h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="inline h-4 w-4 mr-1" />
                    )}
                    {Math.abs(profitPercent).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStock(stock);
                            setSellQuantity(1);
                          }}
                        >
                          Sell
                        </Button>
                      </DialogTrigger>
                      {selectedStock?.symbol === stock.symbol && (
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Sell {selectedStock.symbol}</DialogTitle>
                            <DialogDescription>
                              {selectedStock.name} - Current Price: KSH{" "}
                              {currentPricePerShare.toLocaleString("en-KE", {
                                minimumFractionDigits: 2,
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Quantity to Sell (Max: {selectedStock.shares})
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max={selectedStock.shares}
                                value={sellQuantity}
                                onChange={(e) =>
                                  setSellQuantity(
                                    Math.min(
                                      parseInt(e.target.value) || 1,
                                      selectedStock.shares,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Total Amount to Receive
                              </label>
                              <div className="text-xl font-bold">
                                KSH{" "}
                                {(
                                  currentPricePerShare * sellQuantity
                                ).toLocaleString("en-KE", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <label className="text-sm font-medium">
                                Payment Method
                              </label>
                              <div className="flex space-x-2">
                                <Button
                                  variant={
                                    paymentMethod === "mobile"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setPaymentMethod("mobile")}
                                  className="flex-1"
                                >
                                  Mobile Money
                                </Button>
                                <Button
                                  variant={
                                    paymentMethod === "eth"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => setPaymentMethod("eth")}
                                  className="flex-1"
                                >
                                  HBAR
                                </Button>
                              </div>
                            </div>
                            {paymentMethod === "mobile" && (
                              <div className="grid gap-2">
                                <label className="text-sm font-medium">
                                  Phone Number
                                </label>
                                <Input
                                  placeholder="+254..."
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSell} disabled={isSelling}>
                              {isSelling ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                "Confirm Sale"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};