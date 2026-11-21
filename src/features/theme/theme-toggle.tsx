"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`w-9 h-9 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] flex items-center justify-center opacity-0 ${className}`}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      className={`w-9 h-9 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary-text)] hover:bg-[var(--secondary-surface)] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-[var(--primary-text)]" aria-hidden="true" />
      ) : (
        <Sun className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
      )}
    </button>
  );
}
