"use client";
import { HWBridgeProvider } from "@buidlerlabs/hashgraph-react-wallets";
import { HWCConnector } from "@buidlerlabs/hashgraph-react-wallets/connectors";
import {
  HederaTestnet,
  //   HederaMainnet,
} from "@buidlerlabs/hashgraph-react-wallets/chains";
import LoadingFallback from "@/components/ui/wallet-loading-fallback";

const metadata = {
  name: "Orion",
  description:
    "Orion is a stock trading platform that let's you trade stocks with mobile money or crypto",
  icons: ["../../public/logo/png/logo-color.png"],
  url: "https://nse-seven.vercel.app",
};
const projectId =
  process.env.NEXT_PUBLIC_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

export const ReactWalletsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <HWBridgeProvider
      metadata={metadata}
      projectId={projectId}
      connectors={[HWCConnector]}
      chains={[HederaTestnet]}
      LoadingFallback={LoadingFallback}
    >
      {children}
    </HWBridgeProvider>
  );
};
