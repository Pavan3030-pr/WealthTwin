"use client";
import { usePathname } from "next/navigation";
import { NAV } from "./sidebar";
import { CommandMenu } from "./command-menu";
import { SyntheticBadge } from "@/components/ui/badges";

export function TopBar() {
  const path = usePathname();
  const title = NAV.find((n) => n.href === path)?.label ?? "WealthTwin";
  return (
    <div className="sticky top-0 z-20 -mx-4 hidden items-center gap-5 bg-canvas/85 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:flex lg:px-10 print:hidden!">
      <p className="w-44 shrink-0 text-base font-semibold tracking-tight text-slate-900">{title}</p>
      <div className="flex flex-1 justify-center"><CommandMenu /></div>
      <div className="flex w-44 shrink-0 justify-end"><SyntheticBadge /></div>
    </div>
  );
}
