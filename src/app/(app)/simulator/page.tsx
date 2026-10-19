import { getPersonaId } from "@/lib/twin-session";
import { PageHeader } from "@/components/ui/card";
import { WhatIfPanel } from "@/components/twin/whatif-panel";
import { todayIso } from "@/services/engine";

export default async function SimulatorPage() {
  const persona = await getPersonaId();
  return (
    <>
      <PageHeader eyebrow="What-if simulator" title="Test a decision before you make it" subtitle="Change income, spending, SIPs, or shock the market. The same engine that scores your health reruns instantly." />
      <WhatIfPanel personaId={persona} asOf={todayIso()} />
    </>
  );
}
