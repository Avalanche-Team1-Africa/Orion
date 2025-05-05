"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";

export default function AuthRouter() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    // Check for admin role in the user metadata
    const isAdmin = user?.publicMetadata?.role === "admin";

    if (isAdmin && isSignedIn) {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex  justify-center">
      <div className="flex items-center  text-2xl  gap-2">
        <Spinner size="large" />
        Redirecting
      </div>
    </div>
  );
}
