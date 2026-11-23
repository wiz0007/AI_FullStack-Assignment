"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Server, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchResultItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  category?: string;
  companyName?: string | null;
  contextWindow?: number | null;
}

export function GlobalSearchDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    models: SearchResultItem[];
    providers: SearchResultItem[];
    companies: SearchResultItem[];
  }>({
    models: [],
    providers: [],
    companies: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef<number>(0);

  // Flattened list for keyboard navigation
  const flatItems: SearchResultItem[] = [
    ...results.models,
    ...results.providers,
    ...results.companies,
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ models: [], providers: [], companies: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced query execution with monotonic request ID race handling (S2-09)
  useEffect(() => {
    if (!query.trim()) {
      setResults({ models: [], providers: [], companies: [] });
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        if (currentRequestId === requestIdRef.current && json.success && json.data) {
          setResults({
            models: json.data.models || [],
            providers: json.data.providers || [],
            companies: json.data.companies || [],
          });
          setSelectedIndex(0);
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && currentRequestId === requestIdRef.current) {
          console.error("Global search error:", err);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        router.push(flatItems[selectedIndex].url);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary-text)] shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Global search dialog"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[var(--border-color)]">
          <Search className="w-5 h-5 text-[var(--secondary-text)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI models, providers, companies..."
            className="w-full bg-transparent text-sm placeholder-[var(--secondary-text)] text-[var(--primary-text)] focus:outline-none"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[var(--accent)] animate-spin shrink-0 ml-2" />
          )}
          {query && !isLoading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--secondary-text)]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {query.trim() === "" && (
            <div className="py-8 text-center text-xs text-[var(--secondary-text)]">
              Start typing to search across verified models and inference providers...
            </div>
          )}

          {query.trim() !== "" && !isLoading && flatItems.length === 0 && (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-medium text-[var(--primary-text)]">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[var(--secondary-text)]">
                Try searching by model name (e.g. &ldquo;GPT-4o&rdquo;), provider, or capability.
              </p>
            </div>
          )}

          {/* Models Section */}
          {results.models.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--secondary-text)] px-3">
                Models
              </span>
              {results.models.map((m, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      router.push(m.url);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[var(--secondary-surface)] text-[var(--accent)]"
                        : "hover:bg-[var(--secondary-surface)] text-[var(--primary-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                      <div>
                        <div className="text-xs font-semibold">{m.name}</div>
                        {m.companyName && (
                          <div className="text-[10px] text-[var(--secondary-text)]">
                            {m.companyName}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--secondary-text)]" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Providers Section */}
          {results.providers.length > 0 && (
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--secondary-text)] px-3">
                Providers
              </span>
              {results.providers.map((p, idx) => {
                const itemIndex = results.models.length + idx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      router.push(p.url);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[var(--secondary-surface)] text-[var(--accent)]"
                        : "hover:bg-[var(--secondary-surface)] text-[var(--primary-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-[var(--accent)]" />
                      <div className="text-xs font-semibold">{p.name}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--secondary-text)]" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Companies & Labs Section */}
          {results.companies.length > 0 && (
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--secondary-text)] px-3">
                AI Companies & Labs
              </span>
              {results.companies.map((c, idx) => {
                const itemIndex = results.models.length + results.providers.length + idx;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      router.push(c.url);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[var(--secondary-surface)] text-[var(--accent)]"
                        : "hover:bg-[var(--secondary-surface)] text-[var(--primary-text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[var(--accent)]" />
                      <div className="text-xs font-semibold">{c.name}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--secondary-text)]" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
