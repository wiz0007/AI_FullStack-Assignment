import React from "react";
import { cn } from "@/lib/utils";

export function LoadingIndicator({
  className = "",
  label = "Loading...",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8 gap-3", className)}
      role="status"
      aria-label={label}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent)] animate-spin" />
      {label && <span className="text-xs text-[var(--secondary-text)]">{label}</span>}
    </div>
  );
}
