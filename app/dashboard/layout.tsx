"use client";

import Sidebar from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({
  children,
  title = "Dashboard",
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
