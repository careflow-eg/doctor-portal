"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/LoadingSpinner";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) return <PageLoader label="Loading portal..." />;
  if (!isAuthenticated) return <PageLoader label="Redirecting..." />;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
