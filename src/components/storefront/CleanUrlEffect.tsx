"use client";

import { useEffect } from "react";

/**
 * Removes sensitive query tokens from the browser URL address bar and browser history.
 * Ensures tokens are never preserved in browser history or exposed when patrons copy the URL.
 */
export default function CleanUrlEffect({ paramToRemove = "token" }: { paramToRemove?: string }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search) {
      const url = new URL(window.location.href);
      if (url.searchParams.has(paramToRemove)) {
        url.searchParams.delete(paramToRemove);
        const cleanUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + url.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [paramToRemove]);

  return null;
}

