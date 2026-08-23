"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizAttempt {
  topicSlug: string;
  questionId: string;
  correct: boolean;
  timestamp: number;
}

export interface Note {
  id: string;
  topicSlug: string;
  body: string;
  createdAt: number;
}

export interface Question {
  id: string;
  topicSlug: string;
  body: string;
  createdAt: number;
}

interface ProgressState {
  completedTopics: Record<string, boolean>;
  labsCompleted: Record<string, boolean>;
  scenariosCompleted: Record<string, boolean>;
  visitedResources: Record<string, boolean>;
  quizAttempts: QuizAttempt[];
  notes: Note[];
  openQuestions: Question[];
  markTopicComplete: (slug: string) => void;
  markLabComplete: (slug: string) => void;
  markScenarioComplete: (slug: string) => void;
  markResourceVisited: (path: string) => void;
  toggleTopicComplete: (slug: string) => void;
  toggleLabComplete: (slug: string) => void;
  toggleScenarioComplete: (slug: string) => void;
  recordQuizAttempt: (a: QuizAttempt) => void;
  addNote: (topicSlug: string, body: string) => void;
  removeNote: (id: string) => void;
  addQuestion: (topicSlug: string, body: string) => void;
  removeQuestion: (id: string) => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedTopics: {},
      labsCompleted: {},
      scenariosCompleted: {},
      visitedResources: {},
      quizAttempts: [],
      notes: [],
      openQuestions: [],
      markTopicComplete: (slug) =>
        set((s) => ({ completedTopics: { ...s.completedTopics, [slug]: true } })),
      markLabComplete: (slug) =>
        set((s) => ({ labsCompleted: { ...s.labsCompleted, [slug]: true } })),
      markScenarioComplete: (slug) =>
        set((s) => ({ scenariosCompleted: { ...s.scenariosCompleted, [slug]: true } })),
      markResourceVisited: (path) =>
        set((s) => (s.visitedResources[path] ? s : { visitedResources: { ...s.visitedResources, [path]: true } })),
      toggleTopicComplete: (slug) =>
        set((s) => ({ completedTopics: { ...s.completedTopics, [slug]: !s.completedTopics[slug] } })),
      toggleLabComplete: (slug) =>
        set((s) => ({ labsCompleted: { ...s.labsCompleted, [slug]: !s.labsCompleted[slug] } })),
      toggleScenarioComplete: (slug) =>
        set((s) => ({ scenariosCompleted: { ...s.scenariosCompleted, [slug]: !s.scenariosCompleted[slug] } })),
      recordQuizAttempt: (a) => set((s) => ({ quizAttempts: [...s.quizAttempts, a] })),
      addNote: (topicSlug, body) =>
        set((s) => ({
          notes: [...s.notes, { id: crypto.randomUUID(), topicSlug, body, createdAt: Date.now() }],
        })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      addQuestion: (topicSlug, body) =>
        set((s) => ({
          openQuestions: [
            ...s.openQuestions,
            { id: crypto.randomUUID(), topicSlug, body, createdAt: Date.now() },
          ],
        })),
      removeQuestion: (id) =>
        set((s) => ({ openQuestions: s.openQuestions.filter((q) => q.id !== id) })),
      exportProgress: () => {
        const s = get();
        const snapshot = {
          version: 1,
          exportedAt: new Date().toISOString(),
          completedTopics: s.completedTopics,
          labsCompleted: s.labsCompleted,
          scenariosCompleted: s.scenariosCompleted,
          visitedResources: s.visitedResources,
          quizAttempts: s.quizAttempts,
          notes: s.notes,
          openQuestions: s.openQuestions,
        };
        return JSON.stringify(snapshot, null, 2);
      },
      importProgress: (json) => {
        try {
          const data = JSON.parse(json);
          if (typeof data !== "object" || data === null) return false;
          set({
            completedTopics: data.completedTopics ?? {},
            labsCompleted: data.labsCompleted ?? {},
            scenariosCompleted: data.scenariosCompleted ?? {},
            visitedResources: data.visitedResources ?? {},
            quizAttempts: Array.isArray(data.quizAttempts) ? data.quizAttempts : [],
            notes: Array.isArray(data.notes) ? data.notes : [],
            openQuestions: Array.isArray(data.openQuestions) ? data.openQuestions : [],
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "cf-architecture-lab-progress",
      // Server-rendered HTML always reflects the default (empty) state since
      // there's no localStorage on the server. If zustand auto-rehydrates on
      // the client, the very first client render already has real data,
      // which mismatches the SSR output. Skipping auto-rehydration keeps the
      // first client render identical to SSR; <ProgressHydrator> (mounted in
      // the root layout) triggers the real rehydration one tick later, after
      // hydration has already reconciled.
      skipHydration: true,
    }
  )
);
