"use client";

import React from "react";
import { Scale, Check } from "lucide-react";
import { useComparison } from "@/features/comparison/comparison-context";
import { Button } from "@/components/ui/button";

interface AddToComparisonButtonProps {
  modelId: string;
  modelName?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AddToComparisonButton({
  modelId,
  modelName,
  variant = "outline",
  size = "sm",
  className = "",
}: AddToComparisonButtonProps) {
  const { isModelSelected, addModel, removeModel } = useComparison();
  const selected = isModelSelected(modelId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      removeModel(modelId);
    } else {
      addModel(modelId);
    }
  };

  return (
    <Button
      variant={selected ? "primary" : variant}
      size={size}
      onClick={handleToggle}
      className={`gap-1.5 transition-all ${className}`}
      aria-label={
        selected
          ? `Remove ${modelName || modelId} from comparison`
          : `Add ${modelName || modelId} to comparison`
      }
    >
      {selected ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Added to Compare</span>
        </>
      ) : (
        <>
          <Scale className="w-3.5 h-3.5" />
          <span>Compare</span>
        </>
      )}
    </Button>
  );
}
