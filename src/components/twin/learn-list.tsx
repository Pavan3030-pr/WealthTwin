"use client";
import { useState } from "react";
import type { Lesson } from "@/services/education";
import { LessonCard } from "./lesson-card";

export function LearnList({ lessons }: { lessons: Lesson[] }) {
  const [done, setDone] = useState<string[]>([]);
  const pct = Math.round((done.length / lessons.length) * 100);
  return (
    <>
      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4">
        <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-slate-800">Your progress</span><span className="num text-slate-500">{done.length} of {lessons.length} complete</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress">
          <div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l) => <LessonCard key={l.id} lesson={l} onDone={(id) => setDone((d) => (d.includes(id) ? d : [...d, id]))} />)}
      </div>
    </>
  );
}
