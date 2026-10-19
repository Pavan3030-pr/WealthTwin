"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-1 text-sm text-slate-500">The twin could not be refreshed. Your data was not affected.</p>
      <button onClick={reset} className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Try again</button>
    </div>
  );
}
