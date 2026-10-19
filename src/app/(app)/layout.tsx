import { AppShell } from "@/components/layout/app-shell";
import { getPersonaId } from "@/lib/twin-session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const persona = await getPersonaId();
  return <AppShell persona={persona}>{children}</AppShell>;
}
