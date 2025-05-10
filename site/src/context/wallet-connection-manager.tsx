"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { useWallet as useCardanoWallet } from "@meshsdk/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";
export type WalletType = "avalanche" | "cardano" | null;
interface WalletConnection {
  activeWallet: WalletType;
  isConnectionAllowed: (type: WalletType) => boolean;
  isWalletConnected: boolean;
}

export const WalletConnectionContext = createContext<WalletConnection>({
  activeWallet: null,
  isConnectionAllowed: () => false,
  isWalletConnected: false,
});
// hook for using the wallet connection context
export const useWalletConnection = () => useContext(WalletConnectionContext);
export const WalletConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeWallet, setActiveWallet] = useState<WalletType>(null);

  const { connected: isCardanoConnected } = useCardanoWallet();
  const { isConnected: isAvalancheConnected } = useAppKitAccount();
  useEffect(() => {
    if (isCardanoConnected && !isAvalancheConnected) {
      setActiveWallet("cardano");
      console.log("...cardano wallet is active");
    } else if (isAvalancheConnected && !isCardanoConnected) {
      setActiveWallet("avalanche");
      console.log("...avalanche wallet is active");
    } else if (isCardanoConnected && isAvalancheConnected) {
      // technically this state shouldn't be possible this is just a monitor for unexpected states
      console.warn(
        "FATAL ERROR: BOTH WALLETS ARE CONNECTED AT THE SAME TIME , THIS SHOULD NOT BE POSSIBLE!",
      );
    } else {
      // neither are connected
      setActiveWallet(null);
    }
  }, [isAvalancheConnected, isCardanoConnected]);
  // this just checks whether a connection should be allowed
  const isConnectionAllowed = (type: WalletType): boolean => {
    if (!type) return false;

    // if same wallet type is already active, do nothing
    if (activeWallet === type) return true;

    try {
      // if another wallet is connected, show warning
      if (activeWallet) {
        toast.warning(
          `Please disconnect your ${activeWallet} wallet before connecting to ${type}`,
        );
        return false;
      }

      // at this point, no wallet is connected, so the user is free to connect
      return true;
    } catch (error) {
      console.error(`Error checking wallet connection status:`, error);
      return false;
    }
  };

  const isWalletConnected = isCardanoConnected || isAvalancheConnected;
  return (
    <WalletConnectionContext.Provider
      value={{
        activeWallet,
        isWalletConnected,
        isConnectionAllowed,
      }}
    >
      {children}
    </WalletConnectionContext.Provider>
  );
};
