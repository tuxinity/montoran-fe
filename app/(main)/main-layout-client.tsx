"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import FooterLayout from "@/components/layout/footer-layout";

// Import navbar secara dinamis dengan ssr: false untuk menghindari hydration error
const NavbarLayout = dynamic(() => import("@/components/layout/navbar-layout"), {
  ssr: false,
  loading: () => (
    <div className="h-16 border-b bg-white fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold">Montoran</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

interface MainLayoutClientProps {
  children: React.ReactNode;
}

export function MainLayoutClient({ children }: MainLayoutClientProps) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b bg-white fixed top-0 left-0 right-0 z-50"></div>}>
        <NavbarLayout />
      </Suspense>
      {/* Tambahkan padding-top untuk memberikan ruang bagi navbar sticky */}
      <main className="flex-1 pt-16">{children}</main>
      <FooterLayout />
    </>
  );
}
