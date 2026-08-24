import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroArchitecture } from "@/components/home/hero-architecture";
import { DashboardStats } from "@/components/home/dashboard-stats";
import { NetworkBackground } from "@/components/home/network-background";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage: "radial-gradient(ellipse 100% 100% at center, black 75%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 100% at center, black 75%, transparent 100%)",
        }}
      >
        <NetworkBackground className="size-full" />
      </div>

      <div className="flex flex-col gap-14 py-12">
        <section className="flex min-h-[22rem] flex-col items-center justify-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            Architecture, Security &amp; Troubleshooting Lab
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Understand Cloudflare from DNS to the Origin.
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground">
            Not another docs mirror. Trace requests, inspect why each security decision was made, protect an
            origin, troubleshoot real incidents, and design architectures — content verified against official
            Cloudflare documentation, not third-party guides.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button asChild className="gap-1.5">
              <Link href="/learn/fundamentals">
                Start Learning <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/labs/request-flow-simulator">Try the Request Decision Engine</Link>
            </Button>
          </div>
        </section>

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
}
