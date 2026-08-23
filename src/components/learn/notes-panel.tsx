"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function EntryList({
  entries,
  onRemove,
  emptyLabel,
}: {
  entries: { id: string; body: string; createdAt: number }[];
  onRemove: (id: string) => void;
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {entries
        .slice()
        .reverse()
        .map((e) => (
          <div key={e.id} className="group flex items-start justify-between gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <p className="whitespace-pre-wrap">{e.body}</p>
            <button
              type="button"
              onClick={() => onRemove(e.id)}
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-status-block group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
    </div>
  );
}

export function NotesPanel({ topicSlug }: { topicSlug: string }) {
  const allNotes = useProgress((s) => s.notes);
  const allQuestions = useProgress((s) => s.openQuestions);
  const addNote = useProgress((s) => s.addNote);
  const removeNote = useProgress((s) => s.removeNote);
  const addQuestion = useProgress((s) => s.addQuestion);
  const removeQuestion = useProgress((s) => s.removeQuestion);

  const notes = React.useMemo(() => allNotes.filter((n) => n.topicSlug === topicSlug), [allNotes, topicSlug]);
  const questions = React.useMemo(
    () => allQuestions.filter((q) => q.topicSlug === topicSlug),
    [allQuestions, topicSlug]
  );

  const [noteDraft, setNoteDraft] = React.useState("");
  const [questionDraft, setQuestionDraft] = React.useState("");

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">My Notes</h3>
        <p className="text-xs text-muted-foreground">
          What you understand about this topic, in your own words. Stored locally in your browser.
        </p>
        <Textarea
          placeholder="Write what you understand so far..."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={!noteDraft.trim()}
          onClick={() => {
            addNote(topicSlug, noteDraft.trim());
            setNoteDraft("");
          }}
        >
          Save note
        </Button>
        <EntryList entries={notes} onRemove={removeNote} emptyLabel="No notes yet." />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Things I still don&apos;t understand</h3>
        <p className="text-xs text-muted-foreground">
          Track open questions to revisit — a running list of your own gaps.
        </p>
        <Textarea
          placeholder="What's still unclear about this topic?"
          value={questionDraft}
          onChange={(e) => setQuestionDraft(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={!questionDraft.trim()}
          onClick={() => {
            addQuestion(topicSlug, questionDraft.trim());
            setQuestionDraft("");
          }}
        >
          Save question
        </Button>
        <EntryList entries={questions} onRemove={removeQuestion} emptyLabel="No open questions yet." />
      </div>
    </div>
  );
}
