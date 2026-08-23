"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col gap-6 p-4 pb-10">
        {NAV.map((group) => (
          <div key={group.label}>
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.status === "soon" && (
                      <Badge variant="outline" className="ml-2 shrink-0 px-1.5 py-0 text-[10px] font-normal text-muted-foreground">
                        soon
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
