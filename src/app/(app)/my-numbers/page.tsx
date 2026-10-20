import { getCustom } from "@/lib/twin-session";
import { PageHeader } from "@/components/ui/card";
import { CustomForm } from "@/components/twin/custom-form";

export default async function MyNumbersPage() {
  const initial = await getCustom();
  return (
    <>
      <PageHeader eyebrow="Your own numbers" title="Build a twin from your real finances" subtitle="Enter approximate figures and every page (forecast, simulator, goals, Copilot) recomputes for you. Takes about two minutes." />
      <CustomForm initial={initial} />
    </>
  );
}
