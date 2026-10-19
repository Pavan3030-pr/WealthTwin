"use client";
import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Lesson } from "@/services/education";
import { cn } from "@/lib/utils";

export function LessonCard({ lesson, onDone }: { lesson: Lesson; onDone: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked === lesson.quiz.answer;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium">{lesson.level}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden="true" />{lesson.minutes} min</span>
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900">{lesson.title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{lesson.summary}</p>
        </div>
        {picked !== null && correct && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Completed" />}
      </button>
      {open && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
          {lesson.body.map((p, i) => <p key={i}>{p}</p>)}
          <div className="rounded-xl bg-teal-50 p-3.5 text-teal-900 ring-1 ring-teal-600/10">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-teal-700">In your numbers</p>
            <p>{lesson.yourNumbers}</p>
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-900">{lesson.quiz.question}</p>
            <div className="space-y-1.5">
              {lesson.quiz.options.map((o, i) => {
                const chosen = picked === i;
                const isAnswer = i === lesson.quiz.answer;
                return (
                  <button key={o} disabled={picked !== null && correct}
                    onClick={() => { setPicked(i); if (i === lesson.quiz.answer) onDone(lesson.id); }}
                    className={cn("flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition", picked === null ? "border-slate-200 hover:bg-slate-50" : chosen && isAnswer ? "border-emerald-500 bg-emerald-50" : chosen ? "border-rose-400 bg-rose-50" : "border-slate-200 opacity-70")}>
                    {o}
                    {chosen && (isAnswer ? <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <XCircle className="h-4 w-4 text-rose-500" aria-hidden="true" />)}
                  </button>
                );
              })}
            </div>
            {picked !== null && <p className={cn("mt-2 text-sm", correct ? "text-emerald-700" : "text-rose-700")}>{correct ? "Correct. " : "Not quite. "}{lesson.quiz.explain}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
