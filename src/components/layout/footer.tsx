import React from "react";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--surface)] text-[var(--secondary-text)] py-12 mt-auto">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-semibold text-sm text-[var(--primary-text)]">
              {appConfig.name}
            </span>
            <p className="text-xs">{appConfig.description}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            {appConfig.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[var(--primary-text)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={appConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--primary-text)] transition-colors"
            >
              GitHub
            </a>
          </div>

          <div className="text-xs text-[var(--secondary-text)]">
            © {new Date().getFullYear()} OneAtlas. All rights reserved.
          </div>
        </div>
      </Container>
    </footer>
  );
}
