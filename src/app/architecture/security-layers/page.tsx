import { SECURITY_LAYERS } from "@/content/architecture/security-layers";
import { AsciiDiagram } from "@/components/diagrams/ascii-diagram";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function SecurityLayersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Security Layers</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          WAF, Custom Rules, Rate Limiting, Bot Management, and DDoS protection are related but not
          interchangeable. Each answers a different question about a request.
        </p>
      </div>

      <AsciiDiagram className="mb-8">
        {"Browser -> TLS terminate -> WAF Custom Rules -> Rate Limiting -> WAF Managed Rules -> Bot Fight Mode -> Cache -> Origin\n\n" +
          "  WAF Custom Rules   \"does this violate a policy I defined?\"\n" +
          "  Rate Limiting      \"is this too much volume from this key?\"\n" +
          "  WAF Managed Rules  \"is this a known attack signature?\"\n" +
          "  Bot Fight Mode     \"is this client even human?\"\n\n" +
          "This is Cloudflare's documented phase order (developers.cloudflare.com/waf/feature-\n" +
          "interoperability/) — Rate Limiting runs before Managed Rules, which surprises most people."}
      </AsciiDiagram>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Capability</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Detection Method</TableHead>
              <TableHead>Layer</TableHead>
              <TableHead>Typical Action</TableHead>
              <TableHead>Limitations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SECURITY_LAYERS.map((row) => (
              <TableRow key={row.capability}>
                <TableCell className="font-medium">{row.capability}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.purpose}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.detectionMethod}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.layer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.typicalAction}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.limitations}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECURITY_LAYERS.map((row) => (
          <div key={row.capability} className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">{row.capability}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Example: </span>
              {row.example}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Configured via: </span>
              {row.configuration}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
