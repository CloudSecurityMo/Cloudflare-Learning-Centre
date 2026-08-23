import { DNS_RECORD_REFERENCE } from "@/content/reference/dns-records";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DnsRecordsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">DNS Records Reference</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every core record type, its purpose, and whether it can be proxied through Cloudflare.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead className="font-mono">Example</TableHead>
              <TableHead className="w-24">Proxyable</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DNS_RECORD_REFERENCE.map((r) => (
              <TableRow key={r.type}>
                <TableCell className="font-mono font-medium">{r.type}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.purpose}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.example}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={r.proxyable ? "border-status-allow/40 text-status-allow" : "border-status-block/40 text-status-block"}
                  >
                    {r.proxyable ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
