"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import translationID from "./locales/id.json";
import translationEN from "./locales/en.json";

// the translations
const resources = {
  id: {
    translation: translationID,
  },
  en: {
    translation: translationEN,
  },
};

// Initialize i18n for both client and server
i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "id",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

// Add language detection only on the client side
if (typeof window !== "undefined") {
  // This will only run on the client
  const savedLang = localStorage.getItem("i18nextLng");

  // If there's a saved language, use it
  if (savedLang) {
    i18n.changeLanguage(savedLang);
  } else {
    // Otherwise, detect the language but don't change it immediately
    // This prevents hydration mismatch
    const detector = new LanguageDetector();
    detector.init(
      {
        order: ["localStorage", "navigator"],
        caches: ["localStorage"],
      },
      {
        // This is a dummy object to satisfy the API
        init: () => {},
        changeLanguage: () => {},
      } as any
    );

    // Get the detected language
    const detectedLang = detector.detect();

    // Store it for future use, but don't change the language yet
    if (detectedLang) {
      localStorage.setItem("i18nextLng", detectedLang);
    }
  }
}

export default i18n;
