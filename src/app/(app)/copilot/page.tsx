import { getPersonaId } from "@/lib/twin-session";
import { PageHeader } from "@/components/ui/card";
import { CopilotChat } from "@/components/twin/copilot-chat";
import { SUGGESTED_QUESTIONS } from "@/services/copilot";

export default async function CopilotPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const persona = await getPersonaId();
  return (
    <>
      <PageHeader eyebrow="AI Copilot" title="Ask in plain language" subtitle="Grounded in your twin: forecast, goals and portfolio. Try asking whether you can afford a specific purchase." />
      <div className="max-w-3xl"><CopilotChat persona={persona} suggestions={SUGGESTED_QUESTIONS} initialQuestion={q?.slice(0, 400)} /></div>
    </>
  );
}
