"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher-i18n";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const NavbarLayout = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        if (window.scrollY > 10) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      };

      handleScroll();
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const navItems = [
    {
      name: t("nav.home"),
      href: "/",
    },
    {
      name: t("nav.about"),
      href: "/about",
    },
    {
      name: t("nav.contact"),
      href: "/contact",
    },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white shadow-md border-b"
          : "bg-white/80 backdrop-blur-sm border-b",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              {t("app.name")}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {item.name}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetTitle className="text-lg font-semibold">
                  {t("app.name")}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for accessing different sections of the
                  website
                </SheetDescription>

                <div className="flex flex-col h-full mt-6">
                  <nav className="flex flex-col gap-2 py-4">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "px-4 py-3 text-sm font-medium rounded-md transition-colors",
                            pathname === item.href
                              ? "bg-gray-900 text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="mt-auto border-t py-4 px-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("language.switch")}
                      </span>
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLayout;
