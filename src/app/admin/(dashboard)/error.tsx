"use client";
// src/app/admin/(dashboard)/error.tsx
// Error boundary for the Admin Dashboard sections

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-stone-200 rounded-2xl shadow-sm text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 text-xl mb-4">
        ⚠️
      </div>

      <h2 className="text-lg font-bold text-stone-900 mb-2">Admin Section Temporarily Unavailable</h2>

      <p className="text-sm text-stone-600 mb-6 leading-relaxed">
        An error occurred while loading this dashboard view. Your database and catalogue data remain
        safe and intact.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
        >
          Try Loading Again
        </button>
        <Link
          href="/admin"
          className="w-full sm:w-auto bg-stone-100 text-stone-800 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-200 transition-colors"
        >
          Back to Overview
        </Link>
      </div>

      {error.digest && (
        <p className="text-[11px] text-stone-400 mt-6 font-mono">
          System code: {error.digest}
        </p>
      )}
    </div>
  );
}

