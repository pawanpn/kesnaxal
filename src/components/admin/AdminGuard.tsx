"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, authReady } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !isAdmin) {
      router.replace("/admin/login");
    }
  }, [authReady, isAdmin, router]);

  if (!authReady || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
