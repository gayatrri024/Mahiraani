"use client";
// src/app/global-error.tsx
// Root-level error boundary for uncaught layout or root errors

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 min-h-screen flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-md">
          <div className="text-3xl mb-3">◈</div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">MAHIRAANI</h1>
          <p className="text-sm text-stone-600 mb-6">
            The application experienced an unexpected interruption. Please reload the page to continue.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                window.location.href = "/";
              }}
              className="bg-stone-100 text-stone-800 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
