export function ScoreRing({ score, size = 168, label = "Health score" }: { score: number; size?: number; label?: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#0d9488" : score >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-4xl font-semibold text-slate-900">{score}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">of 100</span>
      </div>
    </div>
  );
}
