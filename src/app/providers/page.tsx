import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server } from "lucide-react";

export default function ProvidersPage() {
  return (
    <Container className="py-12 space-y-6">
      <Badge variant="accent">Sprint 1 • Layout Foundation</Badge>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-text)]">
        Inference Providers
      </h1>
      <p className="text-sm text-[var(--secondary-text)]">
        Cloud infrastructure, hosted endpoints, and API providers offering foundation models.
      </p>

      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--secondary-surface)] text-[var(--accent)] flex items-center justify-center">
          <Server className="w-6 h-6" />
        </div>
        <CardTitle>Infrastructure Provider Directory</CardTitle>
        <CardDescription className="max-w-md">
          ModelProvider and Pricing relational schemas with multi-provider associations are
          established.
        </CardDescription>
      </Card>
    </Container>
  );
}
