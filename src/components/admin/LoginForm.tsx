"use client";
// src/components/admin/LoginForm.tsx

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const getInitialError = () => {
    if (urlError === "cookie_missing") {
      return "Authentication cookie was rejected or not sent by your browser. If accessing over Wi-Fi / LAN (HTTP), ensure cookies are enabled in your mobile browser settings.";
    }
    if (urlError === "session_invalid") {
      return "Your previous session has expired. Please sign in again.";
    }
    return "";
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>(getInitialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? `Login failed (Status: ${res.status})`);
      } else {
        // Use replace() to avoid back-button history loops.
        // A short 150ms timeout ensures WebKit on iOS / mobile Safari flushes the HTTP-only cookie before navigation.
        setTimeout(() => {
          window.location.replace("/admin");
        }, 150);
      }
    } catch (err) {
      console.error("[Login Form Error]", err);
      setError("Network error: Unable to connect to server. Please check your Wi-Fi connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 space-y-5"
    >
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm leading-relaxed"
        >
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
