"use client";
import { useState } from "react";
import { useWallet as useCardanoWallet } from "@meshsdk/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";
import { WalletButton } from "./appkit-wallet-button";
import { CustomCardanoWallet } from "./custom-cardano-wallet";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useWalletConnection } from "@/context/wallet-connection-manager";
export const WalletPopover = () => {
  const [open, setOpen] = useState(false);
  const { name: cardanoWalletName } = useCardanoWallet();
  const { address: avalancheAddress } = useAppKitAccount();
  const { activeWallet, isWalletConnected } = useWalletConnection();

  // Get short address format for display
  const shortAddress = (address?: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  // Get wallet display name
  const getWalletDisplayName = (): string => {
    if (activeWallet === "cardano") return "Cardano";
    if (activeWallet === "avalanche") return "Avalanche";
    return "Wallet";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          {isWalletConnected ? (
            <div className="flex items-center">
              <span>{getWalletDisplayName()}</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-transparent py-0 h-5 px-1.5 font-normal"
              >
                Connected
              </Badge>
              <ChevronDown className="ml-1 h-3 w-3" />
            </div>
          ) : (
            <span>Connect Wallet</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end">
        <div className="p-4 bg-white rounded-md">
          <div className="flex justify-between items-start ">
            <h3 className="text-lg font-medium mb-2">Wallet Connection</h3>
            <PopoverClose asChild>
              <X className="h-4 w-4 mt-1 text-neutral-800 hover:text-red-700" />
            </PopoverClose>
          </div>
          <Separator className="my-3" />

          {/* Connection Status Alert */}
          {isWalletConnected && (
            <div
              className={`p-3 rounded-lg mb-4 ${activeWallet === "cardano" ? "bg-amber-50" : "bg-blue-50"}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${activeWallet === "cardano" ? "bg-amber-500" : "bg-blue-500"}`}
                ></div>
                <span className="font-medium">
                  {activeWallet === "cardano" ? "Cardano" : "Avalanche"} wallet
                  connected
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1 ml-4">
                {activeWallet === "cardano"
                  ? `Wallet: ${cardanoWalletName || "Connected"}`
                  : `Address: ${shortAddress(avalancheAddress)}`}
                {activeWallet === "avalanche" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1"
                    onClick={() => copyToClipboard(avalancheAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Connection Notice */}
          {isWalletConnected && (
            <div className="bg-slate-50 p-3 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                You must disconnect your current {activeWallet} wallet before
                connecting to another blockchain.
              </div>
            </div>
          )}

          {/* Wallet Connection Options */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                Cardano Wallet
              </h4>
              <div className="pl-4">
                <CustomCardanoWallet />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                Avalanche Wallet
              </h4>
              <div className="pl-4">
                <WalletButton />
              </div>
            </div>
          </div>

          {/* Blockchain Explorer Links */}
          {isWalletConnected && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  View on explorer
                </span>
                {activeWallet === "cardano" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() =>
                      window.open("https://cardanoscan.io/", "_blank")
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Cardano Explorer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() =>
                      window.open("https://snowtrace.io/", "_blank")
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Avalanche Explorer
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
