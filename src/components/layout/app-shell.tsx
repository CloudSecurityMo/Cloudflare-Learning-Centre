"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ShieldHalf } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/search/command-palette";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex min-h-svh w-full">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <ShieldHalf className="size-5 text-brand" />
          <span className="text-sm font-semibold tracking-tight">Cloudflare Architecture Lab</span>
        </div>
        <div className="h-[calc(100svh-3.5rem)]">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-h-svh flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-14 items-center gap-2 border-b border-border px-4">
                  <ShieldHalf className="size-5 text-brand" />
                  <span className="text-sm font-semibold tracking-tight">Architecture Lab</span>
                </div>
                <div className="h-[calc(100svh-3.5rem)]">
                  <SidebarNav onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="text-sm font-medium lg:hidden">
              Cloudflare Architecture Lab
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <CommandPalette />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/progress">Progress</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/labs/troubleshooting">Troubleshoot</Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
