import { AssumptionsNote } from "@/components/ui/assumptions-note";
import { getPersona } from "@/lib/twin-session";
import { PageHeader } from "@/components/ui/surface";
import { WhatIfPanel } from "@/components/twin/whatif-panel";
import { todayIso } from "@/services/engine";

export default async function SimulatorPage() {
  const persona = await getPersona();
  return (
    <>
      <PageHeader eyebrow="What-if simulator" title="Test a decision before you make it" subtitle="Change income, spending, SIPs, or shock the market. The same engine that scores your health reruns instantly." />
      <WhatIfPanel persona={persona} asOf={todayIso()} />
      <AssumptionsNote><p>Every lever re-runs the full twin: income and spending change the forecast and score; extra SIP flows to your second goal; a market fall cuts equity holdings immediately; expected equity return changes goal projections only.</p></AssumptionsNote>
    </>
  );
}
