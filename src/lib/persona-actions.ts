"use server";
import { cookies } from "next/headers";
import { isDemoPersonaId } from "@/services/personas";
import { parseCustomCookie, validateCustom, type Validation } from "@/services/custom";

const OPTS = { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" as const, httpOnly: true };

export async function setPersona(id: string) {
  const jar = await cookies();
  if (isDemoPersonaId(id)) jar.set("wt_persona", id, OPTS);
  else if (id === "custom" && parseCustomCookie(jar.get("wt_custom")?.value)) jar.set("wt_persona", "custom", OPTS);
}

export async function saveCustom(raw: unknown): Promise<Validation> {
  const r = validateCustom(raw);
  if (!r.ok) return r;
  const jar = await cookies();
  jar.set("wt_custom", JSON.stringify(r.value), OPTS);
  jar.set("wt_persona", "custom", OPTS);
  return r;
}

export async function clearCustom() {
  const jar = await cookies();
  jar.delete("wt_custom");
  jar.set("wt_persona", "aarav", OPTS);
}
