import { connection } from "next/server";
import { tick } from "@/server/orchestrator";
import { runtime } from "@/server/runtime";

/** Syncs the shop wallet and processes any new incoming memos. Safe to call repeatedly: notes are idempotent. */
export async function POST() {
  await connection();
  const rt = runtime();
  try {
    const seen = await tick(rt.deps);
    return Response.json({ ok: true, processed: seen, wallet: rt.adapters.wallet });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
