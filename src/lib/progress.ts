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
  quizAttempts: QuizAttempt[];
  notes: Note[];
  openQuestions: Question[];
  markTopicComplete: (slug: string) => void;
  markLabComplete: (slug: string) => void;
  markScenarioComplete: (slug: string) => void;
  recordQuizAttempt: (a: QuizAttempt) => void;
  addNote: (topicSlug: string, body: string) => void;
  removeNote: (id: string) => void;
  addQuestion: (topicSlug: string, body: string) => void;
  removeQuestion: (id: string) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completedTopics: {},
      labsCompleted: {},
      scenariosCompleted: {},
      quizAttempts: [],
      notes: [],
      openQuestions: [],
      markTopicComplete: (slug) =>
        set((s) => ({ completedTopics: { ...s.completedTopics, [slug]: true } })),
      markLabComplete: (slug) =>
        set((s) => ({ labsCompleted: { ...s.labsCompleted, [slug]: true } })),
      markScenarioComplete: (slug) =>
        set((s) => ({ scenariosCompleted: { ...s.scenariosCompleted, [slug]: true } })),
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
    }),
    { name: "cf-architecture-lab-progress" }
  )
);
