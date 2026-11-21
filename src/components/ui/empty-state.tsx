import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No items found",
  description = "Try adjusting your search or filters to find what you are looking for.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--surface)]">
      <div className="w-12 h-12 rounded-full bg-[var(--secondary-surface)] flex items-center justify-center text-[var(--secondary-text)] mb-4">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-[var(--primary-text)]">{title}</h4>
      <p className="text-sm text-[var(--secondary-text)] max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
