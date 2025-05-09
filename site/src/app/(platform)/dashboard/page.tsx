"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  BarChart3,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Copy,
  Check
} from "lucide-react";
import {
  getStockHoldings,
  getTotalPortfolioValue,
  getInitialInvestment,
} from "@/server-actions/stocks/dashboard";
import { useAccountId, useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { PortfolioPerformance } from "./components/portfolio-performance";
import { AssetHoldings } from "./components/asset-holdings";
import { StockHoldings } from "./components/types";

const DashBoardPage = () => {
  const { isConnected } = useWallet();
  const { data: address } = useAccountId();
  const [portfolio, setPortfolio] = useState<StockHoldings[]>([]);
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy address");
      console.error("Copy error:", err);
    }
  };

  const fetchPortfolioData = useCallback(async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);

      const [holdings, invested, portfolioValue] = await Promise.all([
        getStockHoldings(address),
        getInitialInvestment({ user_address: address }),
        getTotalPortfolioValue(address),
      ]);

      setPortfolio(holdings);
      setTotalInvested(invested);
      setCurrentValue(portfolioValue);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchPortfolioData();
    }
  }, [isConnected, address, fetchPortfolioData]);

  const totalProfit = currentValue - totalInvested;
  const profitPercentage =
    totalInvested !== 0 ? (totalProfit / totalInvested) * 100 : 0;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Wallet className="h-12 w-12 mb-4 text-gray-400" />
        <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
        <p className="text-gray-500 mb-4">
          Please connect your wallet to view your portfolio
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p>Just a moment...</p>
        {address && (
          <p className="text-sm text-gray-500 mt-2">
            Wallet: {address.substring(0, 6)}...
            {address.substring(address.length - 4)}
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md text-center">
          <h2 className="text-red-600 font-bold mb-2">Error Loading Data</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-16 mx-auto mb-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mt-6">Your Dashboard</h1>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <div className="flex items-center gap-1 bg-gray-100 rounded-full group">
                <span className="text-sm px-3 py-1">
                  {address
                    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                    : "Disconnected"}
                </span>
                {address && (
                  <button
                    onClick={handleCopy}
                    disabled={copied}
                    className="cursor-pointer p-1 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                    )}
                  </button>
                )}
              </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSH{" "}
              {currentValue.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p
              className={`text-xs ${profitPercentage >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {profitPercentage >= 0 ? (
                <ArrowUp className="inline h-3 w-3" />
              ) : (
                <ArrowDown className="inline h-3 w-3" />
              )}
              {Math.abs(profitPercentage).toFixed(2)}% from total investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profit/Loss
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalProfit >= 0 ? "+" : ""}KSH{" "}
              {totalProfit.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              From investment of KSH{" "}
              {totalInvested.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assets Owned</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.length}</div>
            <p className="text-xs text-muted-foreground">
              Total of {portfolio.reduce((acc, stock) => acc + stock.shares, 0)}{" "}
              shares
            </p>
          </CardContent>
        </Card>
      </div>

      <PortfolioPerformance
        userAddress={address}
      />

      <AssetHoldings portfolio={portfolio} userAddress={address}
        onUpdate={fetchPortfolioData} />
    </div>
  );
};

export default DashBoardPage;
