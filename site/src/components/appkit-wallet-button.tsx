"use client";
import {
  useDisconnect,
  useAppKit,
  useAppKitAccount,
  useWalletInfo,
} from "@reown/appkit/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconWallet } from "@tabler/icons-react";
import { useWalletConnection } from "@/context/wallet-connection-manager";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
export const WalletButton = () => {
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const { isConnectionAllowed } = useWalletConnection();
  const { walletInfo } = useWalletInfo();

  const handleConnect = () => {
    // Check if this connection attempt is allowed
    if (!isConnectionAllowed("avalanche")) {
      return;
    }

    open();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.info("Wallet disconnected");
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
          className=" cursor-pointer"
        >
          <IconWallet className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className=" flex items-center  transition-all focus:outline-none duration-200"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          <span className="flex items-center gap-1.5">
            {walletInfo?.name || "wallet"}
            <Badge
              variant="outline"
              className="ml-1 py-0 h-5 px-1.5 font-normal"
            >
              Connected
            </Badge>
          </span>
        </Button>
      )}
    </>
  );
};
