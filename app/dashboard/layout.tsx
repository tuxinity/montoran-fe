"use client";

import Sidebar from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../components/providers";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      <main className="flex-1 overflow-x-hidden">
        <DashboardHeader
          title={title}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
