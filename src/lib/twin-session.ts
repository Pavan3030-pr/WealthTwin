import { cookies } from "next/headers";
import { buildTwin } from "@/services/engine";
import { PERSONAS } from "@/services/personas";
import { parseCustomCookie, resolvePersona, type CustomInput } from "@/services/custom";
import type { Persona, PersonaId, TwinState } from "@/types/twin";

export async function getPersona(): Promise<Persona> {
  const jar = await cookies();
  return resolvePersona(jar.get("wt_persona")?.value, jar.get("wt_custom")?.value) ?? PERSONAS.aarav;
}

export async function getPersonaId(): Promise<PersonaId> {
  return (await getPersona()).id;
}

export async function getCustom(): Promise<CustomInput | null> {
  return parseCustomCookie((await cookies()).get("wt_custom")?.value)?.input ?? null;
}

export async function getTwin(): Promise<TwinState> {
  return buildTwin(await getPersona());
}
