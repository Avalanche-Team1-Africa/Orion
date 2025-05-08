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
        disabled
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
          className="ml-4  flex items-center transition-all duration-200"
        >
          <Wallet className="h-5 w-5 mb-1" />
          <span>Connect Cardano Wallet</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0 rounded-full shadow-lg">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-6  ">
            <CardTitle className="flex  items-center gap-3 text-xl">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-xs">
              Select a Cardano wallet to connect
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="px-6 pt-2 pb-4">
            <ScrollArea className="h-auto max-h-[350px]">
              {noWalletsDetected ? (
                <div className="text-center p-6 bg-slate-50 rounded-xl">
                  <AlertCircle className="h-14 w-14 mx-auto text-muted-foreground mb-3" />
                  <p className="text-base font-medium">
                    No Cardano wallets detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please install a Cardano wallet extension to continue
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-5 w-full rounded-lg h-10"
                    onClick={() =>
                      window.open(
                        "https://docs.cardano.org/about-cardano/new-to-cardano/types-of-wallets",
                        "_blank",
                      )
                    }
                  >
                    View Wallet Options
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-6 ">
                  {availableWallets.map((walletOption) => (
                    <button
                      key={walletOption.id}
                      disabled={isConnecting}
                      onClick={() => handleConnect(walletOption.id)}
                      className={`
                        w-[100px] h-[100px] p-3 rounded-2xl border border-input
                        flex flex-col items-center justify-center gap-2
                        transition-all duration-200
                        ${connectingWalletId === walletOption.id
                          ? "bg-primary/10 border-primary"
                          : "bg-slate-50 hover:bg-primary/5 border-slate-200 hover:border-primary/50"
                        }
                        focus:outline-none 
                      `}
                    >
                      <div
                        className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${connectingWalletId === walletOption.id ? "bg-primary/20" : "bg-white"}
                      `}
                      >
                        {walletOption.icon ? (
                          <img
                            src={walletOption.icon}
                            alt={`${walletOption.name} icon`}
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <Wallet className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center transition-all  gap-1">
                        {connectingWalletId === walletOption.id && (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        )}
                        <span className="text-xs font-medium text-center">
                          {walletOption.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="px-4 py-4 flex justify-between border-t ">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-xs font-medium"
            >
              Cancel
            </Button>
            <a
              href="https://docs.cardano.org/about-cardano/new-to-cardano/types-of-wallets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              Learn more
            </a>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
