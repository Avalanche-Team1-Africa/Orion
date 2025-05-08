"use client";

import { useWallet } from "@meshsdk/react";
import { BlockfrostProvider, BrowserWallet } from "@meshsdk/core";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useRef, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export const CustomCardanoWallet = () => {
  const [open, setOpen] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(
    null,
  );
  const [availableWallets, setAvailableWallets] = useState<
    Array<{ id: string; name: string; icon?: string }>
  >([]);
  const [noWalletsDetected, setNoWalletsDetected] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);

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
    connect,
    error: walletError,
    name: connectedWalletName,
  } = useWallet();

  const prevConnectedRef = useRef(false);

  // detects available wallets
  useEffect(() => {
    const detectWallets = async () => {
      try {
        // gets all available wallets
        const wallets = BrowserWallet.getInstalledWallets();

        if (wallets.length === 0) {
          setNoWalletsDetected(true);
        } else {
          // formats wallets for display
          const formattedWallets = wallets.map((wallet) => ({
            id: wallet.name.toLowerCase(),
            name: wallet.name,
            icon: wallet.icon,
          }));

          setAvailableWallets(formattedWallets);
          setNoWalletsDetected(false);
        }
      } catch (error) {
        console.error("Error detecting Cardano wallets:", error);
        setNoWalletsDetected(true);
      }
    };

    detectWallets();
  }, []);

  // resets connecting state when popover closes
  useEffect(() => {
    if (!open) {
      setConnectingWalletId(null);
      setIsConnecting(false);
    }
  }, [open]);

  useEffect(() => {
    if (connected && !prevConnectedRef.current && wallet) {
      toast.success(`${connectedWalletName || "Cardano wallet"} connected!`);
      setOpen(false);
      setConnectingWalletId(null);
      setIsConnecting(false);
    }
    if (!connected && prevConnectedRef.current) {
      toast.info("Cardano wallet disconnected.");
    }
    prevConnectedRef.current = connected;
  }, [connected, wallet, connectedWalletName]);

  // handles connection errors and reset states
  useEffect(() => {
    if (walletError) {
      setConnectingWalletId(null);
      setIsConnecting(false);

      let message = `Cardano Wallet Error: ${walletError}`;

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

  const handleConnect = async (walletId: string) => {
    try {
      setConnectingWalletId(walletId);
      setIsConnecting(true);
      await connect(walletId);
    } catch (error) {
      toast.error(`Failed to connect to ${walletId}`);
      console.error(error);
      setConnectingWalletId(null);
      setIsConnecting(false);
    } finally {
      // If the connection process completes without success or explicit error,
      // ensure UI doesn't get stuck by resetting states here as a safety measure
      if (!connected) {
        setIsConnecting(false);
      }
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      toast.error("Failed to disconnect Cardano wallet");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setConnectingWalletId(null);
    setIsConnecting(false);
    setOpen(false);
  };

  if (!provider) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Cardano wallet services unavailable (missing configuration)"
        className="ml-4 flex items-center gap-2"
      >
        <AlertCircle className="h-4 w-4" />
        <span>Configuration Missing</span>
      </Button>
    );
  }

  if (connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        className="ml-4 transition-all duration-200"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        <span className="flex items-center gap-1.5">
          {connectedWalletName || "Wallet"}
          <Badge variant="outline" className="ml-1 py-0 h-5 px-1.5 font-normal">
            Connected
          </Badge>
        </span>
      </Button>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(openState) => {
        if (!openState) {
          handleCancel();
        } else {
          setOpen(openState);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-4 transition-all duration-200"
        >
          <Wallet className="mr-2 h-4 w-4" /> Connect Cardano Wallet
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5" /> Connect Wallet
            </CardTitle>
            <CardDescription>
              Select a Cardano wallet to connect
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="px-4 pt-4">
            <ScrollArea className="h-64 pr-4">
              {noWalletsDetected ? (
                <div className="text-center p-4">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    No Cardano wallets detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please install a Cardano wallet extension to continue
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() =>
                      window.open(
                        "https://docs.cardano.org/wallets/browser-wallets/",
                        "_blank",
                      )
                    }
                  >
                    View Wallet Options
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  {availableWallets.map((walletOption) => (
                    <Button
                      key={walletOption.id}
                      variant="outline"
                      className="justify-between transition-all duration-200 h-10"
                      size="lg"
                      disabled={isConnecting}
                      onClick={() => handleConnect(walletOption.id)}
                    >
                      <div className="flex items-center">
                        {walletOption.icon ? (
                          <img
                            src={walletOption.icon}
                            alt={`${walletOption.name} icon`}
                            className="mr-2 h-4 w-4"
                          />
                        ) : (
                          <Wallet className="mr-2 h-4 w-4" />
                        )}
                        <span>{walletOption.name}</span>
                      </div>
                      {connectingWalletId === walletOption.id && (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="px-4 py-3 flex justify-between border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs"
            >
              Cancel
            </Button>
            <a
              href="https://docs.cardano.org/about-cardano/new-to-cardano/types-of-wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Learn more
            </a>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
