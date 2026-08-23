import { GLOSSARY } from "@/content/reference/glossary";

export interface InlineLinkTarget {
  term: string;
  href: string;
}

let cachedTargets: InlineLinkTarget[] | null = null;

/** Longest-term-first so "Bot Management" matches before the bare word "Bot" would. */
function getTargets(): InlineLinkTarget[] {
  if (cachedTargets) return cachedTargets;
  cachedTargets = GLOSSARY.map((g) => ({
    term: g.term,
    href: g.topicSlug ? `/learn/${g.topicSlug}` : `/reference/glossary#${encodeURIComponent(g.term)}`,
  })).sort((a, b) => b.term.length - a.term.length);
  return cachedTargets;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface TextSegment {
  text: string;
  href?: string;
}

/**
 * Splits `text` into plain and linkable segments, matching known glossary
 * terms as whole words (case-insensitive). `alreadyLinked` is a Set shared
 * across an entire page render so each term is only ever linked once —
 * repeating the same link on every paragraph would just be noise. Terms
 * matching `excludeHref` (the current page) are left as plain text so a
 * page never links to itself.
 */
function linkifySegments(text: string, alreadyLinked: Set<string>, excludeHref?: string): TextSegment[] {
  const targets = getTargets().filter((t) => t.href !== excludeHref);
  if (targets.length === 0) return [{ text }];

  const pattern = new RegExp(`\\b(${targets.map((t) => escapeRegExp(t.term)).join("|")})\\b`, "gi");
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const matchedText = match[0];
    const key = matchedText.toLowerCase();
    const target = targets.find((t) => t.term.toLowerCase() === key);

    if (!target || alreadyLinked.has(key)) continue;

    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }
    segments.push({ text: matchedText, href: target.href });
    alreadyLinked.add(key);
    lastIndex = match.index + matchedText.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ text }];
}

/**
 * Linkifies a whole page's worth of paragraphs in one pure pass, deduping
 * glossary terms across all of them. Doing this eagerly (rather than
 * threading a mutable `Set` through separate per-paragraph component
 * renders) keeps it a pure function of its inputs — React is free to
 * re-render any component any number of times without the result drifting.
 */
export function linkifyParagraphs(paragraphs: string[], excludeHref?: string): TextSegment[][] {
  const alreadyLinked = new Set<string>();
  return paragraphs.map((p) => linkifySegments(p, alreadyLinked, excludeHref));
}
