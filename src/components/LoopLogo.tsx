"use client";

interface LoopLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoopLogo({ className = "", size = "md" }: LoopLogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 40, text: "text-3xl" }
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <a href="/" className={`flex items-center gap-2.5 group ${className}`}>
      {/* Animated Loop Icon */}
      <div className="relative flex-shrink-0">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-loop-glow"
          style={{ animationDuration: "3s" }}
        >
          {/* Outer glow ring */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="rgba(245,158,11,0.12)"
            strokeWidth="1"
            fill="none"
          />
          {/* Infinity loop path */}
          <path
            d="M13 20C13 15.5 16.5 12 20 12C23.5 12 27 15.5 27 20C27 24.5 23.5 28 20 28C16.5 28 13 24.5 13 20Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="text-amber-400"
            style={{
              animation: "loop-spin 6s linear infinite",
              transformOrigin: "20px 20px"
            }}
          />
          {/* Left arrow */}
          <path
            d="M9 20L6 17M9 20L6 23M9 20L13 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400"
            style={{
              animation: "loop-spin 6s linear infinite reverse",
              transformOrigin: "20px 20px"
            }}
          />
          {/* Right arrow */}
          <path
            d="M31 20L34 17M31 20L34 23M31 20L27 20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-400"
            style={{
              animation: "loop-spin 6s linear infinite",
              transformOrigin: "20px 20px"
            }}
          />
        </svg>
      </div>

      {/* Brand name */}
      <span
        className={`${textSize} font-display font-semibold tracking-tight text-text-primary group-hover:text-amber-400 transition-colors duration-300`}
        style={{ letterSpacing: "-0.03em" }}
      >
        <span className="text-amber-400">Brief</span>
        <span className="text-text-primary">Loop</span>
      </span>
    </a>
  );
}
