import { HTTP_STATUS_CODES } from "@/content/reference/codes";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function HttpStatusCodesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">HTTP Status Codes</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Standard HTTP status codes you&apos;ll see in this stack, and whether they typically originate from
          Cloudflare or from your origin.
        </p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Code</TableHead>
              <TableHead className="w-40">Label</TableHead>
              <TableHead>Meaning</TableHead>
              <TableHead className="w-28">Typical Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HTTP_STATUS_CODES.map((s) => (
              <TableRow key={s.code}>
                <TableCell className="font-mono font-medium">{s.code}</TableCell>
                <TableCell>{s.label}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.meaning}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">{s.layer}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
