import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { SourceVerification } from "@/components/learn/source-verification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HybridCloudPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Hybrid Cloud</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The core idea: Cloudflare sits at the edge as a single policy layer regardless of which backend
          actually serves a given request — on-prem, AWS, Azure, or a mix, behind one consistent set of
          security controls.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h2 className="text-base font-semibold">One edge, multiple backends</h2>
            <AsciiDiagram>
              {"Internet\n" +
                "   |\n" +
                "Cloudflare (WAF, Bot Mgmt, Rate Limiting, TLS — applied once, here)\n" +
                "   |\n" +
                "Load Balancing\n" +
                "   |\n" +
                "   +---- Pool: on-prem servers (via Cloudflare Tunnel)\n" +
                "   +---- Pool: AWS (ALB -> EC2/ECS/EKS)\n" +
                "   +---- Pool: Azure (Application Gateway -> App Service/AKS)"}
            </AsciiDiagram>
            <p className="text-sm text-muted-foreground">
              Security and TLS policy is defined once, at Cloudflare&apos;s edge — not re-implemented per
              cloud. Load Balancing steers traffic to whichever pool is healthy, and can fail over between
              on-prem and cloud (or between clouds) without any client-visible change, since the routing
              decision happens before the request leaves Cloudflare.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h2 className="text-base font-semibold">Why this is harder than it looks</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground/80">Consistent origin protection: </span>
                each pool needs its own hardening (Tunnel for on-prem, security groups/NSGs restricted to
                Cloudflare&apos;s IP ranges for cloud) — a hybrid setup multiplies the places this can be
                gotten wrong, not just the number of backends.
              </li>
              <li>
                <span className="font-medium text-foreground/80">Health checks must mean the same thing everywhere: </span>
                a lightweight health endpoint behaves differently under on-prem vs. cloud autoscaling — a
                pool that looks &quot;healthy&quot; by one definition but not the other causes uneven failover.
              </li>
              <li>
                <span className="font-medium text-foreground/80">Logging fragmentation: </span>
                without Logpush to a single SIEM, each backend&apos;s own logs tell a different, incomplete
                part of the story — centralizing via Logpush matters more here than in a single-backend setup.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h2 className="text-base font-semibold">Connecting the on-prem side</h2>
            <p className="text-sm text-muted-foreground">
              Whether the on-prem leg is a single application or a whole site depends on which pattern fits —
              see the On-Prem + Cloudflare page for the full breakdown (Tunnel for one app, Cloudflare WAN for
              whole-site connectivity, Magic Transit for whole-prefix DDoS protection).
            </p>
            <Button asChild size="sm" variant="outline" className="w-fit gap-1.5">
              <Link href="/architecture/on-prem">
                On-Prem + Cloudflare <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/scenarios#hybrid-datacenter">
            See the Hybrid Datacenter scenario <ArrowRight className="size-3.5" />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/learn/load-balancing">
            Load Balancing module <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <SourceVerification
          sources={[
            { title: "Load Balancing overview", url: "https://developers.cloudflare.com/load-balancing/", sourceType: "cloudflare-documentation" },
            { title: "Cloudflare Tunnel", url: "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/", sourceType: "cloudflare-documentation" },
            { title: "Logpush", url: "https://developers.cloudflare.com/logs/logpush/", sourceType: "cloudflare-documentation" },
          ]}
          lastVerified="2026-08-23"
        />
      </div>
    </div>
  );
}
