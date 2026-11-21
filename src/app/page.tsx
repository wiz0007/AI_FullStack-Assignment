import Link from "next/link";
import { Compass, Sparkles, Scale, Trophy, Building2, Server } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const modules = [
    {
      title: "Model Discovery",
      desc: "Explore frontier LLMs, vision models, and code models with verified context length and token pricing.",
      href: "/models",
      icon: Sparkles,
      tag: "Catalog",
    },
    {
      title: "Model Comparison",
      desc: "Compare pricing, benchmarks, reasoning capabilities, and supported modalities side by side.",
      href: "/compare",
      icon: Scale,
      tag: "Engine",
    },
    {
      title: "Rankings & Benchmarks",
      desc: "Evaluate performance across MMLU, GSM8K, HumanEval, and Math 500 leaderboards.",
      href: "/rankings",
      icon: Trophy,
      tag: "Intelligence",
    },
    {
      title: "AI Labs Directory",
      desc: "Browse AI organizations and research labs including OpenAI, Anthropic, Google, and Meta.",
      href: "/companies",
      icon: Building2,
      tag: "Directory",
    },
    {
      title: "Provider Directory",
      desc: "Discover infrastructure hostings, throughput guarantees, and availability across providers.",
      href: "/providers",
      icon: Server,
      tag: "Inference",
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <Container>
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="accent" className="px-3 py-1 text-xs uppercase tracking-wider">
            Sprint 1 • Architecture & Infrastructure Foundation
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--primary-text)] leading-tight">
            The Intelligence Platform for{" "}
            <span className="text-[var(--accent)]">Frontier AI Models</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--secondary-text)] leading-relaxed">
            Discover, evaluate, and benchmark state-of-the-art AI models across providers with
            verified pricing, multimodal specifications, and reproducible metrics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/models">
              <Button size="lg" className="px-8">
                Explore Models
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="secondary" size="lg" className="px-8">
                Compare Side-by-Side
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.title} href={m.href} className="group block">
                <Card className="h-full border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)] transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-[var(--secondary-surface)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline">{m.tag}</Badge>
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--primary-text)] group-hover:text-[var(--accent)] transition-colors">
                      {m.title}
                    </h2>
                    <p className="text-sm text-[var(--secondary-text)] leading-relaxed">{m.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
