import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function ComparePage() {
  return (
    <Container className="py-12 space-y-6">
      <Badge variant="accent">Sprint 1 • Layout Foundation</Badge>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-text)]">
        Model Comparison
      </h1>
      <p className="text-sm text-[var(--secondary-text)]">
        Compare frontier LLMs side-by-side across latency, pricing, context windows, and benchmark
        scores.
      </p>

      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--secondary-surface)] text-[var(--accent)] flex items-center justify-center">
          <Scale className="w-6 h-6" />
        </div>
        <CardTitle>Comparison Engine Matrix</CardTitle>
        <CardDescription className="max-w-md">
          The underlying database schema, pricing entities, and capability relationships are
          established. Full interactive model selector will be enabled in subsequent feature
          sprints.
        </CardDescription>
      </Card>
    </Container>
  );
}
