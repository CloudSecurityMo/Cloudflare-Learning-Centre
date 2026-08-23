// Structured content schema for every learning topic in the lab.
// New modules are added by creating a TopicContent object and registering
// it in the relevant src/content/<category>/index.ts file — no component
// changes required. See src/content/README.md for the authoring guide.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type ContentCategory = "learn" | "architecture" | "reference" | "scenarios";

// Where a Cloudflare-specific claim comes from. Per the project's source
// policy, Cloudflare-specific facts must trace back to an official
// developers.cloudflare.com (or other cloudflare.com) source — never a
// third-party tutorial, forum post, or model prior knowledge.
export type SourceType =
  | "cloudflare-documentation"
  | "cloudflare-learning-path"
  | "cloudflare-api"
  | "cloudflare-blog";

export interface LearningSource {
  title: string;
  url: string;
  sourceType: SourceType;
}

/** @deprecated use LearningSource */
export interface DocLink {
  label: string;
  url: string;
}

export interface ConceptSection {
  heading: string;
  body: string; // markdown-lite: plain text, supports \n paragraphs and `code`
  diagram?: string; // optional ASCII diagram rendered in a <pre> block
}

export interface ExampleBlock {
  title: string;
  request?: string;
  body: string;
}

export interface TradeoffOption {
  action: string;
  consequence: string;
  recommended: boolean;
}

export interface TroubleshootingCase {
  symptom: string;
  causes: string[];
  investigation: string[];
  remediation: string[];
  /** Multiple-choice "what do you investigate first?" step shown before the diagnosis is revealed. */
  hypotheses?: { text: string; correct: boolean; feedback: string }[];
  /** "What should you do?" trade-off choices, e.g. for a false-positive block. */
  tradeoffs?: TradeoffOption[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicContent {
  slug: string;
  category: ContentCategory;
  title: string;
  shortTitle?: string;
  description: string;
  difficulty: Difficulty;
  minutes: number;
  objectives: string[];
  concepts: ConceptSection[];
  examples?: ExampleBlock[];
  commonMistakes?: string[];
  troubleshooting?: TroubleshootingCase[];
  quiz?: QuizQuestion[];
  relatedTopics?: string[];
  /** @deprecated use officialSources */
  docs?: DocLink[];
  /** Official Cloudflare sources this module's claims were verified against. */
  officialSources?: LearningSource[];
  /** ISO date (YYYY-MM-DD) this module's content was last checked against officialSources. */
  lastVerified?: string;
  /** Mental Model comparisons (see content/mental-models.ts) relevant to this module. */
  mentalModelSlugs?: string[];
  /** Three-level model: where to go to practice this hands-on (Level 2 — Apply). */
  applyLabHref?: string;
  /** Three-level model: where to go to use this in a real design decision (Level 3 — Architect). */
  architectHref?: string;
  configNote?: string; // "plan/config dependent" caveat shown prominently
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  related?: string[]; // glossary terms
  topicSlug?: string; // link into a learn topic
}

export interface KnowledgeCard {
  slug: string;
  question: string;
  definition: string;
  whyItMatters: string;
  example: string;
  architecture?: string;
  misconception: string;
}

export interface ScenarioOption {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

export interface ScenarioContent {
  slug: string;
  title: string;
  summary: string;
  requirement: string;
  diagram: string;
  considerations: string[];
  recommended: string;
}
