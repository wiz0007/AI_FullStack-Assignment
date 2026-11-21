import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function RankingsPage() {
  return (
    <Container className="py-12 space-y-6">
      <Badge variant="accent">Sprint 1 • Layout Foundation</Badge>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-text)]">
        Rankings & Benchmarks
      </h1>
      <p className="text-sm text-[var(--secondary-text)]">
        Standardized academic evaluations across MMLU, GSM8K, HumanEval, and Math 500 datasets.
      </p>

      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--secondary-surface)] text-[var(--accent)] flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <CardTitle>Benchmark Leaderboards</CardTitle>
        <CardDescription className="max-w-md">
          Prisma models for Benchmark and ModelBenchmark with decimal scoring precision are active
          and seeded.
        </CardDescription>
      </Card>
    </Container>
  );
}
