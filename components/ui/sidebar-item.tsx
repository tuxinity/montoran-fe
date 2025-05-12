import React from "react";

interface SidebarItemProps {
  children: React.ReactNode;
}

export const SidebarItem = ({ children }: SidebarItemProps) => {
  return (
    <div className="py-2.5 px-4 hover:bg-gray-200 transition duration-200">
      {children}
    </div>
  );
};
