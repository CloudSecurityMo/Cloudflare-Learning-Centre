import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroArchitecture } from "@/components/home/hero-architecture";
import { DashboardStats } from "@/components/home/dashboard-stats";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8">
      <section className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          Cloudflare Architecture Lab
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Understand Cloudflare from DNS to the Origin.
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground">
          Learn how Cloudflare actually works by designing architectures, tracing requests, configuring
          security controls, and troubleshooting real-world scenarios.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button asChild className="gap-1.5">
            <Link href="/learn/fundamentals">
              Start Learning <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/labs/request-flow-simulator">Try the Request Simulator</Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Click any component to see where it sits, what it sees, and what it protects
        </div>
        <HeroArchitecture />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Your Progress</h2>
        <DashboardStats />
      </section>
    </div>
  );
}
