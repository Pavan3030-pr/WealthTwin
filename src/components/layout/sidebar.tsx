"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Briefcase, Calculator, FileText, Presentation, ScrollText, LayoutDashboard, LineChart, Lightbulb, Sparkles, SlidersHorizontal, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/forecast", label: "Cashflow forecast", icon: LineChart },
  { href: "/simulator", label: "What-if simulator", icon: SlidersHorizontal },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/copilot", label: "AI Copilot", icon: Sparkles },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/report", label: "Twin report", icon: FileText },
  { href: "/my-numbers", label: "My numbers", icon: Calculator },
  { href: "/assumptions", label: "Assumptions", icon: ScrollText },
  { href: "/pitch", label: "Pitch", icon: Presentation },
];

export function NavLinks({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className={cn(orientation === "vertical" ? "flex flex-col gap-0.5" : "flex gap-1 overflow-x-auto px-3 pb-2")}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition", active ? "bg-slate-900 font-medium text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
