"use client";

import { useEffect } from "react";
import i18n from "../i18n/i18n"; // Import the i18n configuration

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // After initial render, we can safely apply the user's language preference
    // This happens after hydration, so it won't cause hydration mismatches
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("i18nextLng");
      if (savedLang && i18n.language !== savedLang) {
        i18n.changeLanguage(savedLang);
      }
    }
  }, []);

  // Always render children to avoid hydration mismatches
  // Language switching will happen after hydration
  return <>{children}</>;
}
