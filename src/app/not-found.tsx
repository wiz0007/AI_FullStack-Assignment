import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <Container className="py-24 flex justify-center">
      <div className="max-w-md w-full">
        <EmptyState
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          actionLabel="Return to Home"
          onAction={undefined}
        />
        <div className="mt-4 flex justify-center">
          <Link href="/">
            <Button variant="primary">Return to Home</Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
