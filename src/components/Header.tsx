"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { LoopLogo } from "./LoopLogo";

const navItems = [
  { href: "/debrief", label: "Debrief" },
  { href: "/brief", label: "Brief" },
  { href: "/biblioteca", label: "Campanhas" }
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md animate-fade-slide-up">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <LoopLogo size="sm" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-200",
                  isActive
                    ? "bg-amber-500/15 text-amber-400"
                    : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-xl p-2 text-text-secondary transition-all hover:bg-white/[0.05] hover:text-text-primary sm:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background/95 backdrop-blur-md px-4 pb-4 pt-2 sm:hidden animate-fade-slide-up">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium tracking-[0.01em] transition-all duration-200",
                    isActive
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-text-secondary hover:bg-white/[0.05] hover:text-text-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
