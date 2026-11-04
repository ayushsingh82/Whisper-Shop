import { connection } from "next/server";
import { runtime } from "@/server/runtime";

export async function GET() {
  await connection(); // opt out of prerendering: this reads live process state
  const rt = runtime();
  return Response.json({ mode: "simulated", orders: rt.deps.store.all(), replies: rt.wallet.sent });
}
