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
              ? "bg-teal-50 font-medium text-teal-700"
              : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
