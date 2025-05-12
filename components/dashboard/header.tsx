"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AuthApi from "@/lib/auth-api";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const user = AuthApi.getCurrentUser();
    if (user) {
      setUserName(user.name || "User");
    }
  }, []);

  return (
    <div className="h-14 border-b">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{userName}</span>
        </div>
      </div>
    </div>
  );
}
