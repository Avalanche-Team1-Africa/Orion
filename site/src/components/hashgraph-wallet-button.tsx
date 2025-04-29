"use client";
import { Button } from "./ui/button";
// import { networks } from "@/config";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useWallet } from "@buidlerlabs/hashgraph-react-wallets";
import { HWCConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";
export const HashGraphWalletButton = () => {
  const { isConnected, connect, disconnect } = useWallet(HWCConnector);
  const prevConnectedRef = useRef(false);

  // Effect to detect when connection state changes from false to true
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      toast.success("Successfully connected to wallet");
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect wallet");
      console.error(error);
    }
  };

  return (
    <>
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          className="ml-4 cursor-pointer"
        >
          <IconWallet className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="ml-4 cursor-pointer"
        >
          <IconWallet className="mr-2 h-4 w-4" /> Disconnect Wallet
        </Button>
      )}
    </>
  );
};
