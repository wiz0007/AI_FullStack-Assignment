import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { ComparisonProvider } from "@/features/comparison/comparison-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ComparisonBar } from "@/components/comparison/comparison-bar";

export const metadata: Metadata = {
  title: "OneAtlas — AI Model Discovery & Intelligence Platform",
  description:
    "Discover, explore, compare, and evaluate frontier AI models across infrastructure providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider>
          <ComparisonProvider>
            <Navbar />
            <main className="flex-1 pb-16">{children}</main>
            <ComparisonBar />
            <Footer />
          </ComparisonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
