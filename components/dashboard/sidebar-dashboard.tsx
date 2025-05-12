"use client";

import { Button } from "@/components/ui/button";
import AuthApi from "@/lib/auth-api";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaCar, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import { BsStack } from "react-icons/bs";
import { HiShoppingCart } from "react-icons/hi";
import { Menu } from "lucide-react";
import { useState } from "react";

export const SidebarDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    AuthApi.logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
              <BsStack className="w-6 h-6 text-blue-600" />
              Dashboard
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                pathname === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaCar className="w-5 h-5 mr-3" />
              Cars
            </Link>

            <Link
              href="/dashboard/sales"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                pathname === "/dashboard/sales"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <HiShoppingCart className="w-5 h-5 mr-3" />
              Sales
            </Link>

            <Link
              href="/dashboard/customers"
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
                pathname === "/dashboard/customers"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaUserPlus className="w-5 h-5 mr-3" />
              Customers
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
