"use server";
import { cookies } from "next/headers";
import { isPersonaId } from "@/services/personas";

export async function setPersona(id: string) {
  if (!isPersonaId(id)) return;
  const jar = await cookies();
  jar.set("wt_persona", id, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
}
