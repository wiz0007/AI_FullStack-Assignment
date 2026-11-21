import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";

export default function ModelsPage() {
  const sampleModels = [
    {
      name: "GPT-4o",
      company: "OpenAI",
      context: "128k",
      pricing: "$2.50 / $10.00",
      type: "Multimodal",
      capabilities: ["Reasoning", "Code", "Vision", "Audio"],
    },
    {
      name: "Claude 3.5 Sonnet",
      company: "Anthropic",
      context: "200k",
      pricing: "$3.00 / $15.00",
      type: "Multimodal",
      capabilities: ["Reasoning", "Code", "Vision"],
    },
    {
      name: "Gemini 1.5 Pro",
      company: "Google",
      context: "2,000k",
      pricing: "$1.25 / $5.00",
      type: "Multimodal",
      capabilities: ["Reasoning", "Code", "Vision", "Audio"],
    },
    {
      name: "Llama 3.1 405B",
      company: "Meta AI",
      context: "128k",
      pricing: "$3.00 / $3.00",
      type: "Chat",
      capabilities: ["Reasoning", "Code", "Open-Weights"],
    },
    {
      name: "DeepSeek-V3",
      company: "DeepSeek",
      context: "128k",
      pricing: "$0.27 / $1.10",
      type: "Chat",
      capabilities: ["Reasoning", "Code", "MoE Architecture"],
    },
  ];

  return (
    <Container className="py-12 space-y-8">
      <div>
        <Badge variant="accent" className="mb-2">
          Foundation • Sprint 1
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--primary-text)]">
          AI Models Directory
        </h1>
        <p className="text-sm text-[var(--secondary-text)] mt-1">
          Explore and filter frontier language and multimodal models with verified specifications.
        </p>
      </div>

      <div className="max-w-md">
        <SearchInput placeholder="Search models by name, company, or capability..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleModels.map((m) => (
          <Card key={m.name} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{m.company}</Badge>
                <span className="text-xs font-mono text-[var(--secondary-text)]">
                  {m.context} ctx
                </span>
              </div>
              <CardTitle className="mt-2">{m.name}</CardTitle>
              <CardDescription>{m.type} model architecture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs font-medium text-[var(--secondary-text)]">
                Pricing (In / Out per 1M):{" "}
                <span className="text-[var(--primary-text)] font-semibold">{m.pricing}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.capabilities.map((cap) => (
                  <Badge key={cap} variant="default" className="text-[10px]">
                    {cap}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
