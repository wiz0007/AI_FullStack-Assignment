import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  return (
    <Container className="py-12 space-y-6">
      <Badge variant="accent">Sprint 1 • Layout Foundation</Badge>
      <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-text)]">
        AI Labs & Companies
      </h1>
      <p className="text-sm text-[var(--secondary-text)]">
        Frontier research organizations, lab profiles, and foundation model creators.
      </p>

      <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--secondary-surface)] text-[var(--accent)] flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <CardTitle>AI Company Directory</CardTitle>
        <CardDescription className="max-w-md">
          Company entities and relational links to foundation models are initialized in the
          database.
        </CardDescription>
      </Card>
    </Container>
  );
}
