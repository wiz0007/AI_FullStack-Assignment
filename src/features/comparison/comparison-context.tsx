"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { MAX_COMPARISON_MODELS } from "@/server/validators/model.validator";

export interface ComparisonContextType {
  selectedModelIds: string[];
  addModel: (idOrSlug: string) => boolean;
  removeModel: (idOrSlug: string) => void;
  clearComparison: () => void;
  isModelSelected: (idOrSlug: string) => boolean;
  canAddModel: boolean;
  limitReachedMessage: string | null;
  clearLimitMessage: () => void;
  maxLimit: number;
}

const defaultComparisonContext: ComparisonContextType = {
  selectedModelIds: [],
  addModel: () => false,
  removeModel: () => {},
  clearComparison: () => {},
  isModelSelected: () => false,
  canAddModel: true,
  limitReachedMessage: null,
  clearLimitMessage: () => {},
  maxLimit: MAX_COMPARISON_MODELS,
};

const ComparisonContext = createContext<ComparisonContextType>(defaultComparisonContext);

const STORAGE_KEY = "oneatlas_comparison_models";

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [limitReachedMessage, setLimitReachedMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load persisted selection from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedModelIds(parsed.slice(0, MAX_COMPARISON_MODELS));
        }
      }
    } catch (e) {
      console.warn("Could not load persisted comparison selection:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedModelIds));
    } catch (e) {
      console.warn("Could not persist comparison selection:", e);
    }
  }, [selectedModelIds, isInitialized]);

  const isModelSelected = useCallback(
    (idOrSlug: string) => {
      const target = idOrSlug.toLowerCase();
      return selectedModelIds.some((id) => id.toLowerCase() === target);
    },
    [selectedModelIds]
  );

  const canAddModel = selectedModelIds.length < MAX_COMPARISON_MODELS;

  const addModel = useCallback(
    (idOrSlug: string) => {
      const target = idOrSlug.trim();
      if (!target) return false;

      // Duplicate check (C06)
      if (selectedModelIds.some((id) => id.toLowerCase() === target.toLowerCase())) {
        return false;
      }

      // Limit check (C05)
      if (selectedModelIds.length >= MAX_COMPARISON_MODELS) {
        setLimitReachedMessage(
          `Comparison limit reached. You can compare up to ${MAX_COMPARISON_MODELS} models simultaneously. Remove an existing model to add this one.`
        );
        return false;
      }

      setSelectedModelIds((prev) => [...prev, target]);
      setLimitReachedMessage(null);
      return true;
    },
    [selectedModelIds]
  );

  const removeModel = useCallback((idOrSlug: string) => {
    const target = idOrSlug.toLowerCase();
    setSelectedModelIds((prev) => prev.filter((id) => id.toLowerCase() !== target));
    setLimitReachedMessage(null);
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedModelIds([]);
    setLimitReachedMessage(null);
  }, []);

  const clearLimitMessage = useCallback(() => {
    setLimitReachedMessage(null);
  }, []);

  return (
    <ComparisonContext.Provider
      value={{
        selectedModelIds,
        addModel,
        removeModel,
        clearComparison,
        isModelSelected,
        canAddModel,
        limitReachedMessage,
        clearLimitMessage,
        maxLimit: MAX_COMPARISON_MODELS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison(): ComparisonContextType {
  const context = useContext(ComparisonContext);
  return context || defaultComparisonContext;
}
