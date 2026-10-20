import { AppShell } from "@/components/layout/app-shell";
import { getCustom, getPersona } from "@/lib/twin-session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [persona, custom] = await Promise.all([getPersona(), getCustom()]);
  return <AppShell persona={persona.id} customName={custom?.name}>{children}</AppShell>;
}
