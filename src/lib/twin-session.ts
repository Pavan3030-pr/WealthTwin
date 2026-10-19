import { cookies } from "next/headers";
import { buildTwin } from "@/services/engine";
import { isPersonaId } from "@/services/personas";
import type { PersonaId, TwinState } from "@/types/twin";

export async function getPersonaId(): Promise<PersonaId> {
  const v = (await cookies()).get("wt_persona")?.value;
  return isPersonaId(v) ? v : "aarav";
}

export async function getTwin(): Promise<TwinState> {
  return buildTwin(await getPersonaId());
}
