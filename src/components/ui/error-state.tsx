import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 rounded-xl border border-red-500/20 bg-red-500/5 my-4">
      <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-[var(--primary-text)]">{title}</h4>
      <p className="text-xs text-[var(--secondary-text)] max-w-sm mt-1 mb-4">{message}</p>
      {retry && (
        <Button variant="outline" size="sm" onClick={retry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
