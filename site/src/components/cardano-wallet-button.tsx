"use client";

import { CardanoWallet, useWallet } from "@meshsdk/react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import "@meshsdk/react/styles.css";
// Cardano Testnets: Preprod or Preview
// You'll need a Blockfrost API key for the chosen testnet.

export const CardanoWalletButton = () => {
  const { connected, wallet, disconnect, error: walletError } = useWallet();
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    if (connected && !prevConnectedRef.current) {
      toast.success(`Cardano wallet  connected!`);
    }
    if (!connected && prevConnectedRef.current) {
      toast.info("Cardano wallet disconnected.");
    }
    prevConnectedRef.current = connected;
  }, [connected, wallet]);

  useEffect(() => {
    if (walletError) {
      toast.error(`Cardano Wallet Error: ${walletError}`);
      console.error("Cardano Wallet Error:", walletError);
    }
  }, [walletError]);

  const handleDisconnect = async () => {
    try {
      disconnect();
      // Toast is handled by the useEffect above
    } catch (error) {
      toast.error("Failed to disconnect Cardano wallet");
      console.error(error);
    }
  };

  return (
    <>
      {!connected ? (
        <CardanoWallet
          label="Connect Cardano Wallet"
          onConnected={() => {
            console.log("wallet connected");
          }}
          persist={true}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="ml-4 cursor-pointer"
        >
          <IconWallet className="mr-2 h-4 w-4" /> Disconnect
        </Button>
      )}
    </>
  );
};
