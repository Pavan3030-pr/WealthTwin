import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/goals", label: "Goals" },
];

export function Nav({ active }: { active?: string }) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-lg px-3 py-1.5 transition-colors ${
            active === l.href
              ? "bg-[var(--primary)]/10 font-medium text-[var(--primary)]"
              : "text-[var(--muted)] hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
