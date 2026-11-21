"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Container } from "@/components/layout/container";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <Container className="py-20 flex justify-center">
      <div className="max-w-md w-full">
        <ErrorState
          title="Unexpected Application Error"
          message="We encountered an issue while loading this page. Please try refreshing."
          retry={() => reset()}
        />
      </div>
    </Container>
  );
}
