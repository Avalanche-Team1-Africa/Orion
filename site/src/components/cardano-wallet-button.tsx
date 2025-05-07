"use client";

import { CardanoWallet, useWallet } from "@meshsdk/react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";
import { useEffect, useRef, useMemo } from "react";
import { BlockfrostProvider } from "@meshsdk/core";

export const CardanoWalletButton = () => {
  const projectId = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREPROD;

  const provider = useMemo(() => {
    if (!projectId) {
      console.error(
        "NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREPROD is not defined. CardanoWallet web3Services will not be initialized.",
      );
      return undefined;
    }
    return new BlockfrostProvider(projectId);
  }, [projectId]);

  const {
    connected,
    wallet,
    disconnect,
    error: walletError,
    name,
  } = useWallet();
  const prevConnectedRef = useRef(false);

  useEffect(() => {
    if (connected && !prevConnectedRef.current && wallet) {
      toast.success(`Cardano wallet  connected!`);
    }
    if (!connected && prevConnectedRef.current) {
      toast.info("Cardano wallet disconnected.");
    }
    prevConnectedRef.current = connected;
  }, [connected, wallet]);

  useEffect(() => {
    if (walletError) {
      let message = `Cardano Wallet Error: ${walletError}`;
      // Try to get a more specific error message
      if (
        typeof walletError === "object" &&
        walletError !== null &&
        "message" in walletError
      ) {
        message = `Error: ${(walletError as any).message || walletError.toString()}`;
      } else if (typeof walletError === "string") {
        message = `Error: ${walletError}`;
      }
      if (
        message.toLowerCase().includes("user rejected") ||
        message.toLowerCase().includes("denied")
      ) {
        message = "Connection request rejected by user.";
      }
      toast.error(message);
      console.error("Cardano Wallet Error Object:", walletError);
    }
  }, [walletError]);

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      toast.error("Failed to disconnect Cardano wallet");
      console.error(error);
    }
  };

  if (!provider) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="ml-4"
        disabled
        title="Cardano wallet services unavailable (missing configuration)"
      >
        <IconWallet className="mr-2 h-4 w-4" /> Connect Cardano Wallet
      </Button>
    );
  }

  return (
    <>
      {!connected ? (
        <CardanoWallet
          label="Connect Cardano Wallet"
          onConnected={() => {
            console.log("CardanoWallet: onConnected callback triggered.");
          }}
          // web3Services are used if the wallet needs to interact with the chain via your app's provider
          web3Services={
            provider
              ? {
                networkId: 0, // 0 for testnet (Preprod or Preview based on your Blockfrost key)
                fetcher: provider,
                submitter: provider,
              }
              : undefined
          }
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="ml-4 cursor-pointer"
        >
          <IconWallet className="mr-2 h-4 w-4" /> Disconnect {name || ""}
        </Button>
      )}
    </>
  );
};
