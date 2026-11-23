"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X, Search } from "lucide-react";
import { appConfig } from "@/config/app";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { Container } from "./container";
import { GlobalSearchDialog } from "@/components/shared/global-search-dialog";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchDialogOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--surface)]/90 backdrop-blur-md">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold tracking-tight text-lg text-[var(--primary-text)] shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                <Compass className="w-4 h-4" />
              </div>
              <span>{appConfig.name}</span>
            </Link>

            {/* Global Search Quick Trigger Bar */}
            <button
              onClick={() => setSearchDialogOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--secondary-surface)] text-xs text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:border-[var(--accent)] transition-all max-w-xs w-full"
              aria-label="Search models and providers"
            >
              <Search className="w-3.5 h-3.5 text-[var(--secondary-text)]" />
              <span className="flex-1 text-left">Search models, providers...</span>
              <kbd className="font-mono text-[10px] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                Ctrl K
              </kbd>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              {appConfig.navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--secondary-surface)] text-[var(--accent)]"
                        : "text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:bg-[var(--secondary-surface)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchDialogOpen(true)}
                className="sm:hidden p-2 rounded-lg text-[var(--secondary-text)] hover:text-[var(--primary-text)] hover:bg-[var(--secondary-surface)]"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <ThemeToggle />

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-[var(--primary-text)] hover:bg-[var(--secondary-surface)]"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Floating Overlay Menu (Floats on top, does not push page content) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Floating Menu Drawer */}
            <div className="fixed top-16 left-0 right-0 z-50 md:hidden border-b border-[var(--border-color)] bg-[var(--surface)] p-4 shadow-2xl space-y-1 animate-in slide-in-from-top-2 duration-200">
              {appConfig.navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--secondary-surface)] text-[var(--accent)] font-semibold"
                        : "text-[var(--primary-text)] hover:bg-[var(--secondary-surface)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog isOpen={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} />
    </>
  );
}
