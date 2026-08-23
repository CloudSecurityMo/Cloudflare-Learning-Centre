// Structured content schema for every learning topic in the lab.
// New modules are added by creating a TopicContent object and registering
// it in the relevant src/content/<category>/index.ts file — no component
// changes required. See src/content/README.md for the authoring guide.

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type ContentCategory = "learn" | "architecture" | "reference" | "scenarios";

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

export interface TroubleshootingCase {
  symptom: string;
  causes: string[];
  investigation: string[];
  remediation: string[];
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
  docs?: DocLink[];
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
