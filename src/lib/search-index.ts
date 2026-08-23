import { LEARN_TOPICS } from "@/content/learn";
import { GLOSSARY } from "@/content/reference/glossary";
import { KNOWLEDGE_CARDS } from "@/content/reference/cards";
import { SCENARIOS } from "@/content/scenarios";
import { LABS } from "@/lib/labs";
import { FLAT_NAV } from "@/lib/nav";

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  category: "Learn" | "Glossary" | "Knowledge Card" | "Scenario" | "Lab" | "Page";
}

let cachedIndex: SearchEntry[] | null = null;

export function getSearchIndex(): SearchEntry[] {
  if (cachedIndex) return cachedIndex;

  const entries: SearchEntry[] = [];

  for (const t of LEARN_TOPICS) {
    entries.push({ title: t.title, description: t.description, href: `/learn/${t.slug}`, category: "Learn" });
  }
  for (const g of GLOSSARY) {
    entries.push({
      title: g.term,
      description: g.definition,
      href: g.topicSlug ? `/learn/${g.topicSlug}` : `/reference/glossary#${encodeURIComponent(g.term)}`,
      category: "Glossary",
    });
  }
  for (const c of KNOWLEDGE_CARDS) {
    entries.push({ title: c.question, description: c.definition, href: `/reference/cards#${c.slug}`, category: "Knowledge Card" });
  }
  for (const s of SCENARIOS) {
    entries.push({ title: s.title, description: s.summary, href: `/scenarios#${s.slug}`, category: "Scenario" });
  }
  for (const l of LABS) {
    entries.push({ title: l.label, description: "Interactive lab", href: l.href, category: "Lab" });
  }
  // Nav items not already covered by the categories above (Architecture, Reference index pages, etc.)
  const coveredHrefs = new Set(entries.map((e) => e.href));
  for (const n of FLAT_NAV) {
    if (n.status === "soon") continue;
    if (coveredHrefs.has(n.href)) continue;
    entries.push({ title: n.label, description: "", href: n.href, category: "Page" });
  }

  cachedIndex = entries;
  return entries;
}

function normalize(s: string): string {
  return s.toLowerCase();
}

export function searchIndex(query: string, limit = 20): SearchEntry[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const index = getSearchIndex();

  const scored = index
    .map((entry) => {
      const title = normalize(entry.title);
      const desc = normalize(entry.description);
      let score = -1;
      if (title === q) score = 100;
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (desc.includes(q)) score = 20;
      return { entry, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);

  return scored.slice(0, limit).map((x) => x.entry);
}
