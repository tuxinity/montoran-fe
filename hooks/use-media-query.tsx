import { useState, useEffect } from "react";

/**
 * Custom hook that checks if the given media query matches
 * @param {string} query - CSS media query string (e.g. "(min-width: 768px)")
 * @returns {boolean} - True if the media query matches, false otherwise
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQueryList = window.matchMedia(query);

    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    mediaQueryList.addEventListener("change", listener);

    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};
