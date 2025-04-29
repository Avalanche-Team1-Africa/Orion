import { PlatformSidebar } from "@/components/platform-sidebar";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex w-full  relative">
        <PlatformSidebar />
        <div className="md:ml-12 mt-20 w-full">{children}</div>
      </main>
    </>
  );
}
