// src/components/brand/Logo.tsx – Official MAHIRAANI 7-Petal Lotus Brand Logo
import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "wine" | "light" | "gold";
  showWordmark?: boolean;
  tagline?: string;
  href?: string;
  className?: string;
}

export function LotusEmblem({
  className = "w-7 h-7",
  variant = "wine",
}: {
  className?: string;
  variant?: "wine" | "light" | "gold";
}) {
  const isLight = variant === "light";
  const strokeColor = isLight ? "#FAF8F4" : "#6B2737";
  const goldColor = isLight ? "#D4AB48" : "#B8922A";
  const petalFill = isLight ? "rgba(250, 248, 244, 0.12)" : "rgba(244, 230, 234, 0.65)";

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`goldGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2C168" />
          <stop offset="50%" stopColor={goldColor} />
          <stop offset="100%" stopColor="#9E7728" />
        </linearGradient>
      </defs>

      {/* ── 7-PETAL SACRED LOTUS MOTIF ── */}

      {/* Petal 1: Outer Base Left */}
      <path
        d="M 46 73 C 30 73, 14 68, 11 58 C 11 54, 22 52, 34 60 C 40 64, 44 69, 46 73 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 7: Outer Base Right */}
      <path
        d="M 54 73 C 70 73, 86 68, 89 58 C 89 54, 78 52, 66 60 C 60 64, 56 69, 54 73 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 2: Mid-Spread Left */}
      <path
        d="M 47 71 C 33 66, 17 52, 19 38 C 24 38, 33 46, 42 58 C 45 63, 46 68, 47 71 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 6: Mid-Spread Right */}
      <path
        d="M 53 71 C 67 66, 83 52, 81 38 C 76 38, 67 46, 58 58 C 55 63, 54 68, 53 71 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 3: Inner Upper Left */}
      <path
        d="M 48 70 C 41 57, 28 41, 33 24 C 39 27, 45 42, 49 59 C 49 64, 48 68, 48 70 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 5: Inner Upper Right */}
      <path
        d="M 52 70 C 59 57, 72 41, 67 24 C 61 27, 55 42, 51 59 C 51 64, 52 68, 52 70 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Petal 4: Central Crown Petal (Upright) */}
      <path
        d="M 50 12 C 43 28, 42 50, 50 71 C 58 50, 57 28, 50 12 Z"
        fill={petalFill}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Petal Golden Vein */}
      <path
        d="M 50 19 L 50 62"
        stroke={`url(#goldGrad-${variant})`}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="1 3"
      />

      {/* Lotus Golden Calyx / Base Arc */}
      <path
        d="M 42 74 C 46 78, 54 78, 58 74"
        stroke={`url(#goldGrad-${variant})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Sacred Golden Bindu (Gem Droplets) */}
      <circle cx="50" cy="62" r="3" fill={`url(#goldGrad-${variant})`} />
      <circle cx="50" cy="52" r="1.6" fill={`url(#goldGrad-${variant})`} />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "wine",
  showWordmark = true,
  tagline,
  href = "/",
  className = "",
}: LogoProps) {
  const isLight = variant === "light";

  const emblemSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7 sm:w-8 sm:h-8",
    lg: "w-10 h-10 sm:w-12 sm:h-12",
    xl: "w-14 h-14 sm:w-16 sm:h-16",
  };

  const textSizes = {
    sm: "text-lg tracking-[0.2em]",
    md: "text-2xl sm:text-[26px] tracking-[0.24em]",
    lg: "text-3xl sm:text-4xl tracking-[0.26em]",
    xl: "text-4xl sm:text-5xl tracking-[0.28em]",
  };

  const textColor = isLight
    ? "text-[#FAF8F4] group-hover:text-white"
    : "text-[#6B2737] group-hover:text-[#521c29]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group transition-colors ${className}`}>
      <LotusEmblem className={`${emblemSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`} variant={variant} />
      {showWordmark && (
        <div className="text-left flex flex-col justify-center">
          <span className={`block font-serif ${textSizes[size]} font-medium uppercase leading-none transition-colors ${textColor}`}>
            MAHIRAANI
          </span>
          {tagline && (
            <span
              className={`block text-[8px] sm:text-[9px] uppercase tracking-[0.3em] font-medium mt-1 ${
                isLight ? "text-[#D4AB48]" : "text-[#B8922A]"
              }`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="MAHIRAANI Homepage">
        {content}
      </Link>
    );
  }

  return content;
}

