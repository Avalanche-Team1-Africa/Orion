"use client";

import { useWalletConnection } from "@/context/wallet-connection-manager";
import { useWallet as useCardanoWallet } from "@meshsdk/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Badge } from "./ui/badge";

export const WalletStatus = () => {
  const { connected: isCardanoConnected, name: cardanoWalletName } =
    useCardanoWallet();
  const { isConnected: isAvalancheConnected, address: avalancheAddress } =
    useAppKitAccount();

  // Get short address format for display
  const shortAddress = (address?: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isCardanoConnected && !isAvalancheConnected) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {isCardanoConnected && (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Cardano: {cardanoWalletName || "Connected"}
        </Badge>
      )}

      {isAvalancheConnected && (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Avalanche: {shortAddress(avalancheAddress)}
        </Badge>
      )}
    </div>
  );
};
