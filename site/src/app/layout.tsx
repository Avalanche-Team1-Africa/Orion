import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { headers } from "next/headers";
import "./globals.css";
import AppKitProvider from "@/context/appkit";
import { Navbar } from "@/components/navbar";
import { siteConfig } from "@/config/site";
import TanstackProvider from "@/context/tanstack";
import { ClerkProvider } from "@clerk/nextjs";
import { AdminKeyBoardShortcut } from "@/components/admin-shortcut";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CardanoProvider } from "@/context/cardano";
import { WalletConnectionProvider } from "@/context/wallet-connection-manager";
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["vietnamese"],
});
export const metadata: Metadata = {
  title: {
    template: `%s|${siteConfig.name}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get("cookies");
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${plusJakartaSans.className} antialiased`}>
          <TanstackProvider>
            <CardanoProvider>
              <AppKitProvider cookies={cookies}>
                <WalletConnectionProvider>
                  <Navbar />
                  {children}
                </WalletConnectionProvider>
                <AdminKeyBoardShortcut />
                <Analytics />
                <SpeedInsights />
              </AppKitProvider>
            </CardanoProvider>
          </TanstackProvider>
          <Toaster richColors closeButton expand visibleToasts={4} />
        </body>
      </html>
    </ClerkProvider>
  );
}
