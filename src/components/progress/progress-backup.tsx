"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function ProgressBackup() {
  const exportProgress = useProgress((s) => s.exportProgress);
  const importProgress = useProgress((s) => s.importProgress);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState<{ text: string; error: boolean } | null>(null);

  function handleExport() {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cf-architecture-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    const ok = importProgress(text);
    setMessage(
      ok
        ? { text: "Progress imported successfully.", error: false }
        : { text: "That file doesn't look like a valid progress export.", error: true }
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-semibold">Backup</div>
      <p className="text-xs text-muted-foreground">
        Progress is stored only in this browser&apos;s local storage — clearing site data deletes it. Export
        a snapshot to keep a copy, or import one to restore/transfer it.
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport}>
          <Download className="size-3.5" /> Export progress
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleImportClick}>
          <Upload className="size-3.5" /> Import progress
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>
      {message && (
        <p className={message.error ? "text-xs text-status-block" : "text-xs text-status-allow"}>{message.text}</p>
      )}
    </div>
  );
}
