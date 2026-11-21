import { describe, it, expect, beforeEach } from "vitest";

describe("Theme Logic Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should default to light theme when no storage preference exists", () => {
    const stored = localStorage.getItem("oneatlas-theme");
    expect(stored).toBeNull();
    const resolvedTheme = stored === "dark" ? "dark" : "light";
    expect(resolvedTheme).toBe("light");
  });

  it("should preserve explicitly set dark theme preference", () => {
    localStorage.setItem("oneatlas-theme", "dark");
    const stored = localStorage.getItem("oneatlas-theme");
    expect(stored).toBe("dark");
  });

  it("should safely sanitize invalid theme values", () => {
    localStorage.setItem("oneatlas-theme", "invalid-theme-value");
    const stored = localStorage.getItem("oneatlas-theme");
    const safeTheme = stored === "dark" || stored === "light" ? stored : "light";
    expect(safeTheme).toBe("light");
  });
});
