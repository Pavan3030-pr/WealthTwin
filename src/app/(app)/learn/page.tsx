import { getTwin } from "@/lib/twin-session";
import { PageHeader } from "@/components/ui/surface";
import { LearnList } from "@/components/twin/learn-list";
import { buildLessons } from "@/services/education";

export default async function LearnPage() {
  const t = await getTwin();
  return (
    <>
      <PageHeader eyebrow="Financial education" title="Lessons that use your own numbers" subtitle="Short, practical lessons with a quick quiz. Each one shows how the concept applies to your twin." />
      <LearnList lessons={buildLessons(t)} />
    </>
  );
}
