"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { WalletPopover } from "./wallet-popover";
export function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const router = useRouter();
  return (
    <header className="shadow-sm bg-background fixed flex items-center justify-between top-0 left-0 right-0 z-50 px-4">
      <div className=" flex h-16 items-center justify-between  w-full ">
        <div className="flex items-center justify-between ">
          <div
            className={`gap-1 ${isHomePage ? "flex" : "md:flex hidden"}  cursor-pointer `}
            onClick={() => router.push("/")}
          >
            <Image
              alt="logo"
              src="/logo/png/logo-no-background.png"
              width={100}
              height={100}
              className="w-6 h-6"
            />
            <div className=" text-xl font-semibold">ORION</div>
          </div>
        </div>
        <WalletPopover />
      </div>
    </header>
  );
}
