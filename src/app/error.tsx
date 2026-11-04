"use client";
// src/app/error.tsx
// Luxury branded error fallback for MAHIRAANI storefront

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log privately without exposing to the user
    console.error("Storefront runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-stone-50 border border-stone-200 rounded-2xl p-8 shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-full bg-stone-200/60 flex items-center justify-center text-stone-700 text-xl mb-4">
          ◈
        </div>

        <h1 className="font-serif text-2xl text-stone-900 tracking-wide mb-2">
          Something went wrong
        </h1>

        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          We encountered an unexpected moment while preparing this piece for you. Please try
          refreshing the page or return to the collection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors shadow-2xs"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto bg-white border border-stone-300 text-stone-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            Return to Boutique
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-stone-400 mt-6 font-mono">
            Reference code: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

