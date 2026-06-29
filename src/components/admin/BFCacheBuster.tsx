"use client";

import { useEffect } from "react";

export default function BFCacheBuster() {
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // The page was restored from the browser's Back/Forward Cache.
        // Force a full reload to verify authentication state with the server.
        window.location.reload();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
